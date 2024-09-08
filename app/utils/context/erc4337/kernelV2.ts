import { type Address, type Hex, decodeFunctionData, slice } from 'viem';

import type { Call } from './callData';

import kernelV2AccountAbi from '@/abi/kernelV2Account.js';

type DecodedSignature =
  | {
      mode: 'sudo';
    }
  | {
      mode: 'use';
    }
  | {
      mode: 'enable';
      validator: Address;
    };

function decodeCallData(callData: Hex): Call[] | null {
  const data = decodeFunctionData({
    abi: kernelV2AccountAbi,
    data: callData,
  });
  if (data.functionName === 'execute') {
    return [
      {
        to: data.args[0].toLowerCase() as Address,
        value: data.args[1],
        data: data.args[2],
      },
    ];
  }
  if (data.functionName === 'executeBatch') {
    return data.args[0].map((call) => ({
      to: call.to.toLowerCase() as Address,
      value: call.value,
      data: call.data,
    }));
  }
  return null;
}

function decodeSignature(signature: Hex): DecodedSignature | null {
  const mode = slice(signature, 0, 4);
  if (mode === '0x00000000') {
    return { mode: 'sudo' };
  }
  if (mode === '0x00000001') {
    return { mode: 'use' };
  }
  if (mode === '0x00000002') {
    const validator = slice(signature, 16, 36) as Address;
    return { mode: 'enable', validator };
  }
  return null;
}

export { decodeCallData, decodeSignature };
