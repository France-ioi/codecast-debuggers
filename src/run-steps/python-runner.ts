import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Cleanable, makeRunner, MakeRunnerConfig, Runner, RunnerOptions } from './runner';
import { getPath } from '../utils';

export const runStepsWithPythonDebugger = (options: RunnerOptions): Promise<Runner> => {
  const runnerProgramPath = getPath('sources', options.uid, 'code.py');
  fs.writeFileSync(runnerProgramPath, fs.readFileSync(options.main.relativePath, 'utf-8'));

  const runner = makeRunner({
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

  return runner({ ...options, main: { relativePath: runnerProgramPath } } as RunnerOptions);
};

const connect: MakeRunnerConfig['connect'] = async ({ uid, cleanables, programPath, logLevel, onOutput, beforeInitialize, inputPath }) => {
  const language = 'Python';
  const dap = {
    host: 'localhost',
    port: uid,
  };

  // Add a last line to the program
  // This is to avoid a bug in debugpy where it doesn't stop on the last line
  const runnerProgramPath = getPath('sources', uid, 'code.py');
  fs.writeFileSync(runnerProgramPath, fs.readFileSync(programPath, 'utf-8') + '\npass\n');
  cleanables.push({ path: runnerProgramPath });

  logger.debug(1, '[Python StepsRunner] start adapter server test');
  await spawnDebugAdapterServer(dap, runnerProgramPath, cleanables, inputPath);

  logger.debug(2, '[Python StepsRunner] instantiate SocketDebugClient');
  const client = new SocketDebugClient({
    host: dap.host,
    port: dap.port,
    loggerName: `${language} debug adapter client`,
    logLevel,
  });

  let stderrTraceback = 0;
  client.onOutput(event => {
    if (event.category === 'stdout') {
      onOutput(event);
    } else if (event.category === 'stderr') {
      // We want to remove debugpy/runpy frames from the traceback
      // Traceback (most recent call last):
      //   File "/usr/local/lib/python3.10/runpy.py", line 196, in _run_module_as_main
      //     return _run_code(code, main_globals, None,
      //   [...]
      //   File "/var/www/codecast-debuggers/sources/Code 1.py", line 4
      if (stderrTraceback === 0 && event.output.includes('Traceback')) {
        stderrTraceback = 1;
        onOutput({ ...event, output: 'Traceback (most recent call last):\n' });
      }
      if (stderrTraceback != 1) {
        onOutput(event);

        return;
      }
      const idx = event.output.indexOf(`File "${runnerProgramPath}"`);
      if (idx !== -1) {
        stderrTraceback = 2;
        onOutput({ ...event, output: event.output.slice(idx) });
      }
    }
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
    // columnsStartAt1: false, // not actually supported by debugpy for some reason
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

  logger.debug(6, '[Python StepsRunner] launch client', runnerProgramPath);
  const launched = client.launch({
    program: runnerProgramPath,
    justMyCode: false,
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
  programPath: string,
  cleanables: Cleanable[],
  inputPath: string
): Promise<void> {
  const debugPyFolderPath = '/usr/local/lib/python3.10/site-packages/debugpy';

  return new Promise<void>(resolve => {
    // Create a folder for debugpy to log to
    const logDirPath = getPath('tmp', dap.port);
    fs.mkdirSync(logDirPath, { recursive: true });
    cleanables.push({ path: logDirPath });

    const subprocessParams = [
      'docker',
      'run',
      '-i',
      '--rm',
      '--name',
      `python-${dap.port.toString()}`,
      '-v',
      `${programPath}:${programPath}:ro`,
      '-v',
      `${logDirPath}:${logDirPath}`,
      '-p',
      `${dap.port.toString()}:4000`,
      'python-debugger',
      'python',
      path.resolve(debugPyFolderPath, 'adapter'),
      '--host',
      '0.0.0.0',
      '--port',
      '4000',
      '--log-dir',
      logDirPath,
    ];

    // Watch for log modifications, to know when the adapter is ready
    const watcher = fs.watch(logDirPath, {}, (type, filename) => {
      logger.debug('watcher', type, filename);
      if (type == 'change') {
        const log = fs.readFileSync(path.join(logDirPath, filename), 'utf-8');
        if (log.includes('Listening for incoming Client connections')) {
          logger.debug('[Python StepsRunner] resolve');
          resolve();
          watcher.close();
        }
      }
    });
    cleanables.push({ unsubscribe: () => watcher.close() });

    logger.log('Spawn python', subprocessParams);
    logger.log('cmdline', subprocessParams.join(' '));

    const subprocess = cp.spawn(subprocessParams[0] as string, subprocessParams.slice(1), {
      stdio: [ (inputPath) ? fs.createReadStream(inputPath) : 'ignore', 'pipe', 'pipe' ],
    });
    cleanables.push(subprocess);

    subprocess.on('error', error => logger.error('Server error:', error));
  });
}