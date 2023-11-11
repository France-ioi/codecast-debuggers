import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { CommandLineOptions, commandOptions } from './command_arguments';
import { config } from './config';
import { getSteps } from './debug';

async function main(commandOptions: CommandLineOptions): Promise<void> {
  const mainStartTime = process.hrtime();
  logger.info('[debug] main start', mainStartTime);
  const steps = await getSteps(commandOptions);
  logger.info('[debug] steps received');
  fs.writeFileSync(path.join(config.debugResultsPath, 'steps.json'), JSON.stringify(steps), 'utf-8');
  logger.dir(steps, { colors: true, depth: 10 });
  const mainDuration = process.hrtime(mainStartTime);
  logger.log('Main script duration : ', (mainDuration[0] + (mainDuration[1] / 1000000000)));
}

main(commandOptions)
  .then(() => process.exit(0))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  });
