import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import { SocketDebugClient } from 'node-debugprotocol-client';
import { DebugProtocol } from 'vscode-debugprotocol';
import { logger } from '../logger';
import { Cleanable, makeRunner, MakeRunnerConfig, Runner, RunnerOptions } from './runner';
import { Stream } from 'stream';
import { config } from '../config';

export const runStepsWithJavaDebugger = (options: RunnerOptions): Promise<Runner> => {
  const compiledPath = path.join(config.sourcesPath, 'code-' + options.uid.toString() + '.java');
  fs.writeFileSync(compiledPath, fs.readFileSync(options.main.relativePath, 'utf-8'));

  const runner = makeRunner({
    connect,
  });

  return runner({ ...options, main: { relativePath: compiledPath } } as RunnerOptions);
};

const connect: MakeRunnerConfig['connect'] = async ({ uid, cleanables, programPath, logLevel, onOutput, beforeInitialize, inputStream }) => {
  const language = 'Java';
  const dap = {
    host: 'localhost',
    port: uid,
  };

  const compiledPath = await compile(programPath, uid);

  logger.debug(1, '[Java StepsRunner] start adapter server');
  await spawnDebugAdapterServer(dap, compiledPath, cleanables, inputStream);

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
  });

  logger.debug('Initialize Response : ', initializeResponse);

  logger.debug(6, '[Java StepsRunner] launch client', compiledPath);
  const launched = client.launch({
    program: compiledPath,
    mainClass: 'HelloWorld',
    classPaths: [ path.dirname(compiledPath) ],
    justMyCode: false,
  } as DebugProtocol.LaunchRequestArguments);

  await Promise.race([
    launched.then(response => {
      logger.debug('[Java StepsRunner] launch response', response);
    }),
    initialized,
  ]);

  return { client };
};


