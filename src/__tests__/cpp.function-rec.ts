/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Steps, StepSnapshot } from '../run-steps/runner';
import { reconstructResultFromSteps } from '../reconstruct-steps';

describe('samples function_rec.cpp', () => {
  let result!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript('./samples/cpp/function_rec.cpp', 'off');
    result = reconstructResultFromSteps(JSON.parse(stringified) as Steps);
  });

  it('should have a valid result', () => {
    expect(result[0]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[1]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[2]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[3]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[4]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[5]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[6]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[7]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[8]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[9]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[10]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[11]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[12]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[13]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[14]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[15]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[16]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[17]?.stackFrames).toEqual(expect.arrayContaining([
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
