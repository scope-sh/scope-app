import type { AbiFunction } from 'abitype';

type Input = ArrayInput | TupleInput | TupleArrayInput | PrimitiveInput;

interface BaseInput {
  name?: string;
  description?: string;
}

interface ArrayInput extends BaseInput {
  internalType?: string;
  type: `${PrimitiveInputType}[]`;
}

interface TupleInput extends BaseInput {
  type: 'tuple';
  components: Input[];
}

interface TupleArrayInput extends BaseInput {
  type: 'tuple[]';
  components: Input[];
}

interface PrimitiveInput extends BaseInput {
  internalType?: string;
  type: PrimitiveInputType;
}

type ValidatedInput =
  | ValidatedArrayInput
  | ValidatedTupleInput
  | ValidatedTupleArrayInput
  | ValidatedPrimitiveInput;

interface ValidatedBaseInput extends BaseInput {
  isValid: boolean;
}

interface ValidatedArrayInput extends BaseInput {
  internalType?: string;
  type: `${PrimitiveInputType}[]`;
  isValid: boolean[];
}

interface ValidatedTupleInput extends BaseInput {
  type: 'tuple';
  components: ValidatedInput[];
}

interface ValidatedTupleArrayInput extends BaseInput {
  type: 'tuple[]';
  components: ValidatedInput[];
}

interface ValidatedPrimitiveInput extends PrimitiveInput, ValidatedBaseInput {}

type BytesInputType =
  | 'bytes'
  | 'bytes1'
  | 'bytes2'
  | 'bytes3'
  | 'bytes4'
  | 'bytes5'
  | 'bytes6'
  | 'bytes7'
  | 'bytes8'
  | 'bytes9'
  | 'bytes10'
  | 'bytes11'
  | 'bytes12'
  | 'bytes13'
  | 'bytes14'
  | 'bytes15'
  | 'bytes16'
  | 'bytes17'
  | 'bytes18'
  | 'bytes19'
  | 'bytes20'
  | 'bytes21'
  | 'bytes22'
  | 'bytes23'
  | 'bytes24'
  | 'bytes25'
  | 'bytes26'
  | 'bytes27'
  | 'bytes28'
  | 'bytes29'
  | 'bytes30'
  | 'bytes31'
  | 'bytes32';
type IntInputType =
  | 'int8'
  | 'int16'
  | 'int24'
  | 'int32'
  | 'int40'
  | 'int48'
  | 'int56'
  | 'int64'
  | 'int72'
  | 'int80'
  | 'int88'
  | 'int96'
  | 'int104'
  | 'int112'
  | 'int120'
  | 'int128'
  | 'int136'
  | 'int144'
  | 'int152'
  | 'int160'
  | 'int168'
  | 'int176'
  | 'int184'
  | 'int192'
  | 'int200'
  | 'int208'
  | 'int216'
  | 'int224'
  | 'int232'
  | 'int240'
  | 'int248'
  | 'int256';
type UintInputType = `u${IntInputType}`;

type PrimitiveInputType =
  | 'address'
  | 'bool'
  | BytesInputType
  | 'string'
  | IntInputType
  | UintInputType;

function getArrayParamItem(param: ArrayInput, index: number): PrimitiveInput {
  return {
    type: param.type.substring(0, param.type.length - 2) as PrimitiveInputType,
    name: index.toString(),
  };
}

function getTupleArrayParamItem(
  param: TupleArrayInput,
  index: number,
): TupleInput {
  return {
    type: 'tuple',
    name: index.toString(),
    components: param.components,
  };
}

function isArray(input: Input): input is ArrayInput {
  return input.type.endsWith('[]') && !isTupleArray(input);
}

function isTupleArray(input: Input): input is TupleArrayInput {
  return input.type === 'tuple[]';
}

function isValueFunction(func: AbiFunction): boolean {
  return (
    (func.stateMutability === 'view' || func.stateMutability === 'pure') &&
    func.inputs.length === 0
  );
}

function isReadableFunction(func: AbiFunction): boolean {
  return (
    (func.stateMutability === 'view' || func.stateMutability === 'pure') &&
    func.inputs.length > 0
  );
}

function isWritableFunction(func: AbiFunction): boolean {
  return func.stateMutability !== 'view' && func.stateMutability !== 'pure';
}

export {
  getArrayParamItem,
  getTupleArrayParamItem,
  isArray,
  isValueFunction,
  isReadableFunction,
  isWritableFunction,
};
export type {
  ArrayInput,
  Input,
  PrimitiveInput,
  TupleArrayInput,
  TupleInput,
  ValidatedArrayInput,
  ValidatedInput,
  ValidatedPrimitiveInput,
  ValidatedTupleArrayInput,
  ValidatedTupleInput,
};
