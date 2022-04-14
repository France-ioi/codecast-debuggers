import fs from 'fs';
import { callScript } from './call-script';
import { logger } from './logger';
import { Result } from './run-steps/runner';
import { reconstructSnapshotsFromSteps } from './reconstruct-snapshots';
import { commandOptions } from './command_arguments';

logger.log(process.argv);
logger.log('Args: ', commandOptions);

if (!commandOptions.sourcePath || !fs.existsSync(commandOptions.sourcePath)) {
  throw new Error('File not found. Expected a file path like "samples/php/test.php"');
}
if (commandOptions.inputPath && !fs.existsSync(commandOptions.inputPath)) {
  throw new Error('File not found. Expected a file path like "samples/php/inputs/input.txt"');
}

callScript(commandOptions, 'debug', process.argv.slice(3)).then(rawJSON => {
  try {
    fs.writeFileSync(__dirname + '/../results/steps.json', rawJSON, 'utf-8');

    const result = JSON.parse(rawJSON) as Result;
    if (result.error) {
      fs.writeFileSync(__dirname + '/../results/snapshots.json', JSON.stringify(result), 'utf-8');
    } else {
      const reconstructedJson = reconstructSnapshotsFromSteps(result.steps);
      fs.writeFileSync(__dirname + '/../results/snapshots.json', JSON.stringify(reconstructedJson), 'utf-8');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    logger.info('could not parse JSON', rawJSON);
  }
}).catch(error => {
  logger.error('Script execution failed', error);
});
