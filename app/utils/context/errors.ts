import type { AbiError } from 'abitype';
import type { Hex } from 'viem';
import { keccak256, slice, toHex } from 'viem';
import { formatAbiItem } from 'viem/utils';

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

function toErrorSelector(abi: AbiError): Hex {
  return slice(keccak256(toHex(formatAbiItem(abi))), 0, 4);
}

const STANDARD_ERROR_SIGNATURE = toErrorSelector(STANDARD_ERROR);

export { STANDARD_ERROR, STANDARD_ERROR_SIGNATURE, toErrorSelector };
