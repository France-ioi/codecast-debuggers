import fs from 'fs';
import path from 'path';
// import { getDiff, applyDiff } from 'recursive-diff';
// import produce, { Patch, enablePatches } from 'immer';
import { LogLevel, SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import process from 'process';
import { StepSnapshot, TerminationMessage, getSnapshot } from '../snapshot';
import { config } from '../config';

// enablePatches();

/**
 * Type for elements which can be cleaned up when the runner is destroyed
 */
export interface Cleanable {
  kill?: () => void,
  unsubscribe?: () => void,
  path?: string,
}

export class CompilationError extends Error {}

export interface MakeRunnerConfig {

  /**
   * Allow per debugger to define how to connect to the Debug Adapter Protocol server.
   * For some it might be a combination of spawning a server and launching the socket debug client
   * For others it might be only attaching the socket debug client
   * Let each debugger also take care of other implementation details like emitting outputs, launching processes or
   * executing reverse queries, etc.
   */
  connect: (input: {
    uid: number,

    /**
     * Runner implementations can push subprocesses, subscribers and temporary files in that array
     * They will be cleaned up when the runner is destroyed
     */
    cleanables: Cleanable[],

    programPath: string,
    inputPath: string,
    logLevel: LogLevel,

    /**
     * Let each runner implementation determine how to retrieve outputs, then pass any output to this callback,
     * outputs will be added to the result by the runner
     */
    onOutput: (output: Output) => void,

    /**
     * Hook to be executed in runner implementations _before_ calling client.initialize()
     */
    beforeInitialize: (client: SocketDebugClient) => void,
  }) => Promise<{
    client: SocketDebugClient,
  }>,

  /**
   * Predicates to determine whether to keep a stack frame in the list and retrieve its details.
   */
  canDigStackFrame?: RunStepContext['canDigStackFrame'],

  /**
   * Predicates to determine whether to keep a variable in the list and retrieve its details.
   * This predicate is injected to allow customization per language.
   */
  canDigScope?: RunStepContext['canDigScope'],

  /**
   * Predicates to determine whether to keep a variable in the list and retrieve its details.
   * This predicate is injected to allow customization per language
   */
  canDigVariable?: RunStepContext['canDigVariable'],

  /**
   * Custom handler for program termination
   */
  terminationHandler?: (lastOutput: { stdout: string[], stderr: string[] }, exitCode?: number) => TerminationMessage,

  /**
   * For some languages, extra steps are required to clean up the env.
   * For instance, for compiled languages, the runner will remove compiled files.
   */
  afterDestroy?: () => Promise<void>,
}
interface File {

  /**
   * a path relative to the project root.
   */
  relativePath: string,
}

export interface RunnerOptions {
  uid: number,
  main: File,
  inputPath: string,
  files: Array<File>,
  logLevel?: 'On' | 'Off',
  breakpoints: string,
  onTerminate: (message: TerminationMessage) => void,
  onSnapshot: (snapshot: StepSnapshot) => void,
}

/**
 * Context that will be passed through every debugging extract step (stack frame, scope, variable)
 */
export interface RunStepContext {
  client: SocketDebugClient,
  canDigStackFrame: (stackFrame: DebugProtocol.StackFrame) => boolean,
  canDigScope: (scope: DebugProtocol.Scope) => boolean,
  canDigVariable: (variable: DebugProtocol.Variable) => boolean,
  breakpoints: string,
  onSnapshot: RunnerOptions['onSnapshot'],
}

export interface Runner {
  setSpeed: (speed?: number) => void,
  stepIn: () => Promise<void>,
  stepOut: () => Promise<void>,
  stepOver: () => Promise<void>,
  terminate: () => Promise<void>,
}

export type RunnerFactory = (options: RunnerOptions) => Promise<Runner>;

/**
 * Used by a factory to create a runner per debugger based on the language
 * @param {MakeRunnerConfig} config Injected config per debugger
 * @returns {RunnerFactory} runner
 */
export const makeRunner = ({
  connect,
  afterDestroy = (): Promise<void> => Promise.resolve(),
  canDigStackFrame = (): boolean => true,
  canDigScope = (): boolean => true,
  canDigVariable = (): boolean => true,
  terminationHandler,
}: MakeRunnerConfig): RunnerFactory => {
  const destroyed = false;
  const lastOutput = {
    stdout: [] as string[],
    stderr: [] as string[],
  };
  const onOutput: Parameters<MakeRunnerConfig['connect']>[0]['onOutput'] = output => {
    logger.debug('Add stdout:', output);
    if (output.category === 'stdout') {
      lastOutput.stdout = [ ...lastOutput.stdout, output.output ];
    }
    if (output.category === 'stderr') {
      lastOutput.stderr = [ ...lastOutput.stderr, output.output ];
    }
  };

  return async (options: RunnerOptions) => {
    const cleanables: Cleanable[] = [];
    const programPath = path.resolve(process.cwd(), options.main.relativePath);
    let lastThreadId = 1;
    let speed = 1, stepsDone = 0;

    /**
     * Overview:
     * The aim of the runner is to execute then extract all the debug steps and return them when done.
     *
     * Implementation detail:
     * 1. Retrieve the socket debug client, register events and more importantly the onTerminated
     * 2. Register the onStopped listener, see below
     * 3. Set breakpoints at every line because we don't know where the code will stop first
     * 4. Call `configurationDone` to start the debug session
     * 5. The client will stop on first breakpoint, call the onStopped listener which will:
     *    → Retrieve stack trace, and for each stack trace:
     *      → Retrieve stackframes, and for each stack frame
     *        → Retrieve scopes, and for each scope:
     *          → Retrieve variables & their details
     *    Push the result to an accumulator, then
     *    Step in or out considering if we are debugging a source file or not
     *    By stepping in/out, it will trigger the `onStopped` listener again (step 5.)
     * 6. When the `onTerminated` event is triggered
     *    - resolve steps
     *    - destroy
     *    - return the accumulated steps.
     */

    async function onEnd(exitCode?: number): Promise<void> {
      logger.debug('[runner] onEnd');
      if (terminationHandler) {
        options.onTerminate(terminationHandler(lastOutput, exitCode));
      } else {
        if (exitCode !== undefined && exitCode !== 0) {
          let msg = 'Program ended with an error';
          if (lastOutput.stderr.length > 0) {
            msg += ':\n' + lastOutput.stderr.join('');
          }
          options.onTerminate({ type: 'terminated', message: msg });
        } else {
          options.onTerminate({ type: 'end', message: 'Program ended' });
        }
      }
      await destroy('onEnd', { destroyed, client, cleanables, programPath, afterDestroy });
    }

    logger.debug(1, '[runner] connect()');

    // Using an intermediate variable to avoid typing issues
    let connectResult;

    try {
      connectResult = await connect({
        uid: options.uid,
        cleanables,
        programPath,
        inputPath: options.inputPath,
        logLevel: LogLevel[options.logLevel ?? 'Off'],
        onOutput,
        beforeInitialize: client => registerEvents(client, onEnd),
      });
    } catch (error) {
      if (error instanceof CompilationError) {
        options.onTerminate({ type: 'terminated', message: error.message });

        await destroy('runSteps', { destroyed, client: null, cleanables, programPath, afterDestroy });

        // TODO :: What should we return?
        return {
          setSpeed,
          stepIn,
          stepOut,
          stepOver,
          terminate,
        };
      } else {
        throw error;
      }
    }
    const { client } = connectResult;

    let breakpointsEnabled = false;

    const subscriber = client.onStopped(stoppedEvent => {
      logger.debug('[Event] Stopped', stoppedEvent);
      if (stoppedEvent.reason == 'signal') {
        options.onTerminate({ type: 'signal', message: stoppedEvent.text || '' });

        return;
      }

      if (typeof stoppedEvent.threadId !== 'number') {
        return;
      }
      const threadId: number = stoppedEvent.threadId;

      const reasons = [ 'breakpoint', 'step' ];
      if (!reasons.includes(stoppedEvent.reason)) {
        return;
      }

      lastThreadId = threadId;

      function onSnapshot(snapshot: StepSnapshot): void {
        // Remove all breakpoints now that the program stopped somewhere
        // allows stepOver to work
        if (options.breakpoints == '*' && breakpointsEnabled) {
          void setBreakpoints({ client, programPath, breakpoints: '' });
        }

        stepsDone += 1;
        if (stepsDone >= speed) {
          stepsDone = 0;
          snapshot.stdout = lastOutput.stdout;
          snapshot.stderr = lastOutput.stderr;
          lastOutput.stdout = [];
          lastOutput.stderr = [];
          logger.debug('onSnapshot');
          logger.dir(snapshot, { colors: true, depth: 10 });
          options.onSnapshot(snapshot);
        } else {
          void client.stepIn({ threadId, granularity: 'instruction' });
        }
      }

      const snapshotParams = {
        filePaths: [ options.main, ...options.files ].map(file => path.resolve(process.cwd(), file.relativePath)),
        context: { client, canDigStackFrame, canDigScope, canDigVariable, breakpoints: options.breakpoints, onSnapshot: onSnapshot },
        threadId,
        fullSnapshot: stepsDone + 1 >= speed,
      };

      void getAndProcessSnapshot(snapshotParams);
    });
    cleanables.push(subscriber);

    logger.debug(2, '[runner] setBreakpoints()');
    await setBreakpoints({ client, programPath, breakpoints: options.breakpoints });
    breakpointsEnabled = true;

    logger.debug(3, '[runner] Configuration Done');
    // send 'configuration done' (in some debuggers this will trigger 'continue' if attach was awaited)
    await client.configurationDone({});

    logger.debug(4, '[runner] Runner ready');

    function setSpeed(newSpeed?: number): void {
      speed = Math.max(1, Math.floor(newSpeed || 1));
    }

    async function stepIn(): Promise<void> {
      await client.stepIn({ threadId: lastThreadId, granularity: 'instruction' });
    }

    async function stepOut(): Promise<void> {
      await client.stepOut({ threadId: lastThreadId, granularity: 'instruction' });
    }

    async function stepOver(): Promise<void> {
      await client.next({ threadId: lastThreadId, granularity: 'instruction' });
    }

    async function terminate(): Promise<void> {
      logger.debug(5, '[runner] destroy');

      try {
        await destroy('runSteps', { destroyed, client, cleanables, programPath, afterDestroy });
      } catch {
      // silence is golden.
      }
    }

    // Clear any debugger output before starting
    lastOutput.stdout = [];
    lastOutput.stderr = [];

    return {
      setSpeed,
      stepIn,
      stepOut,
      stepOver,
      terminate,
    };
  };
};


type Output = DebugProtocol.OutputEvent['body'];

interface DestroyParams {
  client: SocketDebugClient|null,
  destroyed: boolean,
  cleanables: Cleanable[],
  programPath: string,
  afterDestroy: () => Promise<void>,
}

async function destroy(origin: string, { destroyed, cleanables, client, afterDestroy }: DestroyParams): Promise<void> {
  if (destroyed) {
    return logger.debug('[StepsRunner] destroy already performed');
  }

  logger.debug('\n');
  logger.debug(`[StepsRunner] Destroy ⋅ ${origin}`);

  function clean(cleanable: Cleanable): void {
    if (cleanable.kill) {
      cleanable.kill();
    }
    if (cleanable.unsubscribe) {
      cleanable.unsubscribe();
    }
    if (cleanable.path) {
      if (!fs.existsSync(cleanable.path)) {
        return;
      }
      if (!cleanable.path.startsWith(config.dataPath)) {
        // Safety check that it's in the dataPath
        return;
      }
      if (fs.lstatSync(cleanable.path).isDirectory()) {
        fs.rmSync(cleanable.path, { recursive: true });
      } else {
        fs.unlinkSync(cleanable.path);
      }
    }
  }
  // Clean subscribers
  cleanables.filter(c => c.unsubscribe).forEach(clean);

  // Clean subprocesses
  cleanables.filter(c => !c.unsubscribe && c.kill).forEach(clean);

  // Clean files
  cleanables.filter(c => !c.unsubscribe && !c.kill).forEach(clean);
  if (client) {
    client.disconnectAdapter();
    await client.disconnect({}).catch(() => { /* throws if already disconnected */ });
  }
  await afterDestroy();
  destroyed = true;
}

interface SetBreakpointsConfig {
  client: SocketDebugClient,
  programPath: string,
  breakpoints: string,
}

/**
 * Set breakpoint on every line because we cannot know in advance at which line the program will stop first
 * @param {SetBreakpointsConfig} config
 * @returns {Promise<void>} returns resolving promise when done.
 */
async function setBreakpoints({ client, programPath, breakpoints }: SetBreakpointsConfig): Promise<void> {
  logger.debug('[StepsRunner] set breakpoints', programPath);
  const programCode = await fs.promises.readFile(programPath, 'utf-8');
  const lines = programCode.split('\n').length;

  let breakpointsDef: DebugProtocol.SourceBreakpoint[] = [];
  if (breakpoints == '*') {
    breakpointsDef = Array.from({ length: lines }, (_, i) => ({ line: i + 1, column: -1 }));
  } else if (breakpoints) {
    breakpointsDef = breakpoints.split(',').map(line => ({ line: parseInt(line) }));
  }

  logger.debug('[StepsRunner] set breakpoints', breakpointsDef);
  const response = await client.setBreakpoints({
    breakpoints: breakpointsDef,
    source: {
      path: programPath,
    },
  });
  logger.debug('[StepsRunner] set breakpoints intermediate response', response);

  // TODO :: do we really need to eliminate non-verified breakpoints? seems to cause issues with java-debug
  // const verifiedBreakpoints = response.breakpoints
  //   .filter(breakpoint => breakpoint.verified && typeof breakpoint.line === 'number')
  //   .map(({ line }) => ({ line: line as number }));

  // if (verifiedBreakpoints.length === breakpointsDef.length) {
  //   return;
  // }

  // response = await client.setBreakpoints({
  //   breakpoints: verifiedBreakpoints,
  //   source: { path: programPath },
  // });

  // logger.debug('[StepsRunner] set breakpoints response', response);
}

/**
 * Most important part is registering the `onTerminated` event which allows to end steps crawling
 * The other registered events are only for debugging purpose
 * @param {SocketDebugClient} client
 * @param {() => void} onTerminated
 */
const registerEvents = (client: SocketDebugClient, onTerminated: (exitCode?: number) => Promise<void>): void => {
  client.onContinued(event => logger.debug('[Event] Continued', event));
  client.onExited(event => {
    logger.debug('[Event] Exited', event.exitCode);
    void onTerminated(event.exitCode);
  });
  client.onOutput(({ output, ...event }) => logger.debug('[Event] Output', JSON.stringify(output), event));
  client.onTerminated(event => {
    logger.debug('[Event] Terminated', event ?? '');
    void onTerminated();
    client.disconnectAdapter();
  });

  client.onThread(thread => {
    logger.debug('[Event] Thread', thread);
  });
};

interface GetAndProcessSnapshotParams {

  /**
   * absolute paths
   */
  filePaths: string[],
  context: RunStepContext,
  threadId: number,
  fullSnapshot: boolean,
}

async function getAndProcessSnapshot({ context, filePaths, threadId, fullSnapshot }: GetAndProcessSnapshotParams): Promise<void> {
  try {
    logger.debug('getAndProcessSnapshot', threadId);
    const snapshot = await getSnapshot({ context, filePaths, threadId, fullSnapshot });

    // Check that the top stack frame is a user frame, otherwise step out
    if (snapshot.stackFrames && snapshot.stackFrames[0]?.userFrame) {
      context.onSnapshot({ ...snapshot, stackFrames: snapshot.stackFrames.filter(frame => frame.userFrame) });
    } else {
      await context.client.stepOut({ threadId, granularity: 'instruction' });
    }
  } catch (error) {
    logger.debug('getSnapshot Failed', error);
  }
}

