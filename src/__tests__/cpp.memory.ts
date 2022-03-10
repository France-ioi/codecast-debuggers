/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples memory.cpp', () => {
  let result!: Result;
  beforeAll(async () => {
    const stringified = await callScript('./samples/cpp/memory.cpp', '', 'off');
    result = JSON.parse(stringified) as Result;
  });

  it('should have valid stdout', () => {
    expect(result.stdout).toHaveLength(1);
    expect(result.stdout[0]).toEqual({
      column: 17,
      line: 7,
      name: 'main',
      source: { name: 'memory.cpp', path: '/usr/project/samples/cpp/memory.cpp' },
      stdout: expect.stringContaining('Hello World 42'),
    });
  });

  it('should have valid steps', () => {
    const steps = reconstructSnapshotsFromSteps(result.steps);
    expect(steps[0]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[1]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[2]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[3]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[4]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[5]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[6]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[7]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[8]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[9]?.stackFrames).toEqual(expect.arrayContaining([
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
