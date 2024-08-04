import type { Address } from 'viem';

import type NamingService from '@/services/naming.js';

type Input = ArrayInput | TupleInput | TupleArrayInput | PrimitiveInput;
type Output = Input;

interface BaseInput {
  readonly name?: string;
  readonly internalType?: string;
}

interface ArrayInput extends BaseInput {
  readonly type: `${PrimitiveInputType}[${string}]`;
}

interface TupleInput extends BaseInput {
  readonly type: 'tuple';
  readonly components: Input[];
}

interface TupleArrayInput extends BaseInput {
  readonly type: `tuple[${string}]`;
  readonly components: Input[];
}

interface PrimitiveInput extends BaseInput {
  readonly type: PrimitiveInputType;
}

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

function isArrayInput(input: Input): input is ArrayInput {
  if (isTupleArrayInput(input)) {
    return false;
  }
  const arrayRegex = /\w*\[\d*\]/;
  return !!input.type.match(arrayRegex);
}

function isTupleInput(input: Input): input is TupleInput {
  return input.type === 'tuple';
}

function isTupleArrayInput(input: Input): input is TupleArrayInput {
  return input.type.startsWith('tuple[');
}

function isPrimitiveInput(input: Input): input is PrimitiveInput {
  return (
    !isArrayInput(input) && !isTupleInput(input) && !isTupleArrayInput(input)
  );
}

function getArrayItemInput(
  arrayInput: ArrayInput,
  index?: number,
): PrimitiveInput {
  const match = arrayInput.type.match(/(\w*)\[(\d*)\]/);
  if (!match) {
    throw new Error('Invalid array input type');
  }
  const [, itemType] = match;
  if (!itemType) {
    throw new Error('Invalid array input');
  }
  return { type: itemType as PrimitiveInputType, name: index?.toString() };
}

function getTupleArrayItemInput(arrayInput: TupleArrayInput): TupleInput {
  const match = arrayInput.type.match(/(\w*)\[(\d*)\]/);
  if (!match) {
    throw new Error('Invalid array input type');
  }
  const [, itemType] = match;
  if (!itemType) {
    throw new Error('Invalid array input');
  }
  return { type: 'tuple', components: arrayInput.components };
}

function getArrayLength(input: ArrayInput | TupleArrayInput): number | null {
  const arrayRegex = /\w*\[(\d*)\]/;
  const match = input.type.match(arrayRegex);
  if (!match) {
    throw new Error('Invalid array input type');
  }
  const [, length] = match;
  return length ? parseInt(length) : null;
}

// Coerce numberish values to bigints
// Resolves ENS names and replaces them with the resolved addresses
async function normalize(
  inputs: unknown[],
  abiInputs: readonly Input[],
  namingService: NamingService,
): Promise<unknown[]> {
  const coerced = coerce(inputs, abiInputs);
  return resolveNames(coerced, namingService);
}

function coerce(inputs: unknown[], abiInputs: readonly Input[]): unknown[] {
  return inputs.map((input, index) => {
    const abiInput = abiInputs[index];
    if (!abiInput) {
      return input;
    }
    return coerceInput(input, abiInput);
  });
}

function coerceInput(input: unknown, abiInput: Input): unknown {
  if (isArrayInput(abiInput)) {
    if (!Array.isArray(input)) {
      return false;
    }
    return coerceArrayInput(input, abiInput);
  }
  if (isTupleArrayInput(abiInput)) {
    return coerceTupleArrayInput(input as unknown[], abiInput);
  }
  if (isTupleInput(abiInput)) {
    if (typeof input !== 'object') {
      return false;
    }
    if (!input) {
      return false;
    }
    return coerceTupleInput(input as Record<string, unknown>, abiInput);
  }
  return coercePrimitiveInput(input, abiInput.type);
}

function coerceArrayInput(input: unknown[], abiInput: ArrayInput): unknown[] {
  const itemParam = getArrayItemInput(abiInput);
  return input.map((itemInput) =>
    coercePrimitiveInput(itemInput, itemParam.type),
  );
}

function coerceTupleArrayInput(
  input: unknown[],
  abiInput: TupleArrayInput,
): unknown[] {
  const itemParam = getTupleArrayItemInput(abiInput);
  return input.map((itemInput) => coerceInput(itemInput, itemParam));
}

function coerceTupleInput(
  input: Record<string, unknown>,
  abiInput: TupleInput,
): Record<string, unknown> {
  return abiInput.components.reduce(
    (acc, component, index) => ({
      ...acc,
      [component.name ?? index]: coerceInput(
        input[component.name ?? index],
        component,
      ),
    }),
    {},
  );
}

