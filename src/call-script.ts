// @ts-check
import path from 'path';
import cp from 'child_process';
import { logger, LoggerLevel } from './logger';
import { LanguageExtension, toLanguageExtension } from './run-steps/factory';
import { CommandLineOptions } from './command_arguments';

/**
 * Call script
 * @param commandOptions The command line options.
 * @param {LoggerLevel} [logLevel] The log level.
 * @returns {Promise<string>} The stringified JSON.
 */
export function callScript(
  commandOptions: CommandLineOptions,
  logLevel: LoggerLevel = 'off',
  additionalArgs: string[] = [],
): Promise<string> {
  const fileExtension = toLanguageExtension(path.extname(commandOptions.sourcePath));

  const docker = dockerRunConfigs[fileExtension];

  logger.debug(logLevel);

  const { command, args } = dockerRunCommand(docker, commandOptions, additionalArgs, logLevel);

  const begin = 'RESULT_BEGIN';
  const end = 'RESULT_END';
  logger.debug('command\n', [ command, ...args ].join(' \\\n  '));

  const dockerProcess = cp.spawnSync(command, args, { stdio: [ 'inherit', 'pipe', 'inherit' ] });
  const result = dockerProcess.stdout?.toString('utf-8');
  logger.debug(result);

  const rawJSON = result.slice(result.indexOf(begin) + begin.length, result.indexOf(end)).trim();

  return Promise.resolve(rawJSON);
}

type DockerImage = 'lldb-debugger' | 'php-debugger' | 'python-debugger';
interface DockerRunConfig { image: DockerImage }

const dockerRunConfigs: Record<LanguageExtension, DockerRunConfig> = {
  '.c': {
    image: 'lldb-debugger',
  },
  '.cpp': {
    image: 'lldb-debugger',
  },
  '.php': {
    image: 'php-debugger',
  },
  '.py': {
    image: 'python-debugger',
  },
};

/**
 * Returns the docker run command.
 * @param {DockerRunConfig} docker
 * @param {LoggerLevel} logLevel The log leveL.
 * @returns {{ command: string, args: string[] }}
 */
const dockerRunCommand = (
  docker: DockerRunConfig,
  commandOptions: CommandLineOptions,
  additionalArgs: string[],
  logLevel: LoggerLevel,
): { command: string, args: string[] } => {
  //const projectPath = path.dirname(mainFilePath);
  const command = 'docker';
  const args = [
    'run',
    '-it',
    '--rm',
    '--env',
    `LOG_LEVEL=${logLevel}`,
    // Commented for now, tto be able to get he result of profiling (node --prof option, which creates a file).
    // ...mountsPerImage[docker.image].flatMap(toDockerMountArgs),
    // ...toDockerMountArgs({ source: paths.output(paths.selfRoot), target: paths.output(paths.dockerRoot) }),
    // ...toDockerMountArgs({ source: paths.nodeModules(paths.selfRoot), target: paths.nodeModules(paths.dockerRoot) }),
    // ...toDockerMountArgs({ source: path.resolve(paths.selfRoot, projectPath), target: path.resolve(paths.dockerRoot, projectPath) }),
    ...toDockerMountArgs({ source: paths.root(paths.selfRoot), target: paths.root(paths.dockerRoot) }),
    docker.image,
    commandOptions.sourcePath,
    ...additionalArgs,
  ].filter(Boolean);

  return { command, args };
};

const paths = {
  dockerRoot: '/usr/project',
  selfRoot: process.cwd(),
  root: (root: string): string => path.resolve(root),
  sources: (root: string): string => path.resolve(root, './sources'),
  output: (root: string): string => path.resolve(root, './out'),
  nodeModules: (root: string): string => path.resolve(root, './node_modules'),
  packageJson: (root: string): string => path.resolve(root, './package.json'),
  packageLock: (root: string): string => path.resolve(root, './package-lock.json'),

  vscodeLldb: (root: string): string => path.resolve(root, './vscode-lldb'),
  vscodePhpDebug: (root: string): string => path.resolve(root, './vscode-php-debug'),
};

interface DockerMount {
  type?: 'bind',
  source: string,
  target: string,
  readOnly?: boolean,
}
// const mountsPerImage: Record<DockerImage, DockerMount[]> = {
//   'lldb-debugger': [
//     { source: paths.vscodeLldb(paths.selfRoot), target: paths.vscodeLldb(paths.dockerRoot) },
//   ],
//   'php-debugger': [
//     { source: paths.vscodePhpDebug(paths.selfRoot), target: paths.vscodePhpDebug(paths.dockerRoot) },
//   ],
//   'python-debugger': [],
// };

/**
 * Build docker "--mount" CLI argument
 * @param {DockerMount} mount
 * @returns {['--mount', string]} arguments for "--mount"
 */
const toDockerMountArgs = ({ type = 'bind', source, target, readOnly }: DockerMount): ['--mount', string] => {
  const arg = [
    `type=${type}`,
    `source=${source}`,
    `target=${target}`,
    readOnly && 'readonly',
  ].filter(Boolean).join(',');

  return [ '--mount', arg ];
};
