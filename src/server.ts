import fs from 'fs';
import { logger } from './logger';
import { Language, extensionByLanguage, getRunner } from './run-steps/factory';
import { Runner } from './run-steps/runner';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from './config';
import { StepSnapshot, TerminationMessage } from './snapshot';
import { cleanLeftoverResources, getLeftoverResources, getPath, getUid, humanReadableLeftoverResources } from './utils';
import { freemem } from 'os';

export interface RemoteExecutionClientPayload {
  messageId: number,
  message: {
    action: string,
    answer?: {
      language: string,
      fileName: string,
      sourceCode: string,
      input: string,
    },
    speed?: number,
  },
}

export interface RemoteExecutionServerPayload {
  messageId?: number,
  message: {
    success: boolean,
    snapshot?: StepSnapshot,
    error?: {
      type: string,
      message?: string,
    },
  },
}

function handleConnection(ws: WebSocket): void {
  // Check memory left
  if (config.server.freeMemoryLimit && freemem() < config.server.freeMemoryLimit) {
    ws.send(JSON.stringify({
      messageId: 0,
      message: {
        success: false,
        error: {
          type: 'unavailable',
          message: 'Server is out of memory',
        },
      },
    } as RemoteExecutionServerPayload));
    ws.close();

    return;
  }

  const uid = getUid();
  let runner: Runner | null = null;
  let sourcePath: string | null = null;
  let lastMessageId = 0;

  function onSnapshot(snapshot: StepSnapshot): void {
    logger.debug('snapshot', snapshot);
    ws.send(JSON.stringify({
      messageId: lastMessageId,
      message: {
        success: true,
        snapshot,
      },
    } as RemoteExecutionServerPayload));
  }

  function onTerminate(message: TerminationMessage, isReply: boolean = true): void {
    logger.debug('terminate', message);
    ws.send(JSON.stringify({
      messageId: isReply ? lastMessageId : undefined,
      message: {
        success: true,
        snapshot: {
          terminated: true,
          terminatedReason: message.type !== 'end' ? message.message : undefined,
        },
      },
    } as RemoteExecutionServerPayload));
    ws.close();
    if (sourcePath && fs.existsSync(sourcePath)) {
      void fs.unlinkSync(sourcePath);
    }
  }

  async function start(msg: RemoteExecutionClientPayload): Promise<void> {
    if (!msg.message.answer) {
      logger.error('No answer in message', msg);

      return;
    }
    const { sourceCode, input } = msg.message.answer;
    let clientLanguage = msg.message.answer.language;
    if (clientLanguage == 'unix') {
      clientLanguage = 'cpp';
    }
    const language = clientLanguage as Language;
    const inputPath = '';
    if (input) {
      // TODO :: change folder
      const inputPath = getPath('inputs', uid, 'input.txt');
      fs.writeFileSync(inputPath, input);
    }
    sourcePath = getPath('sources', uid, 'source' + extensionByLanguage[language]);
    fs.writeFileSync(sourcePath, sourceCode);

    runner = await getRunner(language, {
      uid,
      logLevel: logger.level === 'debug' ? 'On' : 'Off',
      main: { relativePath: sourcePath },
      inputPath,
      files: [],
      breakpoints: '*',
      onSnapshot,
      onTerminate,
    });
  }

  ws.on('message', (message: string) => {
    const msg = JSON.parse(message) as RemoteExecutionClientPayload;
    logger.debug('[Server] received message', msg);
    lastMessageId = msg.messageId;

    if (msg.message.action == 'start') {
      void start(msg);
    } else if (msg.message.action == 'close') {
      void runner?.terminate();
      onTerminate({ type: 'close', message: 'Client is closing the connection' });
    } else {
      // Update speed
      runner?.setSpeed(msg.message.speed);
      if (msg.message.action == 'run') {
        // consider a run action is still a stepIn for now, until we support user-defined breakpoints
        void runner?.stepIn();
      } else if (msg.message.action == 'into') {
        void runner?.stepIn();
      } else if (msg.message.action == 'over') {
        void runner?.stepOver();
      } else if (msg.message.action == 'out') {
        void runner?.stepOut();
      }
    }
  });
}

async function main(): Promise<void> {
  // Check for cleanable resources
  if (config.server.cleanLeftoverOnStartup || process.argv.includes('--clean')) {
    await cleanLeftoverResources();
  } else {
    const { files, containers } = await getLeftoverResources();
    if (files.length > 0 || containers.length > 0) {
      logger.warn('Warning : leftover resources found.', humanReadableLeftoverResources({ files, containers }));
      logger.warn('Execute the server with the --clean flag to clean them up.');
    }
  }

  // Start the websocket server
  const wss = new WebSocketServer({ port: config.server.port });
  wss.on('connection', handleConnection);

  logger.info(`Server started on port ${config.server.port}`);
}

const cleanExit = (origin: string) => (): void => {
  logger.debug(`\nCleaning up (${origin})…`);
  // if (runner) await runner.destroy('cleanExit')
  process.exit(0);
};

process.on('SIGINT', cleanExit('SIGINT'));
process.on('SIGTERM', cleanExit('SIGTERM'));

void main();