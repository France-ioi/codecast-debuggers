import { applyPatches, enablePatches } from 'immer';
import { Steps, StepSnapshot } from './run-steps/runner';

enablePatches();

export function reconstructSnapshotsFromSteps(steps: Steps): StepSnapshot[] {
  return steps.reduce((acc, patches) => {
    const previous = acc[acc.length-1] ?? {};
    const snapshot = applyPatches(previous, patches) as StepSnapshot;
    acc.push(snapshot);
    return acc;
  }, [] as StepSnapshot[]);
}
