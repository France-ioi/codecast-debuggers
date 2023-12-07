import fs from 'fs';
import path from 'path';
import { parse } from 'ts-command-line-args';
import { logger } from './logger';
import { GetStepsOptions, getSteps } from './debug';
import { getPath } from './utils';

interface CommandLineOptions extends GetStepsOptions {
  help: boolean,
}

async function main(): Promise<void> {
  const mainStartTime = process.hrtime();
  logger.info('[debug] main start', mainStartTime);

  const options = parse<CommandLineOptions>({
    sourcePath: {
      description: 'The source file of the program to debug',
      alias: 's',
      type: String,
      defaultOption: true,
    },
    inputPath: {
      description: 'The input file (STDIN of the program)',
      alias: 'i',
      type: String,
      defaultValue: '',
    },
    breakpoints: {
      description: 'The lines at which to put breakpoints separated by a comma (eg. 1,2,6,42), or * for all',
      alias: 'b',
      type: String,
      defaultValue: '*',
    },
    help: {
      description: 'How to use',
      type: Boolean,
    },
  });

  if (!options.sourcePath || !fs.existsSync(options.sourcePath)) {
    throw new Error(`Source file "${options.sourcePath}" not found.`);
  }

  if (options.inputPath && !fs.existsSync(options.inputPath)) {
    throw new Error(`Input file "${options.inputPath}" not found.`);
  }

  const steps = await getSteps(options);
  logger.info('[debug] steps received');

  const stepsFileName = path.basename(options.sourcePath, path.extname(options.sourcePath)).replace(/[^A-Za-z0-9]/g, '_') + '_steps.json';
  const stepsFilePath = getPath('debug-results', undefined, stepsFileName);

  fs.writeFileSync(stepsFilePath, JSON.stringify(steps), 'utf-8');
  logger.dir(steps, { colors: true, depth: 10 });

  const mainDuration = process.hrtime(mainStartTime);
  logger.log('Main script duration : ', (mainDuration[0] + (mainDuration[1] / 1000000000)));
  logger.log(steps.length.toString() + ' steps saved to: ' + stepsFilePath);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  });

