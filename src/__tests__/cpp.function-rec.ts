/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result, StepSnapshot } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples function_rec.cpp', () => {
  let snapshots!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript({
      sourcePath: './samples/cpp/function_rec.cpp',
      inputPath: '',
      breakpoints: '*',
      help: false,
    }, 'off');

    const result = JSON.parse(stringified) as Result;
    snapshots = reconstructSnapshotsFromSteps(result.steps);
  });

  it('should have valid outputs', () => {
    expect(snapshots.filter(step => step.stdout)).toHaveLength(1);
    expect(snapshots[16]?.stdout).toEqual([ '6\r' ]);
  });

  it('should have valid steps', () => {
    expect(snapshots[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: expect.any(Array),
          },
        ]),
      },
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[10]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 14,
        id: expect.any(Number),
        line: 5,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[12]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[13]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[14]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[15]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'n',
                name: 'n',
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
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[16]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
    expect(snapshots[17]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp',
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [],
          },
        ]),
      },
    ]));
  });
});
