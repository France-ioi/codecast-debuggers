/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-console */
const levels = {
  debug: 'debug',
  off: 'off',
  on: 'on',
  verbose: 'verbose',
} as const;
export type LoggerLevel = keyof typeof levels;

let level: LoggerLevel = levels[process.env.LOG_LEVEL as LoggerLevel] || 'off';

export const logger = {
  get level(): LoggerLevel {
    return level;
  },
  info: (...args: any[]): void => void (level !== levels.off && console.info(...args)),
  log: (...args: any[]): void => void (level !== levels.off && console.log(...args)),
  debug: (...args: any[]): void => void (level === levels.debug && console.debug(...args)),
  dir: (obj: any, options?: Parameters<typeof console.dir>[1]): void => void (level !== levels.off && console.dir(obj, {
    colors: true,
    depth: 3,
    ...options,
  })),
  warn: (...args: any[]): void => console.warn(...args),
  error: (...args: any[]): void => console.error(...args),
  result: (...args: any[]): void => console.info(...args),
  setLevel: (newLevel: LoggerLevel): void => {
    level = newLevel;
  },
};
