import path from 'path';
import { logger } from './logger';
import { languageByExtension, getRunner, toLanguageExtension } from './run-steps/factory';
import { Runner } from './run-steps/runner';
import { StepSnapshot, StepsAcc, TerminationMessage } from './snapshot';
import { getUid } from './utils';

export interface GetStepsOptions {
  sourcePath: string,
  inputPath: string,
  breakpoints: string,
}

export async function getSteps(options: GetStepsOptions): Promise<StepsAcc> {
  const fileExtension = path.extname(options.sourcePath);
  const language = languageByExtension[toLanguageExtension(fileExtension)];
  if (!language) {
    throw new Error(`Unrecognized file extension: "${fileExtension}". Accepted: "${Object.keys(languageByExtension).join('", "')}"`);
  }

  const inputPath = options.inputPath && path.resolve(options.inputPath);

  logger.debug({ language, inputPath, breakpoints: options.breakpoints });

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
      main: { relativePath: options.sourcePath },
      inputPath,
      files: [],
      breakpoints: options.breakpoints,
      onSnapshot,
      onTerminate,
    }).then(r => runner = r);
  });
}