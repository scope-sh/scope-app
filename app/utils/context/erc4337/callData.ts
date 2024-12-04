import type { Address, Hex } from 'viem';
import { decodeFunctionData } from 'viem';

interface Call {
  to: Address;
  value: bigint;
  data: Hex;
}

function decode(callData: Hex): Call[] | null {
  try {
    const decodedCallData = decodeFunctionData({
      abi: [
        {
          inputs: [
            {
              components: [
                { name: 'dest', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'data', type: 'bytes' },
              ],
              name: 'calls',
              type: 'tuple[]',
            },
          ],
          name: 'executeBatch',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              name: 'dest',
              type: 'address',
            },
            {
              name: 'value',
              type: 'uint256',
            },
            {
              name: 'func',
              type: 'bytes',
            },
          ],
          name: 'execute',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              name: 'dest',
              type: 'address[]',
            },
            {
              name: 'value',
              type: 'uint256[]',
            },
            {
              name: 'func',
              type: 'bytes[]',
            },
          ],
          name: 'executeBatch',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            {
              internalType: 'address',
              name: 'to',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'value',
              type: 'uint256',
            },
            {
              internalType: 'bytes',
              name: 'data',
              type: 'bytes',
            },
            {
              internalType: 'enum Operation',
              name: '_operation',
              type: 'uint8',
            },
          ],
          name: 'execute',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      data: callData,
    });
    if (decodedCallData.functionName === 'executeBatch') {
      const arg = decodedCallData.args[0] as BatchExecuteArgs;
      const arg1 = decodedCallData.args[1] as bigint[];
      const arg2 = decodedCallData.args[2] as Hex[];
      if (isObjectArray(arg)) {
        return arg.map((item) => ({
          to: item.dest.toLowerCase() as Address,
          value: item.value,
          data: item.data,
        }));
      } else if (isStringArray(arg)) {
        return arg.map((item, index) => ({
          to: item.toLowerCase() as Address,
          value: arg1[index] as bigint,
          data: arg2[index] as Hex,
        }));
      }
    } else if (decodedCallData.functionName === 'execute') {
      return [
        {
          to: decodedCallData.args[0].toLowerCase() as Address,
          value: decodedCallData.args[1] as bigint,
          data: decodedCallData.args[2] as Hex,
        },
      ];
    }
  } catch {
    return null;
  }
  return null;
}

type BatchExecuteArgTuple = readonly {
  dest: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
}[];

type BatchExecuteArgArray = readonly `0x${string}`[];

type BatchExecuteArgs = BatchExecuteArgTuple | BatchExecuteArgArray;

function isObjectArray(arg: BatchExecuteArgs): arg is BatchExecuteArgTuple {
  return typeof arg[0] === 'object' && arg[0] !== null;
}

function isStringArray(arg: BatchExecuteArgs): arg is BatchExecuteArgArray {
  return typeof arg[0] === 'string';
}

export { decode };
export type { Call };
