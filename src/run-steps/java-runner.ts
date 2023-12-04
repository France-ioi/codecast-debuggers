import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Cleanable, CompilationError, makeRunner, MakeRunnerConfig, Runner, RunnerOptions } from './runner';
import { config } from '../config';
import { JSONRPCEndpoint, LspClient } from 'ts-lsp-client';
import * as pty from 'node-pty';
import { getPath } from '../utils';

export const runStepsWithJavaDebugger = (options: RunnerOptions): Promise<Runner> => {
  const programPath = getPath('sources', options.uid, 'code.java');
  fs.writeFileSync(programPath, fs.readFileSync(options.main.relativePath, 'utf-8'));

  const runner = makeRunner({
    connect,
    canDigVariable: variable => variable.type != 'Scanner',
  });

  return runner({ ...options, main: { relativePath: programPath } } as RunnerOptions);
};

const connect: MakeRunnerConfig['connect'] = async ({ uid, cleanables, programPath, logLevel, onOutput, beforeInitialize }) => {
  const language = 'Java';
  const dap = {
    host: 'localhost',
    port: uid,
  };

  cleanables.push({ path: programPath });
  const compiledPath = await compile(programPath, uid, cleanables);

  logger.debug(1, '[Java StepsRunner] start adapter server');
  await spawnDebugAdapterServer(dap, programPath, compiledPath, cleanables);

  logger.debug(2, '[Java StepsRunner] instantiate SocketDebugClient');
  const client = new SocketDebugClient({
    host: dap.host,
    port: dap.port,
    loggerName: `${language} debug adapter client`,
    logLevel,
  });

  client.onOutput(event => {
    onOutput(event);
  });

  const initialized = new Promise<void>(resolve => {
    client.onInitialized(() => {
      logger.debug('[Java StepsRunner] initialized');
      resolve();
    });
  });

  logger.debug(3, '[Java StepsRunner] register events');
  beforeInitialize(client);

  logger.debug(4, '[Java StepsRunner] connect adapter');
  await client.connectAdapter();

  logger.debug(5, '[Java StepsRunner] initialize client');
  const initializeResponse = await client.initialize({
    adapterID: language,
    pathFormat: 'path',
    supportsMemoryEvent: true,
    supportsMemoryReferences: true,
    supportsRunInTerminalRequest: true,
    supportsInvalidatedEvent: true,
    supportsProgressReporting: true,
    supportsVariablePaging: true,
    supportsVariableType: true,

  });

  logger.debug('Initialize Response : ', initializeResponse);

  const waitForRunInTerminal = new Promise<void>((resolve, reject) => {
    client.onRunInTerminalRequest(({ args: [ argv, ...args ], cwd, env, kind, title }) => {
      if (!argv) {
        throw new Error('argv must be defined');
      }
      logger.debug('[Event] RunInTerminalRequest', { argv, args, cwd, env, kind, title });
      const ritArgs = [
        'docker', 'exec', '-it', 'java-' + uid.toString(),
        '/opt/java/openjdk/bin/java',
        ...args,
      ];
      logger.debug('[RIT args]', ritArgs);
      const subprocess = pty.spawn(ritArgs[0] || '', ritArgs.slice(1), {
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
        logger.debug('[RIT on exit]', e);
        if (e.exitCode > 0) {
          reject(new Error(`Terminal request exited with code ${e.exitCode}`));
        }
      });

      cleanables.push(subprocess);

      logger.debug(7, '[Java StepsRunner] ran requested command in terminal');
      setTimeout(resolve, 1);

      // subprocess.stdout.on('data', (data) => logger.debug('[stdout]', data.toString('utf-8')))
      // subprocess.stderr.on('data', (data) => logger.debug('[stderr]', data.toString('utf-8')))
      return Promise.resolve({ processId: subprocess.pid, shellProcessId: process.pid });
    });
  });


  logger.debug(6, '[Java StepsRunner] launch client', compiledPath);
  const launched = client.launch({
    type: 'java',
    program: compiledPath,
    mainClass: path.basename(compiledPath, '.class'),
    classPaths: [ path.dirname(compiledPath) ],
    //    stdio: [ inputPath, null, null ],
    console: 'integratedTerminal',
    internalConsoleOptions: 'neverOpen',
    justMyCode: true,
    noDebug: false,
  } as DebugProtocol.LaunchRequestArguments);

  // await Promise.race([
  //   launched.then(_response => {
  //     logger.debug('[Java StepsRunner] launched');
  //   }),
  //   initialized,
  // ]);
  await initialized;
  await launched;
  await waitForRunInTerminal;

  return { client };
};


