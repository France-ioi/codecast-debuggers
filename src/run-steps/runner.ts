import fs from 'fs';
import path from 'path';
// import { getDiff, applyDiff } from 'recursive-diff';
// import produce, { Patch, enablePatches } from 'immer';
import { LogLevel, SocketDebugClient, Unsubscribable } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Stream } from 'stream';
import process from 'process';
import { StepSnapshot, TerminationMessage, getSnapshot } from '../snapshot';

// enablePatches();

export interface Subprocess {
  kill: () => void,
}

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
     * Runner implementations can push sub processes in that array, they will be killed when the runner is destroyed
     */
    processes: Subprocess[],

    /**
     * Runner implementations can push subscribers, they will will be unsubscribed when the runner is destroyed
     */
    subscribers: Unsubscribable[],
    programPath: string,
    inputStream: Stream|null,
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
  inputStream: Stream|null,
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
  canDigVariable: (variable: DebugProtocol.Variable) => boolean,
  canDigScope: (scope: DebugProtocol.Scope) => boolean,
  breakpoints: string,
  onSnapshot: RunnerOptions['onSnapshot'],
}

export interface Runner {
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
  canDigScope = (): boolean => true,
  canDigVariable = (): boolean => true,
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
    const processes: Subprocess[] = [];
    const subscribers: Unsubscribable[] = [];
    const programPath = path.resolve(process.cwd(), options.main.relativePath);
    let lastThreadId = 1;

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
      if (exitCode !== undefined && exitCode !== 0) {
        let msg = 'Program ended with an error';
        if (lastOutput.stderr.length > 0) {
          msg += ': \n' + lastOutput.stderr.join('');
        }
        options.onTerminate({ type: 'terminated', message: msg });
      } else {
        options.onTerminate({ type: 'end', message: 'Program ended' });
      }
      await destroy('onEnd', { destroyed, client, processes, programPath, subscribers, afterDestroy });
    }

    logger.debug(1, '[runner] connect()');
    const { client } = await connect({
      uid: options.uid,
      processes,
      subscribers,
      programPath,
      inputStream: options.inputStream,
      inputPath: options.inputPath,
      logLevel: LogLevel[options.logLevel ?? 'Off'],
      onOutput,
      beforeInitialize: client => registerEvents(client, onEnd),
    });

    const subscriber = client.onStopped(stoppedEvent => {
      logger.debug('[Event] Stopped', stoppedEvent);
      if (stoppedEvent.reason == 'signal') {
        options.onTerminate({ type: 'signal', message: stoppedEvent.text || '' });

        return;
      }

      if (typeof stoppedEvent.threadId !== 'number') {
        return;
      }
      lastThreadId = stoppedEvent.threadId;

      const reasons = [ 'breakpoint', 'step' ];
      if (!reasons.includes(stoppedEvent.reason)) {
        return;
      }

      function onSnapshot(snapshot: StepSnapshot): void {
        snapshot.stdout = lastOutput.stdout;
        snapshot.stderr = lastOutput.stderr;
        lastOutput.stdout = [];
        lastOutput.stderr = [];
        logger.debug('onSnapshot');
        logger.dir(snapshot, { colors: true, depth: 10 });
        options.onSnapshot(snapshot);
      }

      const snapshotParams = {
        filePaths: [ options.main, ...options.files ].map(file => path.resolve(process.cwd(), file.relativePath)),
        context: { client, canDigScope, canDigVariable, breakpoints: options.breakpoints, onSnapshot: onSnapshot },
        threadId: stoppedEvent.threadId,
      };

      void setSnapshot(snapshotParams);

    });
    subscribers.push(subscriber);

    logger.debug(2, '[runner] setBreakpoints()');
    await setBreakpoints({ client, programPath, breakpoints: options.breakpoints });

    logger.debug(3, '[runner] Configuration Done');
    // send 'configuration done' (in some debuggers this will trigger 'continue' if attach was awaited)
    await client.configurationDone({});

    logger.debug(4, '[runner] Runner ready');

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
        await destroy('runSteps', { destroyed, client, processes, programPath, subscribers, afterDestroy });
      } catch {
      // silence is golden.
      }
    }

    // Clear any debugger output before starting
    lastOutput.stdout = [];
    lastOutput.stderr = [];

    return {
      stepIn,
      stepOut,
      stepOver,
      terminate,
    };
  };
};


type Output = DebugProtocol.OutputEvent['body'];

interface DestroyParams {
  client: SocketDebugClient,
  destroyed: boolean,
  processes: Subprocess[],
  subscribers: Unsubscribable[],
  programPath: string,
  afterDestroy: () => Promise<void>,
}

async function destroy(origin: string, { destroyed, subscribers, processes, client, afterDestroy }: DestroyParams): Promise<void> {
  if (destroyed) {
    return logger.debug('[StepsRunner] destroy already performed');
  }

  logger.debug('\n');
  logger.debug(`[StepsRunner] Destroy ⋅ ${origin}`);
  subscribers.forEach(subscriber => subscriber.unsubscribe());
  processes.forEach(subprocess => {
    subprocess.kill();
  });
  client.disconnectAdapter();
  await client.disconnect({}).catch(() => { /* throws if already disconnected */ });
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

  let breakpointsDef;
  if (breakpoints == '*') {
    breakpointsDef = Array.from({ length: lines }, (_, i) => ({ line: i + 1 }));
  } else {
    breakpointsDef = breakpoints.split(',').map(line => ({ line: parseInt(line) }));
  }

  logger.debug('[StepsRunner] set breakpoints', breakpointsDef);
  let response = await client.setBreakpoints({
    breakpoints: breakpointsDef,
    source: {
      path: programPath,
    },
  });
  logger.debug('[StepsRunner] set breakpoints intermediate response', response);

  const verifiedBreakpoints = response.breakpoints
    .filter(breakpoint => breakpoint.verified && typeof breakpoint.line === 'number')
    .map(({ line }) => ({ line: line as number }));

  if (verifiedBreakpoints.length === breakpointsDef.length) {
    return;
  }

  response = await client.setBreakpoints({
    breakpoints: verifiedBreakpoints,
    source: { path: programPath },
  });

  logger.debug('[StepsRunner] set breakpoints response', response);
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

interface SetSnapshotParams {

  /**
   * absolute paths
   */
  filePaths: string[], // absolute paths
  context: RunStepContext,
  threadId: number,
}

async function setSnapshot({ context, filePaths, threadId }: SetSnapshotParams): Promise<void> {
  try {
    logger.debug('setSnapshot');
    const snapshot = await getSnapshot({ context, filePaths, threadId });

    if (snapshot.stackFrames && snapshot.stackFrames.length > 0) {
      context.onSnapshot(snapshot);
    } else {
      await context.client.stepOut({ threadId, granularity: 'instruction' });
    }
  } catch (error) {
    logger.debug('getSnapshot Failed', error);
  }
}

