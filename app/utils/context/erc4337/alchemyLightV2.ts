import { decodeFunctionData, type Hex } from 'viem';

import type { Call } from './callData';

import abi from '@/abi/alchemyLightV2Account';

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: abi,
    data: callData,
  });
  if (data.functionName === 'executeBatch') {
    const dests = data.args[0];
    const arg1 = data.args[1];
    const arg2 = data.args[2];
    if (arg2) {
      return [];
    }
    return dests.map((dest, i) => ({
      to: dest,
      value: BigInt(0),
      data: arg1[i] as Hex,
    }));
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
