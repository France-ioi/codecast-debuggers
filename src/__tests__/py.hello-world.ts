/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Steps, StepSnapshot } from '../run-steps/runner';
import { reconstructResultFromSteps } from '../reconstruct-steps';

describe('samples hello_world.py', () => {
  let result!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript('./samples/python/hello_world.py', '', 'off');
    result = reconstructResultFromSteps(JSON.parse(stringified) as Steps);
  });

  it('should have a valid result', () => {
    expect(result[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 1,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: []
          }),
        ]),
      }
    ]));
    expect(result[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 2,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 3,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 4,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '0',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 5,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '0',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 3,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '0',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 4,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '1',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 5,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '1',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 3,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '1',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 4,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '2',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[10]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 5,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '2',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 3,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '2',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[12]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 6,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '2',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
    expect(result[13]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 8,
        column: 1,
        source: expect.objectContaining({
          path: '/usr/project/samples/python/hello_world.py',
        }),
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [
              {
                name: 'i',
                value: '2',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: []
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: []
              }
            ]
          }),
        ]),
      }
    ]));
  });
});
