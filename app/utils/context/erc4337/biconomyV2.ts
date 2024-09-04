import {
  type Address,
  type Hex,
  decodeAbiParameters,
  decodeFunctionData,
} from 'viem';

import biconomyV2AccountAbi from '@/abi/biconomyV2Account';

interface Call {
  dest: Address;
  value: bigint;
  data: Hex;
}

interface DecodedSignature {
  signature: Hex;
  validator: Address;
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

function decodeSignature(signature: Hex): DecodedSignature {
  const data = decodeAbiParameters(
    [
      { type: 'bytes', name: 'signature' },
      { type: 'address', name: 'validator' },
    ],
    signature,
  );
  return {
    signature: data[0],
    validator: data[1].toLowerCase() as Address,
  };
}

export { decodeCallData, decodeSignature };
