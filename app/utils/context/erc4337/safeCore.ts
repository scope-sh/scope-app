import { type Address, type Hex, decodeFunctionData, size, slice } from 'viem';

import safeCore4337ModuleAbi from '@/abi/safeCore4337Module';

const SAFE_1_4_1_MULTI_SEND_1_ADDRESS =
  '0x9641d764fc13c8b624c04430c7356c1c7c8102e2';
const SAFE_1_4_1_MULTI_SEND_2_ADDRESS =
  '0x38869bf66a61cf6bdb996a6ae40d5853fd43b526';
const SAFE_1_3_0_MULTI_SEND_ADDRESS =
  '0x40a2accbd92bca938b02010e17a5b8929b49130d';

interface MultisendCall {
  operation: number;
  to: Address;
  value: bigint;
  data: Hex;
}

interface Call {
  to: Address;
  value: bigint;
  callData: Hex;
}

function decodeCallData(callData: Hex): Call | MultisendCall[] {
  function decode(
    to: Address,
    value: bigint,
    callData: Hex,
  ): Call | MultisendCall[] {
    function decodeMultisend(bytes: Hex): MultisendCall[] {
      try {
        const calls: MultisendCall[] = [];
        let byteIndex = 0;
        while (byteIndex < size(bytes)) {
          const operationEnd = byteIndex + 1;
          const operation = slice(bytes, byteIndex, operationEnd);
          const toEnd = operationEnd + 20;
          const to = slice(bytes, operationEnd, toEnd);
          const valueEnd = toEnd + 32;
          const value = BigInt(slice(bytes, toEnd, valueEnd));
          const dataLengthEnd = valueEnd + 32;
          const dataLength = BigInt(slice(bytes, valueEnd, dataLengthEnd));
          const dataEnd = dataLengthEnd + Number(dataLength);
          const data =
            dataLength === BigInt(0)
              ? '0x'
              : slice(bytes, dataLengthEnd, dataEnd);
          const call = {
            operation: Number(operation),
            to,
            value,
            data,
          };
          calls.push(call);
          byteIndex = dataEnd;
        }
        return calls;
      } catch (error) {
        console.error(error);
        return [];
      }
    }

    if (
      to === SAFE_1_3_0_MULTI_SEND_ADDRESS ||
      to === SAFE_1_4_1_MULTI_SEND_1_ADDRESS ||
      to === SAFE_1_4_1_MULTI_SEND_2_ADDRESS
    ) {
      const { functionName, args: multiSendArgs } = decodeFunctionData({
        abi: [
          {
            inputs: [
              { internalType: 'bytes', name: 'transactions', type: 'bytes' },
            ],
            name: 'multiSend',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        data: callData,
      });
      if (functionName === 'multiSend') {
        return decodeMultisend(multiSendArgs[0]);
      }
    }
    return {
      to,
      value,
      callData,
    };
  }

  const { functionName, args } = decodeFunctionData({
    abi: safeCore4337ModuleAbi,
    data: callData,
  });
  if (functionName === 'executeUserOp') {
    return decode(args[0].toLowerCase() as Address, BigInt(args[1]), args[2]);
  }
  if (functionName === 'executeUserOpWithErrorString') {
    return decode(args[0].toLowerCase() as Address, BigInt(args[1]), args[2]);
  }
  return [];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
