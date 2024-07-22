import type { Abi, AbiParameter, AbiStateMutability } from 'abitype';
import {
  type ContractFunctionName,
  type ContractFunctionArgs,
  type ReadContractParameters,
  getAbiItem,
} from 'viem';

import type {
  Input as ContractInput,
  ArrayInput as ContractArrayInput,
  TupleArrayInput as ContractTupleArrayInput,
  TupleInput as ContractTupleInput,
  ValidatedInput,
  ValidatedArrayInput,
  ValidatedTupleInput,
  ValidatedTupleArrayInput,
  ValidatedPrimitiveInput,
  PrimitiveInput,
} from './index.js';
import {
  getArrayParamItem as getContractArrayParamItem,
  getTupleArrayParamItem,
} from './index.js';

function validate<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi>,
  const args extends ContractFunctionArgs<
    abi,
    AbiStateMutability,
    functionName
  >,
>(
  parameters: ReadContractParameters<abi, functionName, args>,
): ValidatedInput[] {
  console.log('validate', parameters);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const abiItem = getAbiItem({
    abi: parameters.abi,
    name: parameters.functionName,
  });
  if (!abiItem) {
    throw new Error('Invalid ABI item');
  }
  if (abiItem.type !== 'function') {
    throw new Error('Invalid ABI item type');
  }
  if (!Array.isArray(parameters.args)) {
    throw new Error('Invalid arguments');
  }
  return (parameters.args as unknown[]).map((arg, index) => {
    const abiInput = abiItem.inputs[index] as ContractInput;
    return validateInput(arg, abiInput);
  });
}

function isValid(inputs: ValidatedInput[]): boolean {
  return inputs.every((input) => {
    if (input.type === 'tuple') {
      return isValid(input.components);
    }
    if (input.type === 'tuple[]') {
      return isValid(input.components);
    }
    return input.isValid;
  });
}

function isInputValid(inputs: ValidatedInput[], index: number): boolean {
  const input = inputs[index] as ValidatedInput;
  if (input.type === 'tuple') {
    return isValid(input.components);
  }
  if (input.type === 'tuple[]') {
    return isValid(input.components);
  }
  if (Array.isArray(input.isValid)) {
    return input.isValid.every((isValid) => isValid);
  }
  return input.isValid;
}

function validateInput(input: unknown, param: ContractInput): ValidatedInput {
  if (isAbiTuple(param)) {
    return validateTuple(input as unknown[], param);
  }
  if (isAbiTupleArray(param)) {
    return validateTupleArray(input as unknown[], param);
  }
  if (isAbiArray(param)) {
    return validateArray(input as unknown[], param);
  }
  return validatePrimitive(input, param);
}

function isAbiArray(param: AbiParameter): param is ContractArrayInput {
  const arrayRegex = /\w*\[\d*\]/;
  return !!param.type.match(arrayRegex);
}

function isAbiTuple(param: AbiParameter): param is ContractTupleInput {
  return param.type.startsWith('tuple');
}

function isAbiTupleArray(
  param: AbiParameter,
): param is ContractTupleArrayInput {
  return param.type.startsWith('tuple[]');
}

function validateTuple(
  input: unknown[],
  param: ContractTupleInput,
): ValidatedTupleInput {
  const validatedComponents = param.components.map((component, index) => {
    const componentInput = input[index];
    return validateInput(componentInput, component);
  });
  return {
    type: 'tuple',
    components: validatedComponents,
  };
}

function validateTupleArray(
  input: unknown[],
  param: ContractTupleArrayInput,
): ValidatedTupleArrayInput {
  const validatedComponents = input.map((itemInput, index) => {
    const itemParam = getTupleArrayParamItem(param, index);
    return validateInput(itemInput, itemParam);
  });
  return {
    type: 'tuple[]',
    components: validatedComponents,
  };
}

function validateArray(
  input: unknown[],
  param: ContractArrayInput,
): ValidatedArrayInput {
  const isValid = input.map((itemInput, index) => {
    // The last param can be empty, as long as it's not the first param
    if (itemInput === '' && index === input.length - 1 && index !== 0) {
      return true;
    }
    const itemParam = getContractArrayParamItem(param, index);
    const validatedInput = validateInput(
      itemInput,
      itemParam,
    ) as ValidatedPrimitiveInput;
    return validatedInput.isValid;
  });
  return {
    ...param,
    isValid,
  };
}

function validatePrimitive(
  input: unknown,
  param: PrimitiveInput,
): ValidatedPrimitiveInput {
  const isValid = isPrimitiveValid(input, param);
  return {
    ...param,
    isValid,
  };
}

function isPrimitiveValid(input: unknown, param: PrimitiveInput): boolean {
  if (param.type === 'bool') {
    return typeof input === 'boolean';
  }
  if (typeof input !== 'string') {
    return false;
  }
  switch (param.type) {
    case 'address':
      return isAddress(input);
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

function isAddress(value: string): boolean {
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  return !!value.match(addressRegex);
}

function isInt(value: string, bits: number): boolean {
  const number = parseInt(value);
  if (isNaN(number)) {
    return false;
  }
  const bound = Math.pow(2, bits - 1);
  return number >= -bound && number < bound;
}

function isUint(value: string, bits: number): boolean {
  const number = parseInt(value);
  if (isNaN(number)) {
    return false;
  }
  const max = Math.pow(2, bits);
  return number >= 0 && number < max;
}

export { validate, isValid, isInputValid };
