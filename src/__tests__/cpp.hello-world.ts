/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Steps, StepSnapshot } from '../run-steps/runner';
import { reconstructResultFromSteps } from '../reconstruct-steps';

describe('samples hello_world.cpp', () => {
  let result!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript('./samples/cpp/hello_world.cpp', 'off');
    result = reconstructResultFromSteps(JSON.parse(stringified) as Steps);
  });

  it('should have a valid result', () => {
    expect(result[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
        },
        scopes: expect.arrayContaining([
          {
            expensive: expect.any(Boolean),
            name: 'Local',
            variablesReference: expect.any(Number),
            variables: [
              {
                evaluateName: '__initialize_p',
                name: '__initialize_p',
                type: 'int',
                value: '1',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: '__priority',
                name: '__priority',
                type: 'int',
                value: '65535',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      },
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
        column: 17,
        id: expect.any(Number),
        line: 3,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
    expect(result[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 13,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[10]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '2',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[12]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '2',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[13]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '4',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[14]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(result[15]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp'
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
  });
});
