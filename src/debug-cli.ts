import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { CommandLineOptions, commandOptions } from './command_arguments';
import { getSteps } from './debug';
import { getPath } from './utils';


async function main(commandOptions: CommandLineOptions): Promise<void> {
  const mainStartTime = process.hrtime();
  logger.info('[debug] main start', mainStartTime);

  const steps = await getSteps(commandOptions);
  logger.info('[debug] steps received');

  const stepsFileName = path.basename(commandOptions.sourcePath, path.extname(commandOptions.sourcePath)).replace(/[^A-Za-z0-9]/g, '_') + '_steps.json';
  const stepsFilePath = getPath('debug-results', undefined, stepsFileName);

  fs.writeFileSync(stepsFilePath, JSON.stringify(steps), 'utf-8');
  logger.dir(steps, { colors: true, depth: 10 });

  const mainDuration = process.hrtime(mainStartTime);
  logger.log('Main script duration : ', (mainDuration[0] + (mainDuration[1] / 1000000000)));
  logger.log(steps.length.toString() + ' steps saved to: ' + stepsFilePath);
}

main(commandOptions)
  .then(() => process.exit(0))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  });

