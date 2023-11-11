/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getSteps } from '../debug';
import { StepSnapshot } from '../snapshot';

describe('samples hello_world.cpp', () => {
  let snapshots!: StepSnapshot[];
  beforeAll(async () => {
    snapshots = await getSteps({ sourcePath: './samples/cpp/hello_world.cpp', inputPath: '', breakpoints: '*', help: false }) as StepSnapshot[];
  });

  it('should have valid outputs', () => {
    expect(snapshots.filter(step => step.stdout)).toHaveLength(4);
    expect(snapshots[4]?.stdout).toEqual([ 'Hello World\r' ]);
    expect(snapshots[7]?.stdout).toEqual([ '0\r' ]);
    expect(snapshots[10]?.stdout).toEqual([ '2\r' ]);
    expect(snapshots[13]?.stdout).toEqual([ '4\r' ]);
  });

  it('should have valid steps', () => {
    expect(snapshots[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        line: 8,
        name: expect.any(String),
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        column: 17,
        id: expect.any(Number),
        line: 3,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
        column: 13,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[6]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[7]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[9]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '0',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[10]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
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
    ]));
    expect(snapshots[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[12]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 11,
        id: expect.any(Number),
        line: 5,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
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
    ]));
    expect(snapshots[13]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 25,
        id: expect.any(Number),
        line: 6,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
              {
                evaluateName: 'j',
                name: 'j',
                type: 'int',
                value: '4',
                memoryReference: expect.any(String),
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[14]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 4,
        id: expect.any(Number),
        line: 4,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
                variables: [],
              },
            ],
          },
        ]),
      },
    ]));
    expect(snapshots[15]?.stackFrames).toEqual(expect.arrayContaining([
      {
        column: 1,
        id: expect.any(Number),
        line: 8,
        name: 'main',
        source: {
          name: 'hello_world.cpp',
          path: '/usr/project/samples/cpp/hello_world.cpp',
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