async function compile(programPath: string, uid: number, cleanables: Cleanable[]): Promise<string> {
  const compilationPath = getPath('compilations', uid);
  cleanables.push({ path: compilationPath });

  const subprocessParams = [
    'docker',
    'run',
    '--rm',
    '--name',
    `java-${uid.toString()}-compile`,
    '-v',
    `${programPath}:${programPath}:ro`,
    '-v',
    `${compilationPath}:${compilationPath}`,
    'java-debugger',
    'javac',
    '-g',
    '-d',
    compilationPath,
    programPath,
  ];
  logger.info('Compiling Java', subprocessParams.join(' '));

  const subprocess = cp.spawn(subprocessParams[0] as string, subprocessParams.slice(1), {
    stdio: 'pipe',
  });
  cleanables.push(subprocess);

  await new Promise<void>((resolve, reject) => {
    let stderr = '';
    subprocess.stderr.on('data', (data: Buffer) => {
      stderr += data.toString('utf-8');
    });

    subprocess.on('close', exitCode => {
      if ((exitCode || 0) > 0) {
        reject(new CompilationError(stderr));
      }
      resolve();
    });
  });

  const compiledFileName = fs.readdirSync(compilationPath).find(file => file.endsWith('.class'));
  if (!compiledFileName) {
    throw new Error('Compilation failed');
  }
  const compiledPath = path.join(compilationPath, compiledFileName);
  logger.debug('Compiled Java', compiledPath);

  return compiledPath;
}

async function spawnDebugAdapterServer(
  dap: { host: string, port: number },
  _programPath: string,
  _compiledPath: string,
  cleanables: Cleanable[],
): Promise<void> {
  // To spawn the DAP server, we need to spawn the Eclipse JDT LS
  const lspSubprocess = [
    'docker',
    'run',
    '-i',
    '--rm',
    '--name',
    `java-${dap.port.toString()}`,
    '-p',
    `${dap.port}:4000`,
    '-v',
    `${config.dataPath}:${config.dataPath}`,
    'java-debugger',
    '/usr/project/jdtls/bin/jdtls',
    '-configuration',
    '/usr/project/jdtls/config_linux',
    '-data',
    '/usr/project/jdtls/data',
  ];
  const subprocess = cp.spawn(lspSubprocess[0] as string, lspSubprocess.slice(1), {
    stdio: 'pipe',
  });
  cleanables.push(subprocess);
  logger.debug('Spawned LSP server');

  // subprocess.stdout.on('data', (data: Buffer) => {
  //   logger.debug('[LSP stdout]', data.toString('utf-8'));
  // });
  // subprocess.stderr.on('data', (data: Buffer) => {
  //   logger.debug('[LSP stderr]', data.toString('utf-8'));
  // });

  const endpoint = new JSONRPCEndpoint(subprocess.stdin, subprocess.stdout);
  // Note : the LSP client is not used that much, we could maybe get rid of that dependency and just communicate with the endpoint
  const client = new LspClient(endpoint);

  // Ask to initialize with the java-debug plugin
  const initResult = await client.initialize({
    processId: subprocess.pid || 0,
    rootUri: null,
    capabilities: {},
    workspaceFolders: null,
    initializationOptions: {
      bundles: [ '/usr/project/java-debug/com.microsoft.java.debug.plugin/target/com.microsoft.java.debug.plugin-0.50.0.jar' ],
    },
  });
  logger.debug('LSP Initialized', initResult);

  // Send a raw command to start the debug session
  const dapPort = await endpoint.send('workspace/executeCommand', {
    command: 'vscode.java.startDebugSession',
  }) as number;

  // Send something regularly to keep the connection alive
  const interval = setInterval(() => {
    void endpoint.send('$/progress', { token: 'noop', value: 100 });
  }, 5000);
  cleanables.push({ unsubscribe: () => clearInterval(interval) });
  logger.debug('LSP Debug Session Started', dapPort);
}
