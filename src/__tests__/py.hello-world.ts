/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples hello_world.py', () => {
  let result!: Result;
  beforeAll(async () => {
    const stringified = await callScript('./samples/python/hello_world.py', '', 'off');
    result = JSON.parse(stringified) as Result;
  });

  it('should have valid outputs', () => {
    expect(result.outputs).toHaveLength(4);
    expect(result.outputs[0]).toEqual({
      category: 'stdout',
      column: 1,
      line: 5,
      output: expect.stringContaining('Number: 0'),
      source: {
        path: '/usr/project/samples/python/hello_world.py',
        sourceReference: 0
      },
    });
    expect(result.outputs[1]).toEqual({
      category: 'stdout',
      column: 1,
      line: 5,
      output: expect.stringContaining('Number: 2'),
      source: {
        path: '/usr/project/samples/python/hello_world.py',
        sourceReference: 0
      },
    });
    expect(result.outputs[2]).toEqual({
      category: 'stdout',
      column: 1,
      line: 5,
      output: expect.stringContaining('Number: 4'),
      source: {
        path: '/usr/project/samples/python/hello_world.py',
        sourceReference: 0
      },
    });
    expect(result.outputs[3]).toEqual({
      category: 'stdout',
      column: 1,
      line: 8,
      output: expect.stringContaining('Goodbye world'),
      source: {
        path: '/usr/project/samples/python/hello_world.py',
        sourceReference: 0
      },
    });
  });

  it('should have valid steps', () => {
    const steps = reconstructSnapshotsFromSteps(result.steps);
    expect(steps[0]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[1]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[2]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[3]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[4]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[5]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[6]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[7]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[8]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[9]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[10]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[11]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[12]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(steps[13]?.stackFrames).toEqual(expect.arrayContaining([
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
