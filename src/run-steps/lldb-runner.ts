import cp, { SpawnSyncReturns } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as pty from 'node-pty';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { MakeRunnerConfig, makeRunner, RunnerOptions, Subprocess, Runner } from './runner';
import tmp from 'tmp';

type Language = 'c' | 'cpp';

export const runStepsWithLLDB = (language: Language, options: RunnerOptions): Promise<Runner> => {
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
): MakeRunnerConfig['connect'] => async ({ uid, beforeInitialize, logLevel, onOutput, processes, programPath, inputPath }) => {
  const connectLLDBTime = process.hrtime();
  const dap = {
    host: 'localhost',
    port: uid,
  };

  const executablePath = config.compile(programPath).executablePath;
  onExecutablePath(executablePath);

  logger.debug(1, '[LLDB StepsRunner] start adapter server');
  await spawnAdapterServer(dap, processes, executablePath, uid);

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
    supportsRunInTerminalRequest: false,
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

  const spawnedTerminalRequest = new Promise<void>((resolve, reject) => {
    client.onRunInTerminalRequest(({ args: [ argv, ...args ], cwd, env, kind, title }) => {
      if (!argv) {
        throw new Error('argv must be defined');
      }
      logger.debug('[Event] RunInTerminalRequest', { argv, args, cwd, kind, title });
      logger.log(argv, args);
      //const subprocess = pty.spawn('bash', [], {
      const subprocess = pty.spawn('docker', [ 'exec', '-it', 'lldb-' + uid.toString(), argv, ...args ], {
        name: title ?? 'reverse_command',
        cols: 80,
        rows: 1,
        cwd,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        env: { ...env, RUST_BACKTRACE: 'full' },
      });
      subprocess.onData(message => {
        logger.debug('[RIT]', message);
        if (message == '\u001b[2J\u001b[1;1H') { // clear screen
          return;
        }
        onOutput({
          category: 'stdout',
          // since pty adds a \n when emitting command output, remove one from the message
          output: message.replace(/\n$/, ''),
        });
      });
      subprocess.onExit(e => {
        logger.debug('[on exit]', e);
        if (e.exitCode > 0) {
          reject(new Error(`Terminal request exited with code ${e.exitCode}`));
        }
      });
      //subprocess.write(`${argv} ${args.join(' ')}\r`);

      processes.push(subprocess);

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

  const connectLLDBDuration = process.hrtime(connectLLDBTime);
  logger.log('LLDB compilation and initialization duration : ', (connectLLDBDuration[0] + (connectLLDBDuration[1] / 1000000000)));

  return { client };
};

async function spawnAdapterServer(dap: { host: string, port: number }, processes: Subprocess[], executablePath: string, uid: number): Promise<void> {
  logger.debug('Start LLDB DAP Server on port', dap.port);

  const root = '/usr/project/vscode-lldb';
  const liblldb = path.join(root, './lldb/lib/liblldb.so');

  const args = [
    'docker',
    'run',
    '--rm',
    '--name',
    'lldb-' + uid.toString(),
    //    '-v',
    //`${executablePath}:${executablePath}:ro`,
    '-v',
    `${executablePath}.cpp:${executablePath}.cpp:ro`,
    '-p',
    `${dap.port.toString()}:4000`,
    'lldb-debugger',
    '/usr/project/vscode-lldb/lldb-startup.sh',
    `${executablePath}`,
    path.join(root, 'adapter/codelldb'),
    '--liblldb',
    liblldb,
    '--port',
    '4001',
  ];

  await new Promise<void>(resolve => {
    logger.debug('Spawn process ', args);
    const adapter = cp.spawn(args[0] as string, args.slice(1), {
      stdio: [ 'ignore', 'pipe', 'pipe' ],
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

/**
 * Executes the compile command.
 *
 * @param command The command.
 *
 * @throws An exception in case the compilation fails.
 */
function execCompileCommand(command: string): void {
  let compileOutput;

  try {
    logger.debug('Compile command: ' + command);
    compileOutput = cp.execSync(command);
  } catch (e) {
    const error = (e as SpawnSyncReturns<Buffer>).stderr.toString();

    throw {
      error,
    };
  }
  logger.debug('-> ' + compileOutput.toString('utf8'));
}

// /* eslint-disable @typescript-eslint/naming-convention */
const configurations: Record<Language, Configuration> = {
  c: {
    compile: mainFilePath => {
      const executablePath = removeExt(mainFilePath);

      /**
       * We put a concatenation of code_hooks/initialization.c and the file to compile, into a file in /tmp
       * The hook code contains what is required to disable output buffering.
       *
       * Problem: It doesn't work.
       * If we execute the executable manually, we get the right output.
       * (ie. cp.execSync(executablePath).toString('ascii') bellow).
       *
       * But when we try to debug, we receive [on exit] { exitCode: 0, signal: 1 }
       * which might indicate a segfault, or something like that.
       *
       * It is possible that the method used in the hook to have an initialization function crashes when used with the debugger.
       * This requires further investigation.
       */

      const tmpFile = tmp.fileSync({
        postfix: 'src.c',
      });
      fs.writeSync(tmpFile.fd, fs.readFileSync('code_hooks/initialization.c'));
      fs.writeSync(tmpFile.fd, fs.readFileSync(mainFilePath));

      // Test: check the content of the file we're going to compile
      // const data = fs.readFileSync(tmpFile.name, 'utf-8');
      // console.log(data);

      // Compile the file containing the hook in /tmp :
      const compileCommand = `gcc -g ${tmpFile.name} -o ${executablePath} -ldl`;

      // Compile the source code without hooks
      //const compileCommand = `gcc -g ${mainFilePath} -o ${executablePath} -ldl`;

      execCompileCommand(compileCommand);

      // Test: execute the program manually and output the result in console.
      // TODO: Remove after fixing the issue.
      logger.debug(cp.execSync(executablePath).toString('ascii'));

      return { executablePath };
    },
    launchArgs: {
      initCommands: [ 'settings set target.disable-aslr false' ],
    } as DebugProtocol.LaunchRequestArguments,
  },
  cpp: {
    compile: mainFilePath => {
      const executablePath = removeExt(mainFilePath);
      const compileCommand = `g++ -g "${mainFilePath}" -o "${executablePath}" -ldl`;
      execCompileCommand(compileCommand);

      return { executablePath };
    },
    launchArgs: {
      initCommands: [ 'settings set target.disable-aslr false' ],
    } as DebugProtocol.LaunchRequestArguments,
  },
};
const removeExt = (filePath: string): string => filePath.slice(0, -path.extname(filePath).length);
