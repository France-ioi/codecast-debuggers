/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getSteps } from '../debug';
import { StepSnapshot } from '../run-steps/runner';

describe('samples hello_world.py', () => {
  let snapshots!: StepSnapshot[];
  beforeAll(async () => {
    snapshots = await getSteps({ sourcePath: './samples/python/hello_world.py', inputPath: '', breakpoints: '*', help: false }) as StepSnapshot[];
  });


  it('should have valid outputs', () => {
    expect(snapshots.filter(step => step.stdout || step.stderr)).toHaveLength(4);
    expect(snapshots[5]?.stdout).toEqual([ expect.stringContaining('Number: 0') ]);
    expect(snapshots[8]?.stdout).toEqual([ expect.stringContaining('Number: 2') ]);
    expect(snapshots[11]?.stdout).toEqual([ expect.stringContaining('Number: 4') ]);
    expect(snapshots[14]?.stderr).toEqual([ expect.stringContaining('Goodbye world') ]);
  });

  it('should have valid steps', () => {
    expect(snapshots[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: 2,
        name: '<module>',
        line: 1,
        column: 1,
        source: {
          path: '/usr/project/samples/python/hello_world.py',
          sourceReference: 0,
        },
        scopes: expect.arrayContaining([
          expect.objectContaining({
            name: 'Locals',
            variablesReference: expect.any(Number),
            expensive: expect.any(Boolean),
            variables: [],
          }),
        ]),
      },
    ]));
    expect(snapshots[1]?.stackFrames).toEqual(expect.arrayContaining([
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
            variables: [],
          }),
        ]),
      },
    ]));
    expect(snapshots[2]?.stackFrames).toEqual(expect.arrayContaining([
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
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[3]?.stackFrames).toEqual(expect.arrayContaining([
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
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[4]?.stackFrames).toEqual(expect.arrayContaining([
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
                value: '0',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[5]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 7,
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[6]?.stackFrames).toEqual(expect.arrayContaining([
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[7]?.stackFrames).toEqual(expect.arrayContaining([
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
                value: '1',
                type: 'int',
                evaluateName: 'i',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[8]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 7,
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[9]?.stackFrames).toEqual(expect.arrayContaining([
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[10]?.stackFrames).toEqual(expect.arrayContaining([
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[11]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 7,
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[12]?.stackFrames).toEqual(expect.arrayContaining([
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[13]?.stackFrames).toEqual(expect.arrayContaining([
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
    expect(snapshots[14]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: expect.any(Number),
        name: '<module>',
        line: 10,
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
                variables: [],
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
                variables: [],
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
                variables: [],
              },
            ],
          }),
        ]),
      },
    ]));
  });
});
