/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Steps, StepSnapshot } from '../run-steps/runner';
import { reconstructResultFromSteps } from '../reconstruct-steps';

describe('samples memory.cpp', () => {
  let result!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript('./samples/cpp/memory.cpp', '', 'off');
    result = reconstructResultFromSteps(JSON.parse(stringified) as Steps);
  });

  it('should have a valid result', () => {
    expect(result[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: expect.any(String),
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          },
        ]),
      }
    ]));
    expect(result[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: expect.any(String),
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          },
        ]),
      }
    ]));
    expect(result[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: expect.any(String),
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: expect.arrayContaining([]),
          },
        ]),
      },
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: expect.any(String),
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          },
        ]),
      }
    ]));
    expect(result[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: expect.any(String),
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: []
          },
        ]),
      }
    ]));
    expect(result[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '<null>',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '<parent is NULL>',
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 15,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '<null>',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '<parent is NULL>',
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 10,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '0',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '0',
                    memoryReference: expect.any(String),
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 17,
        id: expect.any(Number),
        line: 7,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '42',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '42',
                    memoryReference: expect.any(String),
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '42',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '42',
                    memoryReference: expect.any(String),
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 9,
        name: 'main',
        source: {
          name: 'memory.cpp',
          path: '/usr/project/samples/cpp/memory.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: 'test',
                name: 'test',
                type: 'float *',
                value: '0',
                memoryReference: expect.any(String),
                memory: {
                  address: expect.any(String),
                  data: expect.any(String),
                  unreadableBytes: expect.any(Number)
                },
                variablesReference: expect.any(Number),
                variables: [
                  {
                    evaluateName: 'test.*test',
                    name: '*test',
                    type: 'float',
                    value: '0',
                    memoryReference: expect.any(String),
                    variablesReference: expect.any(Number),
                    variables: []
                  }
                ]
              }
            ]
          },
        ]),
      }
    ]));
  });
});
