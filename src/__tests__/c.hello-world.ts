/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Result } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples hello_world.c', () => {
  let result!: Result;
  beforeAll(async () => {
    const stringified = await callScript('./samples/c/hello_world.c', '', 'off');
    result = JSON.parse(stringified) as Result;
  });

  it('should have valid outputs', () => {
    expect(result.outputs).toHaveLength(2);
    expect(result.outputs[0]).toEqual({
      category: 'stdout',
      column: 9,
      line: 10,
      output: 'number: 1\r',
      source: {
        name: 'hello_world.c',
        path: '/usr/project/samples/c/hello_world.c'
      },
    });
    expect(result.outputs[1]).toEqual({
      category: 'stdout',
      column: 9,
      line: 10,
      output: 'number: 2\r',
      source: {
        name: 'hello_world.c',
        path: '/usr/project/samples/c/hello_world.c'
      },
    });
  });

  it('should have valid steps', () => {
    const steps = reconstructSnapshotsFromSteps(result.steps);
    expect(steps[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 12,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ],
          },
        ]),
      }
    ]));
    expect(steps[1]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 9,
        id: expect.any(Number),
        line: 10,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ])
      }
    ]));
    expect(steps[2]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 24,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(steps[3]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 9,
        id: expect.any(Number),
        line: 10,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(steps[4]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 24,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(steps[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 12,
        id: expect.any(Number),
        line: 13,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
    expect(steps[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 14,
        name: 'main',
        source: {
          name: 'hello_world.c',
          path: '/usr/project/samples/c/hello_world.c'
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
                variables: []
              }
            ]
          },
        ]),
      }
    ]));
  });
});
