import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { languageByExtension, runSteps, toLanguageExtension } from './run-steps/factory';
import { Stream } from 'stream';
import { commandOptions } from './command_arguments';

logger.log(process.argv);
logger.debug('process args', commandOptions);

if (!commandOptions.sourcePath) {
  throw new Error('The source path must be defined');
}

const fileExtension = path.extname(commandOptions.sourcePath);
const language = languageByExtension[toLanguageExtension(fileExtension)];
if (!language) {
  logger.error(new Error(`Unreckognized file extension: "${fileExtension}". Accepted: "${Object.keys(languageByExtension).join('", "')}"`));
  process.exit(1);
}

async function main(): Promise<void> {
  const mainStartTime = process.hrtime();

  logger.debug({ language, sourcePath: commandOptions.sourcePath, inputPath: commandOptions.inputPath });

  if (!commandOptions.sourcePath) {
    throw new Error('The source path must be defined');
  }
  if (commandOptions.inputPath) {
    commandOptions.inputPath = path.resolve(commandOptions.inputPath);
  }

  const inputStream = await openInputStream(commandOptions.inputPath);

  try {
    const result = await runSteps(language, {
      logLevel: logger.level === 'debug' ? 'On' : 'Off',
      main: { relativePath: commandOptions.sourcePath },
      inputStream: inputStream,
      inputPath: commandOptions.inputPath,
      files: [],
      breakpoints: commandOptions.breakpoints,
    });

    logger.result('RESULT_BEGIN', JSON.stringify(result), 'RESULT_END');
  } catch (e) {
    logger.result('RESULT_BEGIN', JSON.stringify(e), 'RESULT_END');
  }

  const mainDuration = process.hrtime(mainStartTime);
  logger.log('Main script duration : ', (mainDuration[0] + (mainDuration[1] / 1000000000)));
}

/**
 * Open the read stream. Also wait for the "open" event to fire because it is required when spawning the adapter.
 *
 * @param inputPath The input path.
 *
 * @returns Stream|null The stream or null.
 */
async function openInputStream(inputPath: string): Promise<Stream|null> {
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

const cleanExit = (origin: string) => (): void => {
  logger.debug(`\nCleaning up (${origin})…`);
  // if (runner) await runner.destroy('cleanExit')
};

process.on('SIGINT', cleanExit('SIGINT'));
process.on('SIGTERM', cleanExit('SIGTERM'));

main()
  .then(cleanExit('main'))
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
