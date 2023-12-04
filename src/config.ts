import path from 'path';

export interface Config {
  dataPath: string,
  dataCleanupExclude: string[],
  dockerPortRange: [number, number],
  limitTime: number,
  server: {
    port: number,
    inactivityTimeout: number,
    freeMemoryLimit?: number,

    /**
     * Whether the server cleans leftover resources on startup
     * false by default as this can interfere with manual debugger runs
     */
    cleanLeftoverOnStartup?: boolean,
  },
}

export const config: Config = {
  dataPath: path.join(path.dirname(__filename), '..', 'data'),
  dataCleanupExclude: [ 'debug-results' ],
  dockerPortRange: [ 15000, 20000 ],
  limitTime: 600.0,
  server: {
    port: 9997,
    inactivityTimeout: 5 * 60000,
    freeMemoryLimit: 100 * 1024 * 1024,
    cleanLeftoverOnStartup: false,
  },
};
