import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { makeRunner, MakeRunnerConfig, Subprocess } from './runner';
import { Stream } from 'stream';
import { getDockerPort } from '../utils';
import { config } from '../config';

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

const connect: MakeRunnerConfig['connect'] = async ({ processes, programPath, logLevel, onOutput, beforeInitialize, inputStream }) => {
  const language = 'Python';
  const dap = {
    host: 'localhost',
    port: getDockerPort(),
  };

  logger.debug(1, '[Python StepsRunner] start adapter server test');
  await spawnDebugAdapterServer(dap, processes, inputStream);

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
      // Traceback (most recent call last):
      //   File "/usr/local/lib/python3.10/runpy.py", line 196, in _run_module_as_main
      //     return _run_code(code, main_globals, None,
      //   File "/usr/local/lib/python3.10/runpy.py", line 86, in _run_code
      //     exec(code, run_globals)
      //   File "/usr/local/lib/python3.10/site-packages/debugpy/adapter/../../debugpy/launcher/../../debugpy/__main__.py", line 39, in <module>
      //     cli.main()
      //   File "/usr/local/lib/python3.10/site-packages/debugpy/adapter/../../debugpy/launcher/../../debugpy/../debugpy/server/cli.py", line 430, in main
      //     run()
      //   File "/usr/local/lib/python3.10/site-packages/debugpy/adapter/../../debugpy/launcher/../../debugpy/../debugpy/server/cli.py", line 284, in run_file
      //     runpy.run_path(target, run_name="__main__")
      //   File "/usr/local/lib/python3.10/site-packages/debugpy/_vendored/pydevd/_pydevd_bundle/pydevd_runpy.py", line 320, in run_path
      //     code, fname = _get_code_from_file(run_name, path_name)
      //   File "/usr/local/lib/python3.10/site-packages/debugpy/_vendored/pydevd/_pydevd_bundle/pydevd_runpy.py", line 294, in _get_code_from_file
      //     code = compile(f.read(), fname, 'exec')
      //   File "/var/www/codecast-debuggers/sources/Code 1.py", line 4
      if (stderrTraceback === 0 && event.output.includes('Traceback')) {
        stderrTraceback = 1;
        onOutput({ ...event, output: 'Traceback (most recent call last):\n' });
      }
      if (stderrTraceback != 1) {
        onOutput(event);

        return;
      }
      const idx = event.output.indexOf(`File "${programPath}"`);
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
   *  7 supportsConfigurationDoneRequest: true,
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

  logger.debug(6, '[Python StepsRunner] launch client', programPath);
  const launched = client.launch({
    program: programPath,
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
  processes: Subprocess[],
  inputStream: Stream|null,
): Promise<void> {
  const debugPyFolderPath = findDebugPyFolder();

  return new Promise<void>(resolve => {
    // Create a file for debugpy to log to
    const logDirPath = path.join('/tmp', 'debugpy-' + dap.port.toString());
    fs.mkdirSync(logDirPath, { recursive: true });

    const subprocessParams = [
      'docker',
      'run',
      '--rm',
      '-v',
      `${config.sourcesPath}:${config.sourcesPath}:ro`,
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

    logger.log('Spawn python', subprocessParams);
    logger.log('cmdline', subprocessParams.join(' '));

    const subprocess = cp.spawn(subprocessParams[0] as string, subprocessParams.slice(1), {
      stdio: [ (inputStream) ? inputStream : 'ignore', 'pipe', 'pipe' ],
    });
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
      } else {
        logger.debug('[Python StepsRunner] stderr', message);
      }
    });
  });
}

function findDebugPyFolder(): string {
  return '/usr/local/lib/python3.10/site-packages/debugpy';
  // const found = findByName('debugpy').find(folderPath => folderPath.includes('python')); // take first with "python"
  // if (!found) {
  //   throw new Error('DebugPy folder not found');
  // }

  // return found;
}

// function findByName(name: string, root = '/'): string[] {
//   const output = cp.execSync(`find ${root} -name ${name}`, { stdio: [ 'ignore', 'pipe', 'ignore' ] });

//   return output.toString('utf-8').split('\n').slice(0, -1); // last one is empty string, remove it
// }
