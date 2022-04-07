import fs from 'fs';
import path from 'path';
import { callScript } from './call-script';
import { logger } from './logger';
import { Result } from './run-steps/runner';
import { reconstructSnapshotsFromSteps } from './reconstruct-snapshots';

/**
 * Arguments can be :
 * - SOURCE_FILE
 * or
 * - SOURCE_FILE INPUT_FILE.txt
 */
const [ lastArgument ] = process.argv.slice(-1);
let filePath, inputPath;
if (lastArgument && path.extname(lastArgument) == '.txt') {
  [ filePath, inputPath ] = process.argv.slice(-2);
} else {
  [ filePath ] = process.argv.slice(-1);
  inputPath = '';
}

if (!filePath || !fs.existsSync(filePath)) {
  throw new Error('File not found. Expected a file path like "samples/php/test.php"');
}
if (inputPath && !fs.existsSync(inputPath)) {
  throw new Error('File not found. Expected a file path like "samples/php/inputs/input.txt"');
}
if (!inputPath) {
  inputPath = '';
}

callScript(filePath, inputPath, 'off').then(rawJSON => {
  try {
    fs.writeFileSync(__dirname + '/../results/steps.json', rawJSON, 'utf-8');

    const result = JSON.parse(rawJSON) as Result;
    const reconstructedJson = reconstructSnapshotsFromSteps(result.steps);
    fs.writeFileSync(__dirname + '/../results/snapshots.json', JSON.stringify(reconstructedJson), 'utf-8');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    logger.info('could not parse JSON', rawJSON);
  }
}).catch(error => {
  logger.error('Script execution failed', error);
});
