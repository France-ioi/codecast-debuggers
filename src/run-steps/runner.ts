import fs from 'fs';
import path from 'path';
import { getDiff, applyDiff } from 'recursive-diff';
import produce, { Patch, enablePatches } from 'immer';
import { LogLevel, SocketDebugClient, Unsubscribable } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Stream } from 'stream';
import process from 'process';
import { setTimeout } from 'timers/promises';
import { config } from '../config';

enablePatches();

/**
 * Performance measurements.
 */
let snapshotTotalDuration = 0;
let diffTotalDuration = 0;
let produceTotalDuration = 0;

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
   * For instance, for compiled languages, the runner will removed compiled files.
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
  main: File,
  inputStream: Stream|null,
  inputPath: string,
  files: Array<File>,
  logLevel?: 'On' | 'Off',
  breakpoints: string,
}

/**
 * Context that will be passed through every debugging extract step (stack frame, scope, variable)
 */
interface RunStepContext {
  client: SocketDebugClient,
  canDigVariable: (variable: DebugProtocol.Variable) => boolean,
  canDigScope: (scope: DebugProtocol.Scope) => boolean,
  breakpoints: string,
}

export type Runner = (options: RunnerOptions) => Promise<Result>;

/**
 * Used by a factory to create a runner per debugger based on the language
 * @param {MakeRunnerConfig} config Injected config per debugger
 * @returns {Runner} runner
 */
