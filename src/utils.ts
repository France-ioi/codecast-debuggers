import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
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
  files: string[],
  containers: Docker.ContainerInfo[],
}

/**
 * @returns A list of server resources possibly left over by a previous execution
 */
export async function getLeftoverResources(): Promise<CleanableServerResourcesList> {
  // Delete all files and folders in sources
  let files: string[] = [];

  try {
    const dataFolders = await fsp.readdir(config.dataPath);
    files = (await Promise.all(dataFolders
      .filter(folder => !config.dataCleanupExclude.includes(folder))
      .map(async folder => {
        const folderPath = path.join(config.dataPath, folder);

        return (await fsp.readdir(folderPath)).map(file => path.join(folder, file));
      })
    )).flat();
  } catch (e) {
    // ignore
  }

  // Stop all docker containers
  const docker = new Docker();
  const containers = (await docker.listContainers()).filter(container => ownDockerNames.some(name => container.Names.some(n => n.startsWith('/' + name))));

  return { files, containers };
}

export function humanReadableLeftoverResources({ files, containers }: CleanableServerResourcesList): string {
  return (files.length ? `Files: ${files.join(', ')}\n` : '') +
    (containers.length ? `Containers: ${containers.map(container => container.Names.map(n => n.substring(1)).join(', ')).join(', ')}\n` : '');
}

/**
 * Removes server resources possibly left over by a previous execution
 */
export async function cleanLeftoverResources(): Promise<void> {
  const { files, containers } = await getLeftoverResources();

  // Delete all files and folders in data
  if (files.length) {
    logger.info(`Removing ${files.length} leftover files...`);
    await Promise.all(files
      .map(file => path.join(config.dataPath, file))
      .map(async file => {
        if ((await fsp.stat(file)).isDirectory()) {
          await fsp.rm(file, { recursive: true });
        } else {
          await fsp.unlink(file);
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

export function getPath(type?: string, uid?: number, filename?: string): string {
  const typeSubfolder = path.join(config.dataPath, type ?? 'tmp');
  const folder = uid && !filename ? path.join(typeSubfolder, uid.toString()) : typeSubfolder;
  fs.mkdirSync(folder, { recursive: true });
  if (filename) {
    const parsed = path.parse(filename);
    const uidFilename = uid ? `${parsed.name}-${uid}${parsed.ext}` : filename;

    return path.join(folder, uidFilename);
  } else {
    return path.join(folder);
  }
}