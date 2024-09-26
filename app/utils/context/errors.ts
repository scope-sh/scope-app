import type { AbiError } from 'abitype';
import type { Hex } from 'viem';
import { keccak256, slice, toHex } from 'viem';
import { formatAbiItem } from 'viem/utils';

import type { Argument } from '@/components/__common/arguments';

interface DecodedError {
  name: string;
  args: Argument[];
}

const STANDARD_ERROR: AbiError = {
  type: 'error',
  name: 'Error',
  inputs: [
    {
      name: 'message',
      type: 'string',
    },
  ],
};

const STANDARD_ERROR_SIGNATURE = toErrorSelector(STANDARD_ERROR);

function toErrorSelector(abi: AbiError): Hex {
  return slice(keccak256(toHex(formatAbiItem(abi))), 0, 4);
}

function formatError(error: DecodedError): string {
  function formatArgument(arg: Argument): string {
    if (arg.type === 'string') {
      return `${arg.name}: "${arg.value}"`;
    }
    return `${arg.name}: ${arg.value}`;
  }
  if (error.name === 'Error') {
    if (error.args.length === 1) {
      const arg = error.args[0];
      if (arg && arg.type === 'string') {
        return `"${arg.value}"`;
      }
    }
  }
  if (error.args.length === 0) {
    return error.name;
  }
  return `${error.name}(${error.args.map((arg) => formatArgument(arg)).join(', ')})`;
}

export {
  STANDARD_ERROR,
  STANDARD_ERROR_SIGNATURE,
  toErrorSelector,
  formatError,
};
export type { DecodedError };