export const makeRunner = ({
  connect,
  afterDestroy = (): Promise<void> => Promise.resolve(),
  canDigScope = (): boolean => true,
  canDigVariable = (): boolean => true,
}: MakeRunnerConfig): Runner => {
  const destroyed = false;
  const acc: StepsAcc = [];
  const onOutput: Parameters<MakeRunnerConfig['connect']>[0]['onOutput'] = output => {
    const last = acc.at(-1);
    if (!last) {
      return;
    } // too early to have "real" outputs

    logger.debug('Add stdout:', output);
    if (output.category === 'stdout') {
      last.stdout = [ ...(last?.stdout ?? []), output.output ];
    }
    if (output.category === 'stderr') {
      last.stderr = [ ...(last?.stderr ?? []), output.output ];
    }
  };
  let resolveSteps: () => void = () => {};
  const steps = new Promise<StepsAcc>(resolve => {
    resolveSteps = (): void => resolve(acc);
  });

  return async (options: RunnerOptions) => {
    const processes: Subprocess[] = [];
    const subscribers: Unsubscribable[] = [];
    const programPath = path.resolve(process.cwd(), options.main.relativePath);

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

    logger.debug(1, '[runner] connect()');
    const { client } = await connect({
      processes,
      subscribers,
      programPath,
      inputStream: options.inputStream,
      inputPath: options.inputPath,
      logLevel: LogLevel[options.logLevel ?? 'Off'],
      onOutput,
      beforeInitialize: client => registerEvents(client, resolveSteps),
    });

    const subscriber = client.onStopped(stoppedEvent => {
      logger.debug('[Event] Stopped', stoppedEvent);
      const reasons = [ 'breakpoint', 'step' ];
      if (!reasons.includes(stoppedEvent.reason) || typeof stoppedEvent.threadId !== 'number') {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setSnapshotAndAdvance({
        acc,
        filePaths: [ options.main, ...options.files ].map(file => path.resolve(process.cwd(), file.relativePath)),
        context: { client, canDigScope, canDigVariable, breakpoints: options.breakpoints },
        threadId: stoppedEvent.threadId,
      });
    });
    subscribers.push(subscriber);

    logger.debug(2, '[runner] setBreakpoints()');
    await setBreakpoints({ client, programPath, breakpoints: options.breakpoints });

    logger.debug(3, '[runner] Configuration Done');
    // send 'configuration done' (in some debuggers this will trigger 'continue' if attach was awaited)
    await client.configurationDone({});

    logger.debug(4, '[runner] await steps');
    const debuggingStartTime = process.hrtime();

    const timeout = setTimeout(config.limitTime * 1000, 'timeout');
    const result = await Promise.race([ steps, timeout ]);
    if (result == 'timeout') {
      // @ts-ignore
      acc[acc.length - 1].terminated = true;
      // @ts-ignore
      acc[acc.length - 1].terminatedReason = 'Debugger time exceeded.';
    }

    const debuggingDuration = process.hrtime(debuggingStartTime);
    logger.log('Debugging duration : ', (debuggingDuration[0] + (debuggingDuration[1] / 1000000000)));

    logger.debug(5, '[runner] destroy');

    try {
      await destroy('runSteps', { destroyed, client, processes, programPath, subscribers, afterDestroy });
    } catch {
      // silence is golden.
    }

    logger.debug(6, '[runner] return result');

    const producedSteps = snapshotsToSteps(acc);

    logger.log('Snapshot total duration (DAP interaction) : ', snapshotTotalDuration);
    logger.log('Diff total duration : ', diffTotalDuration);
    logger.log('Produce total duration : ', produceTotalDuration);

    return {
      steps: producedSteps,
    };
  };
};

export type Step = Patch[];
export type Steps = Step[];

export interface Result {
  error?: string,
  steps: Steps,
}
export interface ResultError {

}

function snapshotsToSteps(snapshots: StepSnapshot[]): Steps {
  return snapshots.reduce((acc, current, index) => {
    const previous = snapshots[index-1] ?? {};

    const diffStartTime = process.hrtime();
    const diff = getDiff(previous, current);
    const diffDuration = process.hrtime(diffStartTime);
    diffTotalDuration += diffDuration[0] + (diffDuration[1] / 1000000000);

    /**
     * Computing the patches is not very straighforward:
     * 1. Compute the diff between previous & current snapshot using recursive-diff because immer doesn't do that
     * 2. Apply that diff to the ImmerJS draft to extract patches under ImmerJS formats
     */
    const produceStartTime = process.hrtime();
    produce(
      previous,
      draft => void applyDiff(draft, diff),
      patches => void acc.push(patches),
    );
    const produceDuration = process.hrtime(produceStartTime);
    produceTotalDuration += produceDuration[0] + (produceDuration[1] / 1000000000);

    return acc;
  }, [] as Steps);
}

type Output = DebugProtocol.OutputEvent['body'];

export type StepsAcc = StepSnapshot[];

export interface StepSnapshot {
  stackFrames: StackFrame[],
  stdout?: string[],
  stderr?: string[],
  terminated?: boolean,
  terminatedReason?: string,
}
export interface StackFrame extends DebugProtocol.StackFrame {
  scopes: Scope[],
}
export interface Scope extends DebugProtocol.Scope {
  variables: Variable[],
}
export interface Variable extends DebugProtocol.Variable {
  variables: Variable[],
  memory?: DebugProtocol.ReadMemoryResponse['body'],
}

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
const registerEvents = (client: SocketDebugClient, onTerminated: () => void): void => {
  client.onContinued(event => logger.debug('[Event] Continued', event));
  client.onExited(event => {
    logger.debug('[Event] Exited', event.exitCode);
    if (event.exitCode === 0) {
      onTerminated();
    }
  });
  client.onOutput(({ output, ...event }) => logger.debug('[Event] Output', JSON.stringify(output), event));
  client.onTerminated(event => {
    logger.debug('[Event] Terminated − resolve steps', event ?? '');
    onTerminated();
    client.disconnectAdapter();
  });

  client.onThread(thread => {
    logger.debug('[Event] Thread', thread);
  });
};

interface SetSnapshotAndStepInParams {

  /**
   * Accumulator to push steps to. Must be an original (not cloned) mutable array
   */
  acc: StepsAcc,

  /**
   * absolute paths
   */
  filePaths: string[],
  context: RunStepContext,
  threadId: GetSnapshotParams['threadId'],
}

async function setSnapshotAndAdvance({ context, acc, filePaths, threadId }: SetSnapshotAndStepInParams): Promise<void> {
  const i = acc.length + 1;

  try {
    logger.debug('Execute steps', i);

    const snapshotStartTime = process.hrtime();
    const snapshot = await getSnapshot({ context, filePaths, threadId });
    const snapshotHrDuration = process.hrtime(snapshotStartTime);
    snapshotTotalDuration += snapshotHrDuration[0] + (snapshotHrDuration[1] / 1000000000);

    //logger.dir({ snapshot }, { colors: true, depth: 10 });

    if (snapshot.stackFrames.length > 0) {
      acc.push(snapshot);
    }

    if (context.breakpoints == '*') {
      if (snapshot.stackFrames.some(isStackFrameOfSourceFile(filePaths))) {
        await context.client.stepIn({ threadId, granularity: 'instruction' });
      } else {
        await context.client.stepOut({ threadId, granularity: 'instruction' });
      }
    } else {
      await context.client.continue({ threadId });
    }
  } catch (error) {
    logger.debug('Failed at step', i, error);
  }
}

interface GetSnapshotParams {

  /**
   * absolute paths
   */
  filePaths: string[],
  context: RunStepContext,

  /**
   * the threadId from which we can extract debug data. Provided in the `onStopped` event
   */
  threadId: number,
}

async function getSnapshot({ context, filePaths, threadId }: GetSnapshotParams): Promise<StepSnapshot> {
  const result = await context.client.stackTrace({ threadId });
  //logger.dir({ filePaths });
  const stackFrames = await Promise.all(
    result.stackFrames
      .filter(isStackFrameOfSourceFile(filePaths))
      .map(stackFrame => getStackFrame({ context, stackFrame }))
  );

  return { stackFrames };
}

interface GetStackFrameParams {
  stackFrame: DebugProtocol.StackFrame,
  context: RunStepContext,
}

async function getStackFrame({ context, stackFrame }: GetStackFrameParams): Promise<StackFrame> {
  const result = await context.client.scopes({ frameId: stackFrame.id });
  const scopes = await Promise.all(result.scopes.map(scope => getScope({ context, scope })));

  return { ...stackFrame, scopes };
}

interface GetScopeParams {
  scope: DebugProtocol.Scope,
  context: RunStepContext,
}

async function getScope({ context, scope }: GetScopeParams): Promise<Scope> {
  if (!context.canDigScope(scope)) {
    return { ...scope, variables: [] };
  }
  const result = await context.client.variables({ variablesReference: scope.variablesReference });
  const isLocalScope = scope.name.startsWith('Local');
  const variablesMaxDepth = isLocalScope ? 3 : 0;
  const variables = await Promise.all(result.variables.filter(context.canDigVariable).map(variable => getVariable({
    context,
    variable,
    maxDepth: variablesMaxDepth,
  })));

  return { ...scope, variables };
}

interface GetVariableParams {
  context: RunStepContext,
  variable: DebugProtocol.Variable,

  /**
   * Composite variables (like arrays and object in JS) have children variables. Since they can be very deep,
   * we have to arbitrarily stick to a variable max depth after which we will stop retrieving variable data.
   * For instance, for a `maxDepth: 3` and a JS object `{ a: { b: { c: { d: 'value' } } } }`, treatment will stop at
   * the property (including) "c" and won't extract variable data for property "d"
   */
  maxDepth: number,
}

async function getVariable({ context, maxDepth, variable }: GetVariableParams, currentDepth = 0): Promise<Variable> {
  const shouldGetSubVariables = variable.variablesReference > 0 && currentDepth <= maxDepth;
  if (!shouldGetSubVariables) {
    return { ...variable, variables: [] };
  }

  try {
    const result = await context.client.variables({ variablesReference: variable.variablesReference });
    const variables = await Promise.all(result.variables.filter(context.canDigVariable).map(variable => getVariable({
      context,
      variable,
      maxDepth: maxDepth,
    }, currentDepth + 1)));

    return { ...variable, variables };
  } catch (error) {
    logger.dir({ variable, error });

    return { ...variable, variables: [] };
  }
}

function isStackFrameOfSourceFile(fileAbsolutePaths: string[]) {
  return (stackFrame: DebugProtocol.StackFrame): boolean =>
    !!stackFrame.source && fileAbsolutePaths.some(filePath => filePath === stackFrame.source?.path);
}
