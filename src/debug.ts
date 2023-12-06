import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { languageByExtension, getRunner, toLanguageExtension } from './run-steps/factory';
import { CommandLineOptions, commandOptions } from './command_arguments';
import { Runner } from './run-steps/runner';
import { StepSnapshot, StepsAcc, TerminationMessage } from './snapshot';
import { getUid } from './utils';

logger.log(process.argv);
logger.debug('process args', commandOptions);

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

  return new Promise(resolve => {
    const steps: StepsAcc = [];
    let runner: Runner | null = null;

    function onSnapshot(snapshot: StepSnapshot): void {
      steps.push(snapshot);
      void runner?.stepIn();
    }

    function onTerminate(message: TerminationMessage): void {
      logger.info('[debug] onTerminate', message);
      steps.push({ terminated: true, terminatedReason: message.type != 'end' ? message.message : undefined });
      resolve(steps);
    }

    void getRunner(language, {
      uid: getUid(),
      logLevel: logger.level === 'debug' ? 'On' : 'Off',
      main: { relativePath: commandOptions.sourcePath },
      inputPath: commandOptions.inputPath,
      files: [],
      breakpoints: commandOptions.breakpoints,
      onSnapshot,
      onTerminate,
    }).then(r => runner = r);
  });
}