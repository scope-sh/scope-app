import type {
  AbiType,
  SolidityArrayWithoutTuple,
  AbiEventParameter,
} from 'abitype';

interface BaseArgument {
  internalType?: string;
  type?: AbiType;
  indexed?: boolean;
  name?: string;
  value: unknown;
}

interface ArrayArgument extends BaseArgument {
  type: SolidityArrayWithoutTuple;
  value: BaseArgument[];
}

interface TupleArgument extends BaseArgument {
  type: 'tuple';
  internalType?: string;
  value: BaseArgument[];
}

interface TupleArrayArgument extends BaseArgument {
  type: 'tuple[]';
  internalType?: string;
  value: BaseArgument[][];
}

type Argument =
  | ArrayArgument
  | BaseArgument
  | TupleArgument
  | TupleArrayArgument;

type Values = Record<string, unknown> | readonly unknown[];

function getInternalType(
  internalTypeString: string | undefined,
): string | undefined {
  if (!internalTypeString) {
    return undefined;
  }
  // Remove "struct " prefix if present
  return internalTypeString.replace(/^struct /, '');
}

function getPrimitiveType(type: string): AbiType {
  // Unpack array type
  const match = type.match(/^(.*)\[\d*\]$/);
  if (match) {
    return match[1] as AbiType;
  }
  return type as AbiType;
}

function isPrimitiveType(type?: string): boolean {
  if (!type) {
    return true;
  }
  if (type === 'tuple' || type === 'tuple[]') {
    return false;
  }
  if (type.includes('[')) {
    return false;
  }
  return true;
}

function getArguments(
  params: readonly AbiEventParameter[],
  values: Values,
): Argument[] {
  return params.map((param, index) => {
    const value =
      values instanceof Array
        ? values[index]
        : param.name
          ? values[param.name]
          : null;
    if (param.type === 'tuple' && 'components' in param) {
      return {
        type: 'tuple',
        internalType: getInternalType(param.internalType),
        name: param.name,
        value: getArguments(param.components, value as Values),
      };
    }
    if (param.type.startsWith('tuple[') && 'components' in param) {
      return {
        type: param.type,
        internalType: getInternalType(param.internalType),
        name: param.name,
        value: (value as Values[]).map((v) =>
          getArguments(param.components, v),
        ),
      };
    }
    if (!isPrimitiveType(param.type)) {
      return {
        type: param.type as SolidityArrayWithoutTuple,
        name: param.name,
        value: (value as Values[]).map((v) => ({
          type: getPrimitiveType(param.type),
          value: v,
        })),
      };
    }
    return {
      type: param.type as AbiType,
      name: param.name,
      indexed: param.indexed,
      value,
    };
  });
}

export { getArguments, isPrimitiveType };
export type {
  BaseArgument,
  ArrayArgument,
  Argument,
  TupleArgument,
  TupleArrayArgument,
  Values,
};
