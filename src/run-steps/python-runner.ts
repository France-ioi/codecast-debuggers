import cp from 'child_process';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { makeRunner, MakeRunnerConfig } from './runner';
import { Stream } from 'stream';

export const runStepsWithPythonDebugger = makeRunner({
  connect: params => connect(params),
  canDigVariable: variable => {
    const undiggableNames = [ 'special variables', 'function variables', 'class variables', '__builtins__' ];
    if (undiggableNames.includes(variable.name)) {
      return false;
    }

    const undiggableTypes = [ 'module' ];
    if (variable.type && undiggableTypes.includes(variable.type)) {
      return false;
    }

    return true;
  },
});

const connect: MakeRunnerConfig['connect'] = async ({ processes, programPath, logLevel, beforeInitialize, inputStream }) => {
  const language = 'Python';
  const dap = {
    host: 'localhost',
    port: 4711,
  };

  logger.debug(1, '[Python StepsRunner] start adapter server');
  await spawnDebugAdapterServer(dap, processes, inputStream);

  logger.debug(2, '[Python StepsRunner] instantiate SocketDebugClient');
  const client = new SocketDebugClient({
    host: dap.host,
    port: dap.port,
    loggerName: `${language} debug adapter client`,
    logLevel,
  });

  const initialized = new Promise<void>(resolve => {
    client.onInitialized(() => {
      logger.debug('[Python StepsRunner] initialized');
      resolve();
    });
  });

  logger.debug(3, '[Python StepsRunner] register events');
  beforeInitialize(client);

  logger.debug(4, '[Python StepsRunner] connect adapter');
  await client.connectAdapter();

  logger.debug(5, '[Python StepsRunner] initialize client');
  const initializeResponse = await client.initialize({
    adapterID: language,
    pathFormat: 'path',
    supportsMemoryEvent: true,
    supportsMemoryReferences: true,
  });

  /**
   * Initialize Response :  {
   *   supportsCompletionsRequest: true,
   *   supportsConditionalBreakpoints: true,
   *   supportsConfigurationDoneRequest: true,
   *   supportsDebuggerProperties: true,
   *   supportsDelayedStackTraceLoading: true,
   *   supportsEvaluateForHovers: true,
   *   supportsExceptionInfoRequest: true,
   *   supportsExceptionOptions: true,
   *   supportsFunctionBreakpoints: true,
   *   supportsHitConditionalBreakpoints: true,
   *   supportsLogPoints: true,
   *   supportsModulesRequest: true,
   *   supportsSetExpression: true,
   *   supportsSetVariable: true,
   *   supportsValueFormattingOptions: true,
   *   supportsTerminateDebuggee: true,
   *   supportsGotoTargetsRequest: true,
   *   supportsClipboardContext: true,
   *   exceptionBreakpointFilters: [
   *     { filter: 'raised', label: 'Raised Exceptions', default: false },
   *     { filter: 'uncaught', label: 'Uncaught Exceptions', default: true },
   *     {
   *       filter: 'userUnhandled',
   *       label: 'User Uncaught Exceptions',
   *       default: false
   *     }
   *   ],
   *   supportsStepInTargetsRequest: true
   * }
   */
  logger.debug('Initialize Response : ', initializeResponse);

  logger.debug(6, '[Python StepsRunner] launch client');
  const launched = client.launch({
    program: programPath,
    justMyCode: true,
  } as DebugProtocol.LaunchRequestArguments);

  await Promise.race([
    launched.then(response => {
      logger.debug('[Python StepsRunner] launch response', response);
    }),
    initialized,
  ]);

  return { client };
};

async function spawnDebugAdapterServer(
  dap: { host: string, port: number },
  processes: cp.ChildProcess[],
  inputStream: Stream|null,
): Promise<void> {
  const debugPyFolderPath = findDebugPyFolder();

  return new Promise<void>(resolve => {
    const subprocess = cp.spawn('python', [
      path.resolve(debugPyFolderPath, 'adapter'),
      '--host',
      dap.host,
      '--port',
      dap.port.toString(),
      '--log-stderr',
    ], { stdio: [ (inputStream) ? inputStream : 'ignore', 'pipe', 'pipe' ] });
    processes.push(subprocess);

    subprocess.on('error', error => logger.error('Server error:', error));

    // const logData = (origin: string) => (data: any) => slogger.debug('[debugpy]', `(${origin})`, data.toString('utf-8'))
    // subprocess.stdout.on('data', logData('stdout'))
    // subprocess.stderr.on('data', logData('stderr'))

    subprocess.stderr.on('data', (data: Buffer) => {
      const message = data.toString('utf-8');
      if (message.includes('Listening for incoming Client connections')) {
        logger.debug('[Python StepsRunner] resolve');
        resolve();
      }
    });
  });
}

function findDebugPyFolder(): string {
  const found = findByName('debugpy').find(folderPath => folderPath.includes('python')); // take first with "python"
  if (!found) {
    throw new Error('DebugPy folder not found');
  }

  return found;
}

function findByName(name: string, root = '/'): string[] {
  const output = cp.execSync(`find ${root} -name ${name}`, { stdio: [ 'ignore', 'pipe', 'ignore' ] });

  return output.toString('utf-8').split('\n').slice(0, -1); // last one is empty string, remove it
}
