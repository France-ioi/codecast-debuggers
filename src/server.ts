import fs from 'fs/promises';
import { logger } from './logger';
import { Language, extensionByLanguage, getRunner } from './run-steps/factory';
import { Runner } from './run-steps/runner';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from './config';
import path from 'path';
import { Readable } from 'stream';
import { StepSnapshot, TerminationMessage } from './snapshot';
import { getUid } from './utils';

export interface RemoteExecutionClientPayload {
  messageId: number,
  message: {
    action: string,
    answer?: {
      language: Language,
      fileName: string,
      sourceCode: string,
      input: string,
    },
  },
}

export interface RemoteExecutionServerPayload {
  messageId?: number,
  message: {
    success: boolean,
    snapshot?: unknown,
    error?: {
      type: string,
      message?: string,
    },
  },
}

function main(): void {
  const wss = new WebSocketServer({ port: config.server.port });
  logger.info(`Server started on port ${config.server.port}`);

  wss.on('connection', (ws: WebSocket) => {
    let runner: Runner | null = null;
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
          success: false,
          error: message,
        },
      } as RemoteExecutionServerPayload));
      ws.close();
    }

    async function start(msg: RemoteExecutionClientPayload): Promise<void> {
      if (!msg.message.answer) {
        logger.error('No answer in message', msg);

        return;
      }
      const { language, fileName, sourceCode, input } = msg.message.answer;
      const inputStream = input ? Readable.from(input) : null;
      const inputPath = '';
      const sourcePath = path.join(config.sourcesPath, (fileName.split('/').pop() || 'source') + extensionByLanguage[language]);
      await fs.writeFile(sourcePath, sourceCode);

      runner = await getRunner(language, {
        uid: getUid(),
        logLevel: logger.level === 'debug' ? 'On' : 'Off',
        main: { relativePath: sourcePath },
        inputStream,
        inputPath,
        files: [],
        breakpoints: '*',
        onSnapshot,
        onTerminate,
      });
    }

    ws.on('message', (message: string) => {
      const msg = JSON.parse(message) as RemoteExecutionClientPayload;
      lastMessageId = msg.messageId;
      if (msg.message.action == 'start') {
        void start(msg);
      } else if (msg.message.action == 'into') {
        void runner?.stepIn();
      } else if (msg.message.action == 'over') {
        void runner?.stepOver();
      } else if (msg.message.action == 'out') {
        void runner?.stepOut();
      } else if (msg.message.action == 'close') {
        void runner?.terminate();
        onTerminate({ type: 'close', message: 'Client is closing the connection' });
      }
    });
  });
}

const cleanExit = (origin: string) => (): void => {
  logger.debug(`\nCleaning up (${origin})…`);
  // if (runner) await runner.destroy('cleanExit')
  process.exit(0);
};

process.on('SIGINT', cleanExit('SIGINT'));
process.on('SIGTERM', cleanExit('SIGTERM'));

main();
setInterval(() => { }, 1000);