function coercePrimitiveInput(
  input: unknown,
  type: PrimitiveInputType,
): unknown {
  if (type.startsWith('int')) {
    return coerceInt(input as string);
  }
  if (type.startsWith('uint')) {
    return coerceUint(input as string);
  }
  return input;
}

function coerceInt(input: string): unknown {
  return BigInt(input);
}

function coerceUint(input: string): unknown {
  return BigInt(input);
}

async function resolveNames(
  inputs: unknown[],
  namingService: NamingService,
): Promise<unknown[]> {
  // Get the list of all ENS names
  const ensNames = inputs.map((arg) => getInputNames(arg)).flat();
  const uniqueEnsNames = [...new Set(ensNames)];
  // Resolve each ENS name to an address
  const nameMap = await namingService.resolveEnsMany(uniqueEnsNames);
  // Replace the ENS names with the resolved addresses
  const resolvedInputs = inputs.map((input) => replaceNames(input, nameMap));
  return resolvedInputs;
}

function getInputNames(input: unknown): string[] {
  // If it's an array, map over it and call getEnsNames on each element
  if (Array.isArray(input)) {
    return input.map(getInputNames).flat();
  }
  // If it's an object, call getEnsNames on each value
  if (typeof input === 'object') {
    if (input === null) {
      return [];
    }
    return Object.values(input).map(getInputNames).flat();
  }
  // If it's a string, check if it's an ENS name
  if (typeof input === 'string') {
    return isEnsName(input) ? [input] : [];
  }
  return [];
}

function replaceNames(arg: unknown, nameMap: Record<string, Address>): unknown {
  if (Array.isArray(arg)) {
    return arg.map((value) => replaceNames(value, nameMap));
  }
  if (typeof arg === 'object') {
    if (arg === null) {
      return null;
    }
    return Object.fromEntries(
      Object.entries(arg).map(([key, value]) => [
        key,
        replaceNames(value, nameMap),
      ]),
    );
  }
  if (typeof arg === 'string') {
    return nameMap[arg] || arg;
  }
  return arg;
}

function getInitialValue(input: Input): unknown {
  if (isArrayInput(input)) {
    return [];
  }
  if (isTupleArrayInput(input)) {
    return [];
  }
  if (isTupleInput(input)) {
    return input.components.reduce(
      (acc, component) => ({
        ...acc,
        [component.name ?? '']: getInitialValue(component),
      }),
      {},
    );
  }
  if (input.type === 'bool') {
    return false;
  }
  if (isPrimitiveInput(input)) {
    return '';
  }
}

function isValid(inputs: unknown[], abiInputs: readonly Input[]): boolean {
  if (inputs.length !== abiInputs.length) {
    return false;
  }
  return inputs.every((input, index) => {
    const abiInput = abiInputs[index];
    if (!abiInput) {
      return false;
    }
    return isInputValid(input, abiInput);
  });
}

function isInputValid(input: unknown, abiInput: Input): boolean {
  if (isArrayInput(abiInput)) {
    if (!Array.isArray(input)) {
      return false;
    }
    return isArrayValid(input, abiInput);
  }
  if (isTupleArrayInput(abiInput)) {
    return isTupleArrayValid(input as unknown[], abiInput);
  }
  if (isTupleInput(abiInput)) {
    if (typeof input !== 'object') {
      return false;
    }
    if (!input) {
      return false;
    }
    return isTupleValid(input as Record<string, unknown>, abiInput);
  }
  return isPrimitiveValid(input, abiInput.type);
}

function isArrayValid(input: unknown[], abiInput: ArrayInput): boolean {
  const itemParam = getArrayItemInput(abiInput);
  return input.every((itemInput) =>
    isPrimitiveValid(itemInput, itemParam.type),
  );
}

function isTupleArrayValid(
  input: unknown[],
  abiInput: TupleArrayInput,
): boolean {
  const itemParam = getTupleArrayItemInput(abiInput);
  return input.every((itemInput) => isInputValid(itemInput, itemParam));
}

function isTupleValid(
  input: Record<string, unknown>,
  abiInput: TupleInput,
): boolean {
  return abiInput.components.every((component, index) => {
    const componentInput = input[component.name || index];
    return isInputValid(componentInput, component);
  });
}

