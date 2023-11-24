import { RunnerOptions, Runner } from './runner';

export const getRunner = async (language: Language, options: RunnerOptions): Promise<Runner> => {
  switch (language) {
    case 'c': return (await import('./lldb-runner')).runStepsWithLLDB('c', options);
    case 'cpp': return (await import('./lldb-runner')).runStepsWithLLDB('cpp', options);
    case 'java': return (await import('./java-runner')).runStepsWithJavaDebugger(options);
    case 'php': return (await import('./php-runner')).runStepsWithPHPDebugger(options);
    case 'python': return (await import('./python-runner')).runStepsWithPythonDebugger(options);
  }
};

export type Language = 'cpp' | 'c' | 'java' | 'php' | 'python';
export type LanguageExtension = '.c' | '.cpp' | '.java' | '.php' | '.py';
export const toLanguageExtension = (value: string): LanguageExtension => {
  if (Object.getOwnPropertyNames(languageByExtension).includes(value)) {
    return value as LanguageExtension;
  }

  throw new Error(`Unknown extension "${value}". Expected one of "${Object.keys(languageByExtension).join('", "')}"`);
};

export const languageByExtension: Record<LanguageExtension, Language> = {
  '.c': 'c',
  '.cpp': 'cpp',
  '.java': 'java',
  '.php': 'php',
  '.py': 'python',
};

export const extensionByLanguage: Record<Language, LanguageExtension> = {
  'c': '.c',
  'cpp': '.cpp',
  'java': '.java',
  'php': '.php',
  'python': '.py',
};