async function compile(programPath: string, uid: number): Promise<string> {
  // TODO :: handle compilation errors
  const compilationPath = path.join('/tmp', 'javac-' + uid.toString());
  fs.mkdirSync(compilationPath, { recursive: true });

  const subprocessParams = [
    'docker',
    'run',
    '--rm',
    '-v',
    `${programPath}:${programPath}:ro`,
    '-v',
    `${compilationPath}:${compilationPath}`,
    'java-debugger',
    'javac',
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
  const compiledPath = path.join(config.sourcesPath, 'HelloWorld.class');
  //const compiledPath = path.join(config.sourcesPath, 'code-' + uid.toString() + '.class');
  fs.copyFileSync(path.join(compilationPath, compiledFileName), compiledPath);

  return compiledPath;
}

async function spawnDebugAdapterServer(
  dap: { host: string, port: number },
  programPath: string,
  cleanables: Cleanable[],
  inputStream: Stream|null,
): Promise<void> {
  return new Promise<void>(resolve => {
    const subprocessParams = [
      'docker',
      'run',
      '--rm',
      '-v',
      `${programPath}:${programPath}:ro`,
      '-p',
      `${dap.port.toString()}:4000`,
      '--name',
      'java-' + dap.port.toString(),
      'java-debugger',
      'java',
      '-cp',
      '.:/usr/project/java-debug/com.microsoft.java.debug.plugin/target/com.microsoft.java.debug.plugin-0.50.0.jar:/root/.m2/repository/p2/osgi/bundle/com.google.gson/2.10.1.v20230109-0753/com.google.gson-2.10.1.v20230109-0753.jar:/root/.m2/repository/com/google/guava/guava/32.1.3-jre/guava-32.1.3-jre.jar:/root/.m2/repository/com/google/guava/listenablefuture/9999.0-empty-to-avoid-conflict-with-guava/listenablefuture-9999.0-empty-to-avoid-conflict-with-guava.jar:/root/.m2/repository/com/google/code/findbugs/jsr305/3.0.2/jsr305-3.0.2.jar:/root/.m2/repository/org/checkerframework/checker-qual/3.37.0/checker-qual-3.37.0.jar:/root/.m2/repository/com/google/errorprone/error_prone_annotations/2.21.1/error_prone_annotations-2.21.1.jar:/root/.m2/repository/com/google/j2objc/j2objc-annotations/2.8/j2objc-annotations-2.8.jar:/root/.m2/repository/com/google/guava/failureaccess/1.0.2/failureaccess-1.0.2.jar:/usr/project/java-debug/com.microsoft.java.debug.plugin/lib/commons-io-2.11.0.jar:/usr/project/java-debug/com.microsoft.java.debug.plugin/lib/rxjava-2.2.21.jar:/usr/project/java-debug/com.microsoft.java.debug.plugin/lib/reactive-streams-1.0.4.jar:/usr/project/java-debug/com.microsoft.java.debug.plugin/lib/com.microsoft.java.debug.core-0.50.0.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.runtime/3.30.0.v20231102-0719/org.eclipse.core.runtime-3.30.0.v20231102-0719.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.debug.core/3.21.200.v20231021-1513/org.eclipse.debug.core-3.21.200.v20231021-1513.jar:/root/.m2/repository/.cache/tycho/org.eclipse.jdt.debug-3.21.200.v20231103-0755.jar/jdimodel.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.core/3.36.0.v20231108-0715/org.eclipse.jdt.core-3.36.0.v20231108-0715.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.core.manipulation/1.20.0.v20231106-1537/org.eclipse.jdt.core.manipulation-1.20.0.v20231106-1537.jar:/root/.m2/repository/.cache/tycho/org.eclipse.jdt.ls.core-1.30.0.202311221951.jar/lib/jsoup-1.14.2.jar:/root/.m2/repository/.cache/tycho/org.eclipse.jdt.ls.core-1.30.0.202311221951.jar/lib/remark-1.2.0.jar:/root/.m2/repository/.cache/tycho/org.eclipse.jdt.ls.core-1.30.0.202311221951.jar/lib/java-decompiler-engine-231.9011.34.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.ls.core/1.30.0.202311221951/org.eclipse.jdt.ls.core-1.30.0.202311221951.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.launching/3.21.0.v20231103-0759/org.eclipse.jdt.launching-3.21.0.v20231103-0759.jar:/root/.m2/repository/org/apache/commons/commons-lang3/3.13.0/commons-lang3-3.13.0.jar:/root/.m2/repository/org/eclipse/lsp4j/org.eclipse.lsp4j/0.21.0/org.eclipse.lsp4j-0.21.0.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.osgi/3.18.600.v20231106-1816/org.eclipse.osgi-3.18.600.v20231106-1816.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-antlr.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-bcel.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-bsf.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-log4j.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-oro.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-regexp.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-resolver.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-apache-xalan2.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-commons-logging.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-commons-net.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-imageio.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-jakartamail.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-javamail.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-jdepend.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-jmf.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-jsch.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-junit.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-junit4.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-junitlauncher.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-launcher.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-netrexx.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-swing.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-testutil.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant-xz.jar:/root/.m2/repository/.cache/tycho/org.apache.ant-1.10.14.v20230922-1200.jar/lib/ant.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.commands/3.11.200.v20231108-1058/org.eclipse.core.commands-3.11.200.v20231108-1058.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.equinox.common/3.18.200.v20231106-1826/org.eclipse.equinox.common-3.18.200.v20231106-1826.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.contenttype/3.9.200.v20230914-0751/org.eclipse.core.contenttype-3.9.200.v20230914-0751.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.equinox.preferences/3.10.400.v20231102-2218/org.eclipse.equinox.preferences-3.10.400.v20231102-2218.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.equinox.registry/3.11.400.v20231102-2218/org.eclipse.equinox.registry-3.11.400.v20231102-2218.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.expressions/3.9.200.v20230921-0857/org.eclipse.core.expressions-3.9.200.v20230921-0857.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.filebuffers/3.8.200.v20230921-0933/org.eclipse.core.filebuffers-3.8.200.v20230921-0933.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.text/3.13.100.v20230801-1334/org.eclipse.text-3.13.100.v20230801-1334.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.filesystem/1.10.200.v20231102-0934/org.eclipse.core.filesystem-1.10.200.v20231102-0934.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.jobs/3.15.100.v20230930-1207/org.eclipse.core.jobs-3.15.100.v20230930-1207.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.net/1.5.200.v20231106-1240/org.eclipse.core.net-1.5.200.v20231106-1240.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.equinox.security/1.4.100.v20231012-1825/org.eclipse.equinox.security-1.4.100.v20231012-1825.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.resources/3.20.0.v20231102-0934/org.eclipse.core.resources-3.20.0.v20231102-0934.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.equinox.app/1.6.400.v20231103-0807/org.eclipse.equinox.app-1.6.400.v20231103-0807.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.core.variables/3.6.200.v20230914-0751/org.eclipse.core.variables-3.6.200.v20230914-0751.jar:/root/.m2/repository/org/osgi/org.osgi.service.prefs/1.1.2/org.osgi.service.prefs-1.1.2.jar:/root/.m2/repository/org/osgi/osgi.annotation/8.0.1/osgi.annotation-8.0.1.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.apt.core/3.8.200.v20231108-0715/org.eclipse.jdt.apt.core-3.8.200.v20231108-0715.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.jdt.core.compiler.batch/3.36.0.v20231108-0715/org.eclipse.jdt.core.compiler.batch-3.36.0.v20231108-0715.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.ltk.core.refactoring/3.14.200.v20231106-1218/org.eclipse.ltk.core.refactoring-3.14.200.v20231106-1218.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.search.core/3.16.0.v20230921-0933/org.eclipse.search.core-3.16.0.v20230921-0933.jar:/root/.m2/repository/org/eclipse/lsp4j/org.eclipse.lsp4j.jsonrpc/0.21.0/org.eclipse.lsp4j.jsonrpc-0.21.0.jar:/root/.m2/repository/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar:/root/.m2/repository/p2/osgi/bundle/org.eclipse.xtext.xbase.lib/2.33.0.v20231112-1245/org.eclipse.xtext.xbase.lib-2.33.0.v20231112-1245.jar',
      'com/microsoft/java/debug/plugin/internal/JavaDebugServer',
    ];

    logger.log('Spawn Java', subprocessParams);
    logger.log('cmdline', subprocessParams.join(' '));

    const subprocess = cp.spawn(subprocessParams[0] as string, subprocessParams.slice(1), {
      stdio: [ (inputStream) ? inputStream : 'ignore', 'pipe', 'pipe' ],
    });
    cleanables.push(subprocess);

    const onMessage = (origin: string) => (data: Buffer) => {
      const message = data.toString('utf-8');
      logger.debug('[Java DAP]', origin, message);
    };
    subprocess.stdout.on('data', onMessage('stdout'));
    subprocess.stderr.on('data', onMessage('stderr'));
    // We have no way of knowing when it actually starts listening
    // TODO :: maybe modify the server to output something when it's ready?
    setTimeout(() => resolve(), 1000);

    subprocess.on('error', error => logger.error('Server error:', error));
  });
}