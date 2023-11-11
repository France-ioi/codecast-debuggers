import path from 'path';

export interface Config {
  sourcesPath: string,
  dockerPortRange: [number, number],
  limitTime: number,
  server: {
    port: number,
    inactivityTimeout: number,
  },
}

export const config: Config = {
  sourcesPath: path.join(path.dirname(__filename), '..', 'sources'),
  dockerPortRange: [ 15000, 20000 ],
  limitTime: 600.0,
  server: {
    port: 8080,
    inactivityTimeout: 5 * 60000,
  },
};
