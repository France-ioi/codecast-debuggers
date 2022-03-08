/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { callScript } from '../call-script';
import { Steps, StepSnapshot } from '../run-steps/runner';
import { reconstructSnapshotsFromSteps } from '../reconstruct-snapshots';

describe('samples hello_world.c', () => {
  let result!: StepSnapshot[];
  beforeAll(async () => {
    const stringified = await callScript('./samples/c/hello_world.c', '', 'off');
    result = reconstructSnapshotsFromSteps(JSON.parse(stringified) as Steps);
  });

  it('should have a valid result', () => {
    expect(result[0]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[1]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[2]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[3]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[4]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[5]?.stackFrames).toEqual(expect.arrayContaining([
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
    expect(result[6]?.stackFrames).toEqual(expect.arrayContaining([
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
