import type { Address, Hex } from 'viem';
import { decodeFunctionData } from 'viem';

import type { Call } from './callData';

import abi from '@/abi/alchemyLightV2Account';

function decodeCallData(callData: Hex): Call[] | null {
  const data = decodeFunctionData({
    abi: abi,
    data: callData,
  });
  if (data.functionName === 'executeBatch') {
    const dests = data.args[0];
    const arg1 = data.args[1];
    const arg2 = data.args[2];
    if (arg2) {
      return dests.map((dest, i) => ({
        to: dest.toLowerCase() as Address,
        value: arg1[i] as bigint,
        data: arg2[i] as Hex,
      }));
    }
    return dests.map((dest, i) => ({
      to: dest.toLowerCase() as Address,
      value: BigInt(0),
      data: arg1[i] as Hex,
    }));
  }
  return null;
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
