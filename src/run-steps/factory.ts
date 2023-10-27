import { Result, RunnerOptions } from './runner';

export const runSteps = async (language: Language, options: RunnerOptions): Promise<Result> => {
  switch (language) {
    case 'php': return (await import('./php-runner')).runStepsWithPHPDebugger(options);
    case 'c': return (await import('./lldb-runner')).runStepsWithLLDB('c', options);
    case 'cpp': return (await import('./lldb-runner')).runStepsWithLLDB('cpp', options);
    case 'python': return (await import('./python-runner')).runStepsWithPythonDebugger(options);
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
