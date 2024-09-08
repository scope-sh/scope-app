import type { Address, Hex } from 'viem';
import { decodeFunctionData } from 'viem';

import { decodeCallData as decodeAlchemyLightV2CallData } from './alchemyLightV2.js';
import { decodeCallData as decodeBiconomyV2CallData } from './biconomyV2.js';
import { decodeCallData as decodeDaimoCallData } from './daimo.js';
import { decodeCallData as decodeFunV1CallData } from './funV1.js';
import { decodeCallData as decodeKernelV2CallData } from './kernelV2.js';
import { decodeCallData as decodeKernelV3CallData } from './kernelV3.js';
import { decodeCallData as decodeSafeCoreCallData } from './safeCore.js';

import type { LabelTypeId } from '@/services/api.js';

interface Call {
  to: Address;
  value: bigint;
  data: Hex;
}

function decode(labelTypeId: LabelTypeId | null, callData: Hex): Call[] | null {
  if (labelTypeId !== null) {
    const calls = decodeLabelledCallData(labelTypeId, callData);
    if (calls !== null) {
      return calls;
    }
  }
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

function decodeLabelledCallData(
  labelTypeId: LabelTypeId,
  callData: Hex,
): Call[] | null {
  switch (labelTypeId) {
    case 'alchemy-v1.0-light-account':
    case 'alchemy-v1.1-light-account':
    case 'alchemy-v2-light-account':
      return decodeAlchemyLightV2CallData(callData);
    case 'biconomy-v2-account':
      return decodeBiconomyV2CallData(callData);
    case 'daimo-v1-account':
      return decodeDaimoCallData(callData);
    case 'fun-v1-account':
      return decodeFunV1CallData(callData);
    case 'kernel-v2-account':
      return decodeKernelV2CallData(callData);
    case 'kernel-v3-account':
      return decodeKernelV3CallData(callData);
    case 'safe-v1.4.1-account':
    case 'safe7579-v1.0.0-account':
      return decodeSafeCoreCallData(callData);
  }
  return null;
}

export { decode };
export type { Call };
