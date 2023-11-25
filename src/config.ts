import path from 'path';

export interface Config {
  debugResultsPath: string,
  sourcesPath: string,
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
  debugResultsPath: path.join(path.dirname(__filename), '..', 'debug-results'),
  sourcesPath: path.join(path.dirname(__filename), '..', 'sources'),
  dockerPortRange: [ 15000, 20000 ],
  limitTime: 600.0,
  server: {
    port: 9997,
    inactivityTimeout: 5 * 60000,
    freeMemoryLimit: 100 * 1024 * 1024,
    cleanLeftoverOnStartup: false,
  },
};
