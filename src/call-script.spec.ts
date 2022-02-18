import { callScript } from './call-script'
import { applyPatches, Patch, enablePatches } from 'immer'
import { StepSnapshot } from './run-steps/runner'

enablePatches()

describe('callScript()', () => {
  function reconstructResultFromSteps(steps: Patch[][]): StepSnapshot[] {
    return steps.reduce((acc, patches) => {
      const previous = acc[acc.length-1] ?? {}
      const snapshot = applyPatches(previous, patches) as StepSnapshot
      acc.push(snapshot)
      return acc
    }, [] as StepSnapshot[])
  }

  it.each([
    './samples/c/hello_world.c',
    './samples/cpp/function_rec.cpp',
    './samples/cpp/hello_world.cpp',
    './samples/python/hello_world.py',
    // './samples/php/hello_world.php',
  ])('should match snapshot for %s', async (fileRelativePath) => {
    const stringified = await callScript(fileRelativePath, 'off')
    const steps = JSON.parse(stringified) as Patch[][]
    const result = reconstructResultFromSteps(steps)
    expect(result).toMatchSnapshot()
  })
})
