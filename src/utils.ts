import { config } from './config';

const usedDockerPorts: { [port: number]: boolean } = {};

export function getDockerPort(): number {
  const [ min, max ] = config.dockerPortRange;
  for (let port = min; port < max; port++) {
    if (!usedDockerPorts[port]) {
      usedDockerPorts[port] = true;

      return port;
    }
  }

  throw new Error('No free docker ports');
}

export function freeDockerPort(port: number): void {
  delete usedDockerPorts[port];
}