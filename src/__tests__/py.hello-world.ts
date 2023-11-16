/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getSteps } from '../debug';
import { StepSnapshot } from '../snapshot';

describe('samples hello_world.py', () => {
  jest.setTimeout(30000);
  let snapshots!: StepSnapshot[];
  beforeAll(async () => {
    snapshots = await getSteps({ sourcePath: './samples/python/hello_world.py', inputPath: '', breakpoints: '*', help: false }) as StepSnapshot[];
  });


  it('should have valid outputs', () => {
    expect(snapshots.filter(step => step.stdout?.length || step.stderr?.length).map(step => ({ stdout: step.stdout, stderr: step.stderr }))).toHaveLength(4);
    expect(snapshots[6]?.stdout).toContainEqual(expect.stringContaining('Number: 0'));
    expect(snapshots[9]?.stdout).toContainEqual(expect.stringContaining('Number: 2'));
    expect(snapshots[12]?.stdout).toContainEqual(expect.stringContaining('Number: 4'));
    expect(snapshots[15]?.stderr).toContainEqual(expect.stringContaining('Goodbye world'));
  });

  it('should have valid steps', () => {
    expect(snapshots[0]?.stackFrames).toEqual(expect.arrayContaining([
      {
        id: 2,
        name: '<module>',
        line: 1,
        column: 1,
        source: {
          path: expect.any(String),
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
          path: expect.any(String),
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
          path: expect.any(String),
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
          path: expect.any(String),
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
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '0',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '2',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
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
          path: expect.any(String),
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
              },
              {
                name: 'x',
                value: '3',
                type: 'int',
                evaluateName: 'x',
                variablesReference: expect.any(Number),
              },
              {
                name: 'y',
                value: '4',
                type: 'int',
                evaluateName: 'y',
                variablesReference: expect.any(Number),
              },
            ],
          }),
        ]),
      },
    ]));
  });
});
