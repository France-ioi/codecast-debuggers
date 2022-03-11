import cp from 'child_process';
import { SocketDebugClient } from 'node-debugprotocol-client';
import fs from 'fs';
import path from 'path';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { MakeRunnerConfig, makeRunner, RunnerOptions, Steps } from './runner';

type Language = 'c' | 'cpp';

export const runStepsWithLLDB = (language: Language, options: RunnerOptions): Promise<Steps> => {
  const config = configurations[language];
  let executablePath: string | null = null;

  const runner = makeRunner({
    connect: connect(language, config, exe => executablePath = exe),
    canDigScope: scope => {
      // if (this.language === 'C++')
      const forbiddenScopes = [ 'Registers' ];

      return !forbiddenScopes.includes(scope.name);
    },
    canDigVariable: variable => !variable.name.startsWith('std::'),
    afterDestroy: async () => {
      logger.debug('[LLDB StepsRunner] remove executable file');
      if (executablePath) {
        await fs.promises.unlink(executablePath).catch(() => { /* throws if already deleted */ });
      }
    },
  });

  return runner(options);
};

const connect = (
  language: Language,
  config: Configuration,
  onExecutablePath: (thePath: string) => void,
): MakeRunnerConfig['connect'] => async ({ beforeInitialize, logLevel, processes, programPath, inputPath }) => {
  const dap = {
    host: 'localhost',
    port: 4711,
  };

  logger.debug(1, '[LLDB StepsRunner] start adapter server');
  await spawnAdapterServer(dap, processes);

  logger.debug(2, '[LLDB StepsRunner] instantiate SocketDebugClient');
  const client = new SocketDebugClient({
    host: dap.host,
    port: dap.port,
    loggerName: `${language} debug adapter client`,
    logLevel,
  });

  logger.debug(3, '[LLDB StepsRunner] register events');
  beforeInitialize(client);

  logger.debug(4, '[LLDB StepsRunner] connect adapter');
  await client.connectAdapter();

  logger.debug(5, '[LLDB StepsRunner] initialize client');
  const initializeResponse = await client.initialize({
    adapterID: language,
    pathFormat: 'path',
    supportsMemoryEvent: true,
    supportsMemoryReferences: true,
  });

  /**
   * Initialize Response :  {
   *   exceptionBreakpointFilters: [
   *     { default: true, filter: 'cpp_throw', label: 'C++: on throw' },
   *     { default: false, filter: 'cpp_catch', label: 'C++: on catch' }
   *   ],
   *   supportTerminateDebuggee: true,
   *   supportsCancelRequest: true,
   *   supportsCompletionsRequest: true,
   *   supportsConditionalBreakpoints: true,
   *   supportsConfigurationDoneRequest: true,
   *   supportsDataBreakpoints: true,
   *   supportsDelayedStackTraceLoading: true,
   *   supportsEvaluateForHovers: true,
   *   supportsFunctionBreakpoints: true,
   *   supportsGotoTargetsRequest: true,
   *   supportsHitConditionalBreakpoints: true,
   *   supportsLogPoints: true,
   *   supportsReadMemoryRequest: true,
   *   supportsRestartFrame: true,
   *   supportsSetVariable: true
   * }
   */
  logger.debug('Initialize Response : ', initializeResponse);

  const executablePath = config.compile(programPath).executablePath;
  onExecutablePath(executablePath);

  const spawnedTerminalRequest = new Promise<void>((resolve, reject) => {
    client.onRunInTerminalRequest(({ args: [ argv, ...args ], cwd, env, kind, title }) => {
      if (!argv) {
        throw new Error('argv must be defined');
      }
      logger.debug('[Event] RunInTerminalRequest', { argv, args, cwd, kind, title });
      logger.log(argv, args);
      const subprocess = cp.spawn(argv, args, {
        stdio: [ 'ignore', 'inherit', 'inherit' ],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        env: { ...env, RUST_BACKTRACE: 'full' },
        shell: true,
      });
      processes.push(subprocess);
      subprocess.on('error', error => {
        logger.error(error);
        reject(error);
      });
      // resolve()
      logger.debug(7, '[LLDB StepsRunner] ran requested command in terminal');
      setTimeout(resolve, 1);

      // subprocess.stdout.on('data', (data) => logger.debug('[stdout]', data.toString('utf-8')))
      // subprocess.stderr.on('data', (data) => logger.debug('[stderr]', data.toString('utf-8')))
      return Promise.resolve({ processId: subprocess.pid, shellProcessId: process.pid });
    });
  });

  logger.debug(6, '[LLDB StepsRunner] launch client');
  const launched = client.launch({
    program: executablePath,
    stdio: [ inputPath, null, null ],
    ...config.launchArgs,
  } as DebugProtocol.LaunchRequestArguments);

  await Promise.race([ launched, spawnedTerminalRequest ]);

  return { client };
};

async function spawnAdapterServer(dap: { host: string, port: number }, processes: cp.ChildProcess[]): Promise<void> {
  logger.debug('Start LLDB DAP Server on port', dap.port);

  const root = path.join(process.cwd(), 'vscode-lldb');
  const liblldb = path.join(root, './lldb/lib/liblldb.so');
  logger.debug('Start LLDB DAP Server on port', dap.port);

  const executable = path.join(root, 'adapter/codelldb');
  const args = [ '--liblldb', liblldb, '--port', dap.port.toString() ];

  await new Promise<void>(resolve => {
    logger.debug('Spawn process ', executable, args);
    const adapter = cp.spawn(executable, args, {
      stdio: [ 'ignore', 'pipe', 'pipe' ],
      cwd: root,
    });
    processes.push(adapter);
    const resolveOnMessage = (origin: string) => (data: Buffer) => {
      const message = data.toString('utf-8');
      logger.debug(`DAP server ready (${origin})`, message);
      if (message.startsWith('Listening on port')) {
        resolve();
      }
    };
    adapter.stdout.once('data', resolveOnMessage('stdout'));
    adapter.stderr.once('data', resolveOnMessage('stderr'));
    if (logger.level === 'debug') {
      adapter.stdout.on('data', (data: Buffer) => process.stdout.write(data));
    }
    if (logger.level === 'debug') {
      adapter.stderr.on('data', (data: Buffer) => process.stderr.write(data));
    }
  });
}

interface Configuration {
  compile: (mainFilePath: string) => { executablePath: string },
  launchArgs?: DebugProtocol.LaunchRequestArguments,
}

// /* eslint-disable @typescript-eslint/naming-convention */
const configurations: Record<Language, Configuration> = {
  c: {
    compile: mainFilePath => {
      // execSync(disableASLRCommand(), { stdio: 'inherit' })
      const executablePath = removeExt(mainFilePath);
      cp.execSync(`gcc -g ${mainFilePath} -o ${executablePath} -ldl`, { stdio: 'inherit' });

      return { executablePath };
    },
    launchArgs: {
      initCommands: [ 'settings set target.disable-aslr false' ],
    } as DebugProtocol.LaunchRequestArguments,
  },
  cpp: {
    compile: mainFilePath => {
      const executablePath = removeExt(mainFilePath);
      cp.execSync(`g++ -g ${mainFilePath} -o ${executablePath} -ldl`, { stdio: 'inherit' });

      return { executablePath };
    },
  },
};
const removeExt = (filePath: string): string => filePath.slice(0, -path.extname(filePath).length);
