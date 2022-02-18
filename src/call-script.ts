// @ts-check
import path from 'path'
import cp from 'child_process'
import { logger, LoggerLevel } from './logger'
import { LanguageExtension, toLanguageExtension } from './run-steps/factory'


/**
 * Call script
 * @param {string} mainFilePath path to main file of the project to debug
 * @param {LoggerLevel} [logLevel]
 * @returns {Promise<string>} stringified JSON
 */
export async function callScript(mainFilePath: string, logLevel: LoggerLevel = 'off'): Promise<string> {
  const fileExtension = toLanguageExtension(path.extname(mainFilePath))
  const docker = dockerRunConfigs[fileExtension]
  if (!docker) throw new Error(`Unknown extension "${fileExtension}". Accepted: "${Object.keys(dockerRunConfigs).join('", "')}"`)

  const { command, args } = dockerRunCommand(docker, mainFilePath, logLevel)

  const begin = 'RESULT_BEGIN'
  const end = 'RESULT_END'
  logger.info('command\n', [command, ...args].join(' \\\n  '))
  const dockerProcess = cp.spawnSync(command, args, { stdio: ['inherit', 'pipe', 'inherit'] })
  const result = dockerProcess.stdout?.toString('utf-8')
  
  const rawJSON = result.slice(result.indexOf(begin) + begin.length, result.indexOf(end)).trim()
  return rawJSON
}

type DockerImage = 'lldb-debugger' | 'php-debugger' | 'python-debugger'
type DockerRunConfig = { image: DockerImage }

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
  }
}

/**
 * Returns the docker run command
 * @param {DockerRunConfig} docker
 * @param {string} mainFilePath
 * @param {LoggerLevel} logLevel
 * @returns {{ command: string, args: string[] }}
 */
const dockerRunCommand = (docker: DockerRunConfig, mainFilePath: string, logLevel: LoggerLevel) => {
  const projectPath = path.dirname(mainFilePath)
  const command = 'docker'
  const args = [
    'run',
    '-it',
    '--rm',
    '--env',
    `LOG_LEVEL=${logLevel}`,
    ...mountsPerImage[docker.image].flatMap(toDockerMountArgs),
    ...toDockerMountArgs({ source: paths.output(paths.selfRoot), target: paths.output(paths.dockerRoot) }),
    ...toDockerMountArgs({ source: paths.nodeModules(paths.selfRoot), target: paths.nodeModules(paths.dockerRoot) }),
    ...toDockerMountArgs({ source: path.resolve(paths.selfRoot, projectPath), target: path.resolve(paths.dockerRoot, projectPath) }),
    docker.image,
    mainFilePath,
  ].filter(Boolean)
  return { command, args }
}

const paths = {
  dockerRoot: '/usr/project',
  selfRoot: process.cwd(),
  sources: (root: string) => path.resolve(root, './sources'),
  output: (root: string) => path.resolve(root, './out'),
  nodeModules: (root: string) => path.resolve(root, './node_modules'),
  packageJson: (root: string) => path.resolve(root, './package.json'),
  packageLock: (root: string) => path.resolve(root, './package-lock.json'),

  vscodeLldb: (root: string) => path.resolve(root, './vscode-lldb'),
  vscodePhpDebug: (root: string) => path.resolve(root, './vscode-php-debug'),
}

type DockerMount = {
  type?: 'bind',
  source: string,
  target: string,
  readOnly?: boolean,
}
const mountsPerImage: Record<DockerImage, DockerMount[]> = {
  'lldb-debugger': [
    { source: paths.vscodeLldb(paths.selfRoot), target: paths.vscodeLldb(paths.dockerRoot) },
  ],
  'php-debugger': [
    { source: paths.vscodePhpDebug(paths.selfRoot), target: paths.vscodePhpDebug(paths.dockerRoot) },
  ],
  'python-debugger': [],
}

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
  ].filter(Boolean).join(',')
  return ['--mount', arg]
}
