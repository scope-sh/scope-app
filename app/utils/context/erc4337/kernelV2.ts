import { type Address, type Hex, decodeFunctionData } from 'viem';

import kernelV2AccountAbi from '@/abi/kernelV2Account.js';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: kernelV2AccountAbi,
    data: callData,
  });
  if (data.functionName === 'execute') {
    return [
      {
        dest: data.args[0].toLowerCase() as Address,
        value: data.args[1],
        data: data.args[2],
      },
    ];
  }
  if (data.functionName === 'executeBatch') {
    return data.args[0].map((call) => ({
      dest: call.to.toLowerCase() as Address,
      value: call.value,
      data: call.data,
    }));
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
