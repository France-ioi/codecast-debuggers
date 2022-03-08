// @ts-check
import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { languageByExtension, runSteps, toLanguageExtension } from './run-steps/factory';
import {Stream} from "stream";

logger.debug('process args', process.argv.slice(2));

/**
 * Arguments can be :
 * - SOURCE_FILE
 * or
 * - SOURCE_FILE INPUT_FILE.txt
 */
const [ lastArgument ] = process.argv.slice(-1);
let mainFilePath: string|undefined, inputPath: string|undefined;
if (lastArgument && path.extname(lastArgument) == '.txt') {
  [ mainFilePath, inputPath ] = process.argv.slice(-2);
} else {
  [ mainFilePath ] = process.argv.slice(-1);
  inputPath = '';
}

if (!mainFilePath) throw new Error('mainFilePath must be defined');
if (!inputPath) {
  inputPath = '';
}

const fileExtension = path.extname(mainFilePath);
const language = languageByExtension[toLanguageExtension(fileExtension)];
if (!language) {
  logger.error(new Error(`Unreckognized file extension: "${fileExtension}". Accepted: "${Object.keys(languageByExtension).join('", "')}"`));
  process.exit(1);
}

async function main(): Promise<void> {
  logger.debug({ language, mainFilePath, inputPath });

  if (!mainFilePath) throw new Error('mainFilePath must be defined');
  if (!inputPath) {
    inputPath = '';
  }

  const inputStream = await openInputStream(inputPath);

  const result = await runSteps(language, {
    logLevel: logger.level === 'debug' ? 'On' : 'Off',
    main: { relativePath: mainFilePath },
    inputStream: inputStream,
    inputPath: inputPath,
    files: [],
  });
  logger.result('RESULT_BEGIN', JSON.stringify(result), 'RESULT_END');
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
      resolve(inputStream);
    });
    inputStream.on('error', (e) => {
      reject(e);
    })
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
