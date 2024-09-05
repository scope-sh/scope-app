import { decodeFunctionData, type Address, type Hex } from 'viem';

import abi from '@/abi/alchemyLightV2Account';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: abi,
    data: callData,
  });
  if (data.functionName === 'executeBatch') {
    const dests = data.args[0];
    const a = data.args[1];
    const b = data.args[2];
    if (b) {
      return [];
    }
    return dests.map((dest, i) => ({
      dest: dest,
      value: 0n,
      data: a[i] as Hex,
    }));
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
