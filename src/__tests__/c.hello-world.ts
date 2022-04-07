/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result, StepSnapshot } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples hello_world.c', () => {
  let snapshots!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript({ sourcePath: './samples/c/hello_world.c', inputPath: '', breakpoints: '*', help: false }, 'off');

    const result = JSON.parse(stringified) as Result;
    snapshots = reconstructSnapshotsFromSteps(result.steps);
  });

  it('should have valid outputs', () => {
    expect(snapshots.filter(step => step.stdout)).toHaveLength(2);
    expect(snapshots[1]?.stdout).toEqual([ 'number: 1\r' ]);
    expect(snapshots[3]?.stdout).toEqual([ 'number: 2\r' ]);
  });

  it('should have valid steps', () => {
    expect(snapshots[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 12,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '0',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 9,
        id: expect.any(Number),
        line: 10,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '1',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 24,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '1',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 9,
        id: expect.any(Number),
        line: 10,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '2',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 24,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '2',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 12,
        id: expect.any(Number),
        line: 13,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '3',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 14,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'i',
                name: 'i',
                type: 'int',
                value: '3',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
  });
});
