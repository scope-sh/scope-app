import type { Address, Hex } from 'viem';
import { decodeFunctionData } from 'viem';

import funV1Abi from '@/abi/funV1Account';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: funV1Abi,
    data: callData,
  });
  if (data.functionName === 'execFromEntryPoint') {
    return [
      {
        dest: data.args[0].toLowerCase() as Address,
        value: BigInt(data.args[1]),
        data: data.args[2],
      },
    ];
  }
  if (data.functionName === 'execFromEntryPointWithFee') {
    return [
      {
        dest: data.args[0].toLowerCase() as Address,
        value: BigInt(data.args[1]),
        data: data.args[2],
      },
    ];
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