function isPrimitiveValid(input: unknown, type: PrimitiveInputType): boolean {
  if (type === 'bool') {
    return typeof input === 'boolean';
  }
  if (typeof input !== 'string') {
    return false;
  }
  switch (type) {
    case 'address':
      return isAddress(input) || isEnsName(input);
    case 'bytes': {
      return !!input.match(/^0x[0-9a-fA-F]*$/);
    }
    case 'bytes1': {
      return !!input.match(/^0x[0-9a-fA-F]{2}$/);
    }
    case 'bytes2': {
      return !!input.match(/^0x[0-9a-fA-F]{4}$/);
    }
    case 'bytes3': {
      return !!input.match(/^0x[0-9a-fA-F]{6}$/);
    }
    case 'bytes4': {
      return !!input.match(/^0x[0-9a-fA-F]{8}$/);
    }
    case 'bytes5': {
      return !!input.match(/^0x[0-9a-fA-F]{10}$/);
    }
    case 'bytes6': {
      return !!input.match(/^0x[0-9a-fA-F]{12}$/);
    }
    case 'bytes7': {
      return !!input.match(/^0x[0-9a-fA-F]{14}$/);
    }
    case 'bytes8': {
      return !!input.match(/^0x[0-9a-fA-F]{16}$/);
    }
    case 'bytes9': {
      return !!input.match(/^0x[0-9a-fA-F]{18}$/);
    }
    case 'bytes10': {
      return !!input.match(/^0x[0-9a-fA-F]{20}$/);
    }
    case 'bytes11': {
      return !!input.match(/^0x[0-9a-fA-F]{22}$/);
    }
    case 'bytes12': {
      return !!input.match(/^0x[0-9a-fA-F]{24}$/);
    }
    case 'bytes13': {
      return !!input.match(/^0x[0-9a-fA-F]{26}$/);
    }
    case 'bytes14': {
      return !!input.match(/^0x[0-9a-fA-F]{28}$/);
    }
    case 'bytes15': {
      return !!input.match(/^0x[0-9a-fA-F]{30}$/);
    }
    case 'bytes16': {
      return !!input.match(/^0x[0-9a-fA-F]{32}$/);
    }
    case 'bytes17': {
      return !!input.match(/^0x[0-9a-fA-F]{34}$/);
    }
    case 'bytes18': {
      return !!input.match(/^0x[0-9a-fA-F]{36}$/);
    }
    case 'bytes19': {
      return !!input.match(/^0x[0-9a-fA-F]{38}$/);
    }
    case 'bytes20': {
      return !!input.match(/^0x[0-9a-fA-F]{40}$/);
    }
    case 'bytes21': {
      return !!input.match(/^0x[0-9a-fA-F]{42}$/);
    }
    case 'bytes22': {
      return !!input.match(/^0x[0-9a-fA-F]{44}$/);
    }
    case 'bytes23': {
      return !!input.match(/^0x[0-9a-fA-F]{46}$/);
    }
    case 'bytes24': {
      return !!input.match(/^0x[0-9a-fA-F]{48}$/);
    }
    case 'bytes25': {
      return !!input.match(/^0x[0-9a-fA-F]{50}$/);
    }
    case 'bytes26': {
      return !!input.match(/^0x[0-9a-fA-F]{52}$/);
    }
    case 'bytes27': {
      return !!input.match(/^0x[0-9a-fA-F]{54}$/);
    }
    case 'bytes28': {
      return !!input.match(/^0x[0-9a-fA-F]{56}$/);
    }
    case 'bytes29': {
      return !!input.match(/^0x[0-9a-fA-F]{58}$/);
    }
    case 'bytes30': {
      return !!input.match(/^0x[0-9a-fA-F]{60}$/);
    }
    case 'bytes31': {
      return !!input.match(/^0x[0-9a-fA-F]{62}$/);
    }
    case 'bytes32': {
      return !!input.match(/^0x[0-9a-fA-F]{64}$/);
    }
    case 'string': {
      return true;
    }
    case 'int8': {
      return isInt(input, 8);
    }
    case 'int16': {
      return isInt(input, 16);
    }
    case 'int24': {
      return isInt(input, 24);
    }
    case 'int32': {
      return isInt(input, 32);
    }
    case 'int40': {
      return isInt(input, 40);
    }
    case 'int48': {
      return isInt(input, 48);
    }
    case 'int56': {
      return isInt(input, 56);
    }
    case 'int64': {
      return isInt(input, 64);
    }
    case 'int72': {
      return isInt(input, 72);
    }
    case 'int80': {
      return isInt(input, 80);
    }
    case 'int88': {
      return isInt(input, 88);
    }
    case 'int96': {
      return isInt(input, 96);
    }
    case 'int104': {
      return isInt(input, 104);
    }
    case 'int112': {
      return isInt(input, 112);
    }
    case 'int120': {
      return isInt(input, 120);
    }
    case 'int128': {
      return isInt(input, 128);
    }
    case 'int136': {
      return isInt(input, 136);
    }
    case 'int144': {
      return isInt(input, 144);
    }
    case 'int152': {
      return isInt(input, 152);
    }
    case 'int160': {
      return isInt(input, 160);
    }
    case 'int168': {
      return isInt(input, 168);
    }
    case 'int176': {
      return isInt(input, 176);
    }
    case 'int184': {
      return isInt(input, 184);
    }
    case 'int192': {
      return isInt(input, 192);
    }
    case 'int200': {
      return isInt(input, 200);
    }
    case 'int208': {
      return isInt(input, 208);
    }
    case 'int216': {
      return isInt(input, 216);
    }
    case 'int224': {
      return isInt(input, 224);
    }
    case 'int232': {
      return isInt(input, 232);
    }
    case 'int240': {
      return isInt(input, 240);
    }
    case 'int248': {
      return isInt(input, 248);
    }
    case 'int256': {
      return isInt(input, 256);
    }
    case 'uint8': {
      return isUint(input, 8);
    }
    case 'uint16': {
      return isUint(input, 16);
    }
    case 'uint24': {
      return isUint(input, 24);
    }
    case 'uint32': {
      return isUint(input, 32);
    }
    case 'uint40': {
      return isUint(input, 40);
    }
    case 'uint48': {
      return isUint(input, 48);
    }
    case 'uint56': {
      return isUint(input, 56);
    }
    case 'uint64': {
      return isUint(input, 64);
    }
    case 'uint72': {
      return isUint(input, 72);
    }
    case 'uint80': {
      return isUint(input, 80);
    }
    case 'uint88': {
      return isUint(input, 88);
    }
    case 'uint96': {
      return isUint(input, 96);
    }
    case 'uint104': {
      return isUint(input, 104);
    }
    case 'uint112': {
      return isUint(input, 112);
    }
    case 'uint120': {
      return isUint(input, 120);
    }
    case 'uint128': {
      return isUint(input, 128);
    }
    case 'uint136': {
      return isUint(input, 136);
    }
    case 'uint144': {
      return isUint(input, 144);
    }
    case 'uint152': {
      return isUint(input, 152);
    }
    case 'uint160': {
      return isUint(input, 160);
    }
    case 'uint168': {
      return isUint(input, 168);
    }
    case 'uint176': {
      return isUint(input, 176);
    }
    case 'uint184': {
      return isUint(input, 184);
    }
    case 'uint192': {
      return isUint(input, 192);
    }
    case 'uint200': {
      return isUint(input, 200);
    }
    case 'uint208': {
      return isUint(input, 208);
    }
    case 'uint216': {
      return isUint(input, 216);
    }
    case 'uint224': {
      return isUint(input, 224);
    }
    case 'uint232': {
      return isUint(input, 232);
    }
    case 'uint240': {
      return isUint(input, 240);
    }
    case 'uint248': {
      return isUint(input, 248);
    }
    case 'uint256': {
      return isUint(input, 256);
    }
    default:
      return false;
  }
}

