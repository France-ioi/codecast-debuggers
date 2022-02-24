import fs from 'fs';
import { callScript } from './call-script';
import { logger } from './logger';

const [ filePath ] = process.argv.slice(-1);
if (!filePath || !fs.existsSync(filePath)) throw new Error('File not found. Expected a file path like "samples/php/test.php"');

callScript(filePath, 'off').then(rawJSON => {
  try {
    logger.dir(JSON.parse(rawJSON), { colors: true, depth: 9 });
    fs.writeFileSync('./results/tmp.json', rawJSON, 'utf-8');
  } catch {
    logger.info('could not parse JSON', rawJSON);
  }
}).catch(error => {
  logger.error('Script execution failed', error);
});
