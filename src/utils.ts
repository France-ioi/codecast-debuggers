import { config } from './config';

const usedDockerPorts: { [port: number]: boolean } = {};

export function getUid(): number {
  const [ min, max ] = config.dockerPortRange;
  for (let port = min; port < max; port++) {
    if (!usedDockerPorts[port]) {
      usedDockerPorts[port] = true;

      return port;
    }
  }

  throw new Error('No free uid/docker ports');
}

export function freeUid(port: number): void {
  delete usedDockerPorts[port];
}