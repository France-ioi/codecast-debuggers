import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import * as pty from 'node-pty';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { MakeRunnerConfig, makeRunner, RunnerOptions, Runner, Cleanable, CompilationError } from './runner';
import tmp from 'tmp';
import { removeExt } from '../utils';

type Language = 'c' | 'cpp';

export const runStepsWithLLDB = (language: Language, options: RunnerOptions): Promise<Runner> => {
  const runner = makeRunner({
    connect: connect(language),
    canDigStackFrame: stackFrame => !stackFrame.name.startsWith('::_'),
    canDigScope: scope => {
      // if (this.language === 'C++')
      const forbiddenScopes = [ 'Registers' ];

      return !forbiddenScopes.includes(scope.name);
    },
    canDigVariable: variable => !variable.name.startsWith('std::') && !variable.name.startsWith('__gnu_cxx:'),
  });

  return runner(options);
};

const connect = (language: Language): MakeRunnerConfig['connect'] => async ({ uid, beforeInitialize, logLevel, onOutput, cleanables, programPath, inputStream, inputPath }) => {
  const connectLLDBTime = process.hrtime();
  const dap = {
    host: 'localhost',
    port: uid,
  };

  const executablePath = removeExt(programPath);

  if (inputStream && !inputPath) {
    inputPath = tmp.fileSync({ postfix: '.txt' }).name;
    logger.debug('Creating temporary file for input stream', inputPath);
    cleanables.push({ path: inputPath });
    await new Promise(resolve => {
      inputStream.pipe(fs.createWriteStream(inputPath)).on('finish', resolve);
    });
  }

  logger.debug(1, '[LLDB StepsRunner] start adapter server');
  await spawnAdapterServer(dap, language, cleanables, programPath, executablePath, uid, inputPath);

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

      cleanables.push(subprocess);

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
    initCommands: [ 'settings set target.disable-aslr false' ],
  } as DebugProtocol.LaunchRequestArguments);

  await Promise.race([ launched, spawnedTerminalRequest ]);

  const connectLLDBDuration = process.hrtime(connectLLDBTime);
  logger.log('LLDB compilation and initialization duration : ', (connectLLDBDuration[0] + (connectLLDBDuration[1] / 1000000000)));

  return { client };
};

async function spawnAdapterServer(dap: { host: string, port: number }, language: Language, cleanables: Cleanable[], sourcePath: string, executablePath: string, uid: number, inputPath: string): Promise<void> {
  logger.debug('Start LLDB DAP Server on port', dap.port);

  const root = '/usr/project/vscode-lldb';
  const liblldb = path.join(root, './lldb/lib/liblldb.so');

  // TODO :: compilation errors
  const args = [
    'docker',
    'run',
    '--rm',
    '--name',
    'lldb-' + uid.toString(),
    //    '-v',
    //`${executablePath}:${executablePath}:ro`,
    '-v',
    `${sourcePath}:${sourcePath}:ro`,
    ...(inputPath ? [ '-v', `${inputPath}:${inputPath}:ro` ] : []),
    '-p',
    `${dap.port.toString()}:4000`,
    'lldb-debugger',
    `/usr/project/vscode-lldb/lldb-startup-${language}.sh`,
    sourcePath,
    executablePath,
    path.join(root, 'adapter/codelldb'),
    '--liblldb',
    liblldb,
    '--port',
    '4001',
  ];

  await new Promise<void>((resolve, reject) => {
    logger.debug('Spawn process ', args);
    const adapter = cp.spawn(args[0] as string, args.slice(1), {
      stdio: [ 'ignore', 'pipe', 'pipe' ],
    });
    cleanables.push(adapter);
    let stderr = '';
    const resolveOnMessage = (origin: string) => (data: Buffer) => {
      const message = data.toString('utf-8');
      logger.debug(`[DAP server ${origin}]`, message);
      if (origin == 'stderr') {
        stderr += message;
        if (stderr.includes('___COMPILATION_ERROR___')) {
          logger.error('Compilation error');

          reject(new CompilationError(stderr.replace('___COMPILATION_ERROR___', '')));
        }
      }
      if (message.startsWith('Listening on port')) {
        logger.debug(`DAP server ready (${origin})`, message);
        resolve();
      }
    };
    adapter.stdout.on('data', resolveOnMessage('stdout'));
    adapter.stderr.on('data', resolveOnMessage('stderr'));
  });
}