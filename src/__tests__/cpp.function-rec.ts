/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples function_rec.cpp', () => {
  let result!: Result;
  beforeAll(async () => {
    const stringified = await callScript('./samples/cpp/function_rec.cpp', '', 'off');
    result = JSON.parse(stringified) as Result;
  });

  it('should have valid stdout', () => {
    expect(result.stdout).toHaveLength(1);
    expect(result.stdout[0]).toEqual({
      column: 23,
      line: 11,
      name: 'main',
      source: {
        name: 'function_rec.cpp',
        path: '/usr/project/samples/cpp/function_rec.cpp'
      },
      stdout: expect.stringContaining('6'),
    });
  });

  it('should have valid steps', () => {
    const steps = reconstructSnapshotsFromSteps(result.steps);
    expect(steps[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: expect.any(Array)
          }
        ]),
      },
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: expect.any(String),
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[10]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 14,
        id: expect.any(Number),
        line: 5,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[12]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[13]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 19,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[14]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 7,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[15]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'fact(int)',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
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
                variables: []
              }
            ]
          }
        ]),
      },
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[16]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 23,
        id: expect.any(Number),
        line: 11,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
    expect(steps[17]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 12,
        name: 'main',
        source: {
          name: 'function_rec.cpp',
          path: '/usr/project/samples/cpp/function_rec.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          }
        ]),
      }
    ]));
  });
});
