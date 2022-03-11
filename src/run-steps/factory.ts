import { RunnerOptions, Steps } from './runner';
import { runStepsWithPHPDebugger } from './php-runner';
import { runStepsWithPythonDebugger } from './python-runner';
import { runStepsWithLLDB } from './lldb-runner';

export const runSteps = (language: Language, options: RunnerOptions): Promise<Steps> => {
  switch (language) {
    case 'php': return runStepsWithPHPDebugger(options);
    case 'c': return runStepsWithLLDB('c', options);
    case 'cpp': return runStepsWithLLDB('cpp', options);
    case 'python': return runStepsWithPythonDebugger(options);
  }
};

export type Language = 'cpp' | 'c' | 'php' | 'python';
export type LanguageExtension = '.c' | '.cpp' | '.php' | '.py';
export const toLanguageExtension = (value: string): LanguageExtension => {
  if (Object.getOwnPropertyNames(languageByExtension).includes(value)) {
    return value as LanguageExtension;
  }

  throw new Error(`Unknown extension "${value}". Expected one of "${Object.keys(languageByExtension).join('", "')}"`);
};

export const languageByExtension: Record<LanguageExtension, Language> = {
  '.c': 'c',
  '.cpp': 'cpp',
  '.php': 'php',
  '.py': 'python',
};
