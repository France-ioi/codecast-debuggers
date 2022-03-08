import fs from 'fs';
import { callScript } from './call-script';
import { logger } from './logger';
import { applyPatches, enablePatches } from 'immer';
import {Step, StepSnapshot} from "./run-steps/runner";

enablePatches();
function reconstructSnapshotsFromSteps(steps: Step[]): StepSnapshot[] {
  return steps.reduce((acc, patches) => {
    const previous = acc[acc.length-1] ?? {};
    const snapshot = applyPatches(previous, patches) as StepSnapshot;
    acc.push(snapshot);
    return acc;
  }, [] as StepSnapshot[]);
}

const [ filePath ] = process.argv.slice(-1);
if (!filePath || !fs.existsSync(filePath)) throw new Error('File not found. Expected a file path like "samples/php/test.php"');

callScript(filePath, 'off').then(rawJSON => {
  try {
    logger.dir(JSON.parse(rawJSON), { colors: true, depth: 9 });
    fs.writeFileSync(__dirname + '/../results/steps.json', rawJSON, 'utf-8');

    const reconstructedJson = reconstructSnapshotsFromSteps(JSON.parse(rawJSON));
    fs.writeFileSync(__dirname + '/../results/snapshots.json', JSON.stringify(reconstructedJson), 'utf-8');
  } catch {
    logger.info('could not parse JSON', rawJSON);
  }
}).catch(error => {
  logger.error('Script execution failed', error);
});