function isEnsName(value: string): boolean {
  const nameRegex = /.+\.eth$/;
  return !!value.match(nameRegex);
}

function isAddress(value: string): boolean {
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  return !!value.match(addressRegex);
}

function isInt(value: string, bits: number): boolean {
  const decimalRegex = /^-?\d+$/;
  const hexRegex = /^-?0x[0-9a-fA-F]+$/;
  if (!value.match(decimalRegex) && !value.match(hexRegex)) {
    return false;
  }
  const number = parseInt(value);
  if (isNaN(number)) {
    return false;
  }
  const bound = Math.pow(2, bits - 1);
  return number >= -bound && number < bound;
}

function isUint(value: string, bits: number): boolean {
  const decimalRegex = /^-?\d+$/;
  const hexRegex = /^-?0x[0-9a-fA-F]+$/;
  if (!value.match(decimalRegex) && !value.match(hexRegex)) {
    return false;
  }
  const number = parseInt(value);
  if (isNaN(number)) {
    return false;
  }
  const max = Math.pow(2, bits);
  return number >= 0 && number < max;
}

export {
  getArrayItemInput,
  getInitialValue,
  getTupleArrayItemInput,
  getArrayLength,
  isArrayInput,
  isPrimitiveInput,
  isPrimitiveValid,
  isTupleArrayInput,
  isTupleInput,
  isValid,
  normalize,
};
export type {
  ArrayInput,
  Input,
  TupleInput,
  TupleArrayInput,
  PrimitiveInput,
  PrimitiveInputType,
  Output,
};
