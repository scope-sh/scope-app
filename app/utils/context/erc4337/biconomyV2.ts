import { type Address, type Hex, decodeFunctionData } from 'viem';

import biconomyV2AccountAbi from '@/abi/biconomyV2Account';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

function decodeCallData(callData: Hex): Call[] {
  const data = decodeFunctionData({
    abi: biconomyV2AccountAbi,
    data: callData,
  });
  if (data.functionName === 'execute' || data.functionName === 'execute_ncC') {
    return [
      {
        dest: data.args[0].toLowerCase() as Address,
        value: data.args[1],
        data: data.args[2],
      },
    ];
  }
  if (
    data.functionName === 'executeBatch' ||
    data.functionName === 'executeBatch_y6U'
  ) {
    const dests = data.args[0];
    const values = data.args[1];
    const datas = data.args[2];
    return dests.map((dest, index) => ({
      dest: dest.toLowerCase() as Address,
      value: values[index] as bigint,
      data: datas[index] as Hex,
    }));
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
