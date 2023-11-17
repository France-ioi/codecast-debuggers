import { DebugProtocol } from 'vscode-debugprotocol';
import { RunStepContext } from './run-steps/runner';
import { logger } from './logger';

export type StepsAcc = (StepSnapshot | TerminationMessage)[];

export interface StepSnapshot {
  stackFrames?: StackFrame[],
  stdout?: string[],
  stderr?: string[],
  terminated?: boolean,
  terminatedReason?: string,
}

export interface TerminationMessage {
  type: string,
  message: string,
}

export interface StackFrame extends DebugProtocol.StackFrame {
  scopes: Scope[],
}
export interface Scope extends DebugProtocol.Scope {
  variables: (string | DebugProtocol.Variable)[],
  variableDetails: VariableHashMap,
}
export interface Variable extends DebugProtocol.Variable {
  variables: (string | DebugProtocol.Variable)[],
  memory?: DebugProtocol.ReadMemoryResponse['body'],
}

interface VariableHashMap {
  [reference: string]: Variable,
}

interface VariableResultHashMap {
  [reference: string]: {
    variables: DebugProtocol.Variable[],
  },
}



interface GetSnapshotParams {

    /**
     * absolute paths
     */
    filePaths: string[],
    context: RunStepContext,

    /**
     * the threadId from which we can extract debug data. Provided in the `onStopped` event
     */
    threadId: number,
}


export async function getSnapshot({ context, filePaths, threadId }: GetSnapshotParams): Promise<StepSnapshot> {
  const result = await context.client.stackTrace({ threadId });
  const stackFrames = await Promise.all(
    result.stackFrames
      .filter(isStackFrameOfSourceFile(filePaths))
      .map(stackFrame => getStackFrame({ context, stackFrame }))
  );

  return { stackFrames };
}

interface GetStackFrameParams {
    stackFrame: DebugProtocol.StackFrame,
    context: RunStepContext,
}

async function getStackFrame({ context, stackFrame }: GetStackFrameParams): Promise<StackFrame> {
  const result = await context.client.scopes({ frameId: stackFrame.id });
  const scopes = await Promise.all(result.scopes.map(scope => getScope({ context, scope })));

  return { ...stackFrame, scopes };
}

interface GetScopeParams {
    scope: DebugProtocol.Scope,
    context: RunStepContext,
}

async function getScope({ context, scope }: GetScopeParams): Promise<Scope> {
  if (!context.canDigScope(scope)) {
    return {
      ...scope,
      variables: [],
      variableDetails: {},
    };
  }

  const variableDetails: VariableHashMap = {};
  const variableReferencesRetrieved: VariableResultHashMap = {};

  const result = await context.client.variables({ variablesReference: scope.variablesReference });
  variableReferencesRetrieved[scope.variablesReference.toString()] = result;

  const variables = result.variables.filter(context.canDigVariable).map(variable => {
    const variableIndex = getVariableIndex(variable);
    if (variableIndex) {
      variableDetails[variableIndex] = {
        ...variable,
        variables: [],
      };

      return variableIndex;
    } else {
      return variable;
    }
  });

  const isLocalScope = scope.name.startsWith('Local');
  const variablesMaxDepth = isLocalScope ? 3 : 0;

  await Promise.all(result.variables.filter(context.canDigVariable).map(variable => getVariable({
    context,
    variable,
    maxDepth: variablesMaxDepth,
  }, variableDetails, variableReferencesRetrieved)));

  return { ...scope, variables, variableDetails };
}

interface GetVariableParams {
    context: RunStepContext,
    variable: DebugProtocol.Variable,

    /**
     * Composite variables (like arrays and object in JS) have children variables. Since they can be very deep,
     * we have to arbitrarily stick to a variable max depth after which we will stop retrieving variable data.
     * For instance, for a `maxDepth: 3` and a JS object `{ a: { b: { c: { d: 'value' } } } }`, treatment will stop at
     * the property (including) "c" and won't extract variable data for property "d"
     */
    maxDepth: number,
}

/**
 * Get a variable index of a variable.
 *
 * @param variable The variable.
 * @returns string|null The index or null. If null, the variable has no reference.
 */
function getVariableIndex(variable: DebugProtocol.Variable): string | null {
  if (variable.variablesReference == 0) {
    return null;
  }
  if (variable.memoryReference) {
    return variable.memoryReference;
  }

  return variable.variablesReference.toString();
}

async function getVariable(
  { context, maxDepth, variable }: GetVariableParams,
  variableDetails: VariableHashMap,
  variableReferencesRetrieved: VariableResultHashMap,
  currentDepth = 0
): Promise<void> {
  const shouldGetSubVariables = variable.variablesReference > 0 && currentDepth <= maxDepth;
  if (!shouldGetSubVariables) {
    return;
  }

  try {
    const result = (variableReferencesRetrieved[variable.variablesReference]) ?
      variableReferencesRetrieved[variable.variablesReference] :
      await context.client.variables({ variablesReference: variable.variablesReference });
    if (!result) {
      return;
    }

    const variables = result.variables.filter(context.canDigVariable).map(curVariable => {
      const curVariableIndex = getVariableIndex(curVariable);
      if (curVariableIndex) {
        variableDetails[curVariableIndex] = {
          ...curVariable,
          variables: [],
        };

        return curVariableIndex;
      } else {
        return curVariable;
      }
    });

    const variableIndex = (variable.memoryReference) ? variable.memoryReference : variable.variablesReference.toString();
    if (variableDetails[variableIndex]) {
      // @ts-ignore
      variableDetails[variableIndex].variables = variables;
    }

    await Promise.all(result.variables.filter(context.canDigVariable).map(variable => getVariable({
      context,
      variable,
      maxDepth: maxDepth,
    }, variableDetails, variableReferencesRetrieved, currentDepth + 1)));
  } catch (error) {
    logger.dir({ variable, error });
  }
}

function isStackFrameOfSourceFile(fileAbsolutePaths: string[]) {
  return (stackFrame: DebugProtocol.StackFrame): boolean =>
    !!stackFrame.source && fileAbsolutePaths.some(filePath => filePath === stackFrame.source?.path);
}
