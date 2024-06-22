import { type Address, type Hex, decodeFunctionData } from 'viem';

import daimoAccountAbi from '@/abi/daimoAccount';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: daimoAccountAbi,
    data: callData,
  });
  if (data.functionName !== 'executeBatch') {
    return [];
  }
  return data.args[0].map((call) => ({
    dest: call.dest.toLowerCase() as Address,
    value: BigInt(call.value),
    data: call.data,
  }));
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
