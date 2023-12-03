import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Cleanable, makeRunner, MakeRunnerConfig, Runner, RunnerOptions } from './runner';
import { Stream } from 'stream';
import { config } from '../config';
import { JSONRPCEndpoint, LspClient } from 'ts-lsp-client';
import * as pty from 'node-pty';

export const runStepsWithJavaDebugger = (options: RunnerOptions): Promise<Runner> => {
  const programPath = path.join(config.sourcesPath, 'code-' + options.uid.toString() + '.java');
  fs.writeFileSync(programPath, fs.readFileSync(options.main.relativePath, 'utf-8'));

  const runner = makeRunner({
    connect,
  });

  return runner({ ...options, main: { relativePath: programPath } } as RunnerOptions);
};

const connect: MakeRunnerConfig['connect'] = async ({ uid, cleanables, programPath, logLevel, onOutput, beforeInitialize, inputStream }) => {
  const language = 'Java';
  const dap = {
    host: 'localhost',
    port: uid,
  };

  const compiledPath = await compile(programPath, uid, cleanables);

  logger.debug(1, '[Java StepsRunner] start adapter server');
  await spawnDebugAdapterServer(dap, programPath, compiledPath, cleanables, inputStream);

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
      //const subprocess = pty.spawn(argv, args, {
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

      logger.debug(7, '[Java StepsRunner] ran requested command in terminal');
      setTimeout(resolve, 1000);

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
  // TODO :: handle compilation errors

  const compilationPath = path.join('/tmp', 'javac-' + uid.toString());
  fs.mkdirSync(compilationPath, { recursive: true });
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
    stdio: 'inherit',
  });
  await new Promise<void>(resolve => {
    // TODO :: get compilation errors
    subprocess.on('close', () => resolve());
  });

  const compiledFileName = fs.readdirSync(compilationPath).find(file => file.endsWith('.class'));
  if (!compiledFileName) {
    throw new Error('Compilation failed');
  }
  logger.debug('Compiled Java', compiledFileName);

  // copy to sources folder
  const compiledPath = path.join(config.sourcesPath, compiledFileName);
  fs.copyFileSync(path.join(compilationPath, compiledFileName), compiledPath);
  logger.debug('Copied Java', compiledPath);

  return compiledPath;
}

async function spawnDebugAdapterServer(
  dap: { host: string, port: number },
  _programPath: string,
  _compiledPath: string,
  cleanables: Cleanable[],
  _inputStream: Stream|null,
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
    `${config.sourcesPath}:${config.sourcesPath}`,
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
  subprocess.stderr.on('data', (data: Buffer) => {
    logger.debug('[LSP stderr]', data.toString('utf-8'));
  });


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
  // const initResult = await endpoint.send('initialize', {
  //   processId: subprocess.pid || 0,
  //   rootUri: null,
  //   capabilities: {},
  //   workspaceFolders: null,
  //   initializationOptions: {
  //     bundles: [ '/usr/project/java-debug/com.microsoft.java.debug.plugin/target/com.microsoft.java.debug.plugin-0.49.0.jar' ],
  //   },
  // }) as unknown;
  logger.debug('LSP Initialized', initResult);

  // Send a raw command to start the debug session
  const dapPort = await endpoint.send('workspace/executeCommand', {
    command: 'vscode.java.startDebugSession',
  }) as number;
  logger.debug('LSP Debug Session Started', dapPort);
}
