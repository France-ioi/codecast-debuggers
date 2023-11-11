import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { languageByExtension, getRunner, toLanguageExtension } from './run-steps/factory';
import { Stream } from 'stream';
import { CommandLineOptions, commandOptions } from './command_arguments';
import { Runner, StepSnapshot, StepsAcc, TerminationMessage } from './run-steps/runner';

logger.log(process.argv);
logger.debug('process args', commandOptions);

/**
 * Open the read stream. Also wait for the "open" event to fire because it is required when spawning the adapter.
 *
 * @param inputPath The input path.
 *
 * @returns Stream|null The stream or null.
 */
async function openInputStream(inputPath: string): Promise<Stream | null> {
  return new Promise((resolve, reject) => {
    if (!inputPath) {
      return resolve(null);
    }

    const inputStream = fs.createReadStream(inputPath);

    inputStream.on('open', () => {
      logger.debug('Input stream is open : ', inputPath);
      resolve(inputStream);
    });
    inputStream.on('error', e => {
      logger.error('Cannot open file ', inputPath, e);
      reject(e);
    });
  });
}

export async function getSteps(commandOptions: CommandLineOptions): Promise<StepsAcc> {
  if (!commandOptions.sourcePath || !fs.existsSync(commandOptions.sourcePath)) {
    throw new Error(`Source file "${commandOptions.sourcePath}" not found.`);
  }

  if (commandOptions.inputPath && !fs.existsSync(commandOptions.inputPath)) {
    throw new Error(`Input file "${commandOptions.inputPath}" not found.`);
  }

  const fileExtension = path.extname(commandOptions.sourcePath);
  const language = languageByExtension[toLanguageExtension(fileExtension)];
  if (!language) {
    logger.error(new Error(`Unrecognized file extension: "${fileExtension}". Accepted: "${Object.keys(languageByExtension).join('", "')}"`));
    process.exit(1);
  }

  logger.debug({ language, sourcePath: commandOptions.sourcePath, inputPath: commandOptions.inputPath });

  if (commandOptions.inputPath) {
    commandOptions.inputPath = path.resolve(commandOptions.inputPath);
  }

  const inputStream = await openInputStream(commandOptions.inputPath);

  return new Promise(resolve => {
    const steps: StepsAcc = [];
    let runner: Runner | null = null;

    function onSnapshot(snapshot: StepSnapshot): void {
      steps.push(snapshot);
      void runner?.stepIn();
    }

    function onTerminate(message: TerminationMessage): void {
      logger.info('onTerminate', message);
      steps.push(message);
      resolve(steps);
    }

    void getRunner(language, {
      logLevel: logger.level === 'debug' ? 'On' : 'Off',
      main: { relativePath: commandOptions.sourcePath },
      inputStream: inputStream,
      inputPath: commandOptions.inputPath,
      files: [],
      breakpoints: commandOptions.breakpoints,
      onSnapshot,
      onTerminate,
    }).then(r => runner = r);
  });
}

async function main(commandOptions: CommandLineOptions): Promise<void> {
  const mainStartTime = process.hrtime();
  logger.info('main start', mainStartTime);
  const steps = await getSteps(commandOptions);
  fs.writeFileSync(__dirname + '/../results/steps.json', JSON.stringify(steps), 'utf-8');
  const mainDuration = process.hrtime(mainStartTime);
  logger.log('Main script duration : ', (mainDuration[0] + (mainDuration[1] / 1000000000)));
}

main(commandOptions)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
