import path from 'path';
import fs from 'fs/promises';
import { config } from './config';
import Docker from 'dockerode';
import { logger } from './logger';

const ownDockerNames = [ 'lldb-', 'java-', 'python-' ];

const usedDockerPorts: { [port: number]: boolean } = {};

export function getUid(): number {
  const [ min, max ] = config.dockerPortRange;

  // TODO :: better / safer way

  return Math.floor(Math.random() * (max - min)) + min;
  // for (let port = min; port < max; port++) {
  //   if (!usedDockerPorts[port]) {
  //     usedDockerPorts[port] = true;

  //     return port;
  //   }
  // }

  // throw new Error('No free uid/docker ports');
}

export function freeUid(port: number): void {
  delete usedDockerPorts[port];
}

export function removeExt(filePath: string): string {
  return filePath.slice(0, -path.extname(filePath).length);
}

interface CleanableServerResourcesList {
  sources: string[],
  containers: Docker.ContainerInfo[],
}

/**
 * @returns A list of server resources possibly left over by a previous execution
 */
export async function getLeftoverResources(): Promise<CleanableServerResourcesList> {
  // Delete all files and folders in sources
  const sources = await fs.readdir(config.sourcesPath);

  // Stop all docker containers
  const docker = new Docker();
  const containers = (await docker.listContainers()).filter(container => ownDockerNames.some(name => container.Names.some(n => n.startsWith('/' + name))));

  return { sources, containers };
}

export function humanReadableLeftoverResources({ sources, containers }: CleanableServerResourcesList): string {
  return (sources.length ? `Sources: ${sources.join(', ')}\n` : '') +
    (containers.length ? `Containers: ${containers.map(container => container.Names.map(n => n.substring(1)).join(', ')).join(', ')}\n` : '');
}

/**
 * Removes server resources possibly left over by a previous execution
 */
export async function cleanLeftoverResources(): Promise<void> {
  const { sources, containers } = await getLeftoverResources();

  // Delete all files and folders in sources
  if (sources.length) {
    logger.info(`Removing ${sources.length} leftover source files...`);
    await Promise.all(sources
      .map(source => path.join(config.sourcesPath, source))
      .map(async source => {
        if ((await fs.stat(source)).isDirectory()) {
          await fs.rmdir(source, { recursive: true });
        } else {
          await fs.unlink(source);
        }
      }));
  }

  // Remove all docker containers
  if (containers.length) {
    logger.info(`Removing ${containers.length} leftover docker containers...`);
    const docker = new Docker();
    await Promise.all(containers.map(async container => docker.getContainer(container.Id).stop()));
  }
}