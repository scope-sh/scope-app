import type { Address, Hex } from 'viem';
import {
  decodeAbiParameters,
  decodeFunctionData,
  hexToBigInt,
  size,
  slice,
} from 'viem';

type Execution =
  | SingleCallExecution
  | BatchCallExecution
  | StaticCallExecution
  | DelegateCallExecution;

type ExecutionType = 'revert' | 'no_revert';

interface Call {
  target: Address;
  value: bigint;
  data: Hex;
}

type CallType = 'single' | 'batch' | 'static' | 'delegate';

interface BaseExecution {
  callType: CallType;
  executionType: ExecutionType;
}

interface SingleCallExecution extends BaseExecution {
  callType: 'single';
  call: Call;
}

type BatchCallExecution =
  | SimpleBatchCallExecution
  | OpDataBatchCallExecution
  | BatchOfBatchesCallExecution;

interface SimpleBatchCallExecution extends BaseExecution {
  callType: 'batch';
  mode: 'simple';
  calls: Call[];
}

interface OpDataBatchCallExecution extends BaseExecution {
  callType: 'batch';
  mode: 'op_data';
  calls: Call[];
  opData: Hex;
}

interface BatchOfBatchesCallExecution extends BaseExecution {
  callType: 'batch';
  mode: 'multi_batch';
  batches: {
    calls: Call[];
    opData: Hex;
  }[];
}

interface StaticCallExecution extends BaseExecution {
  callType: 'static';
  data: Hex;
}

interface DelegateCallExecution extends BaseExecution {
  callType: 'delegate';
  call: Call;
}

interface Mode {
  callType: 'single' | 'batch' | 'static' | 'delegate' | null;
  executionType: ExecutionType | null;
  modeSelector: Hex;
  modePayload: Hex;
}

function decodeCalldata(calldata: Hex): Execution | null {
  try {
    const decoded = decodeFunctionData({
      abi: [
        {
          name: 'execute',
          type: 'function',
          inputs: [
            {
              name: 'mode',
              type: 'bytes32',
            },
            {
              name: 'executionData',
              type: 'bytes',
            },
          ],
          outputs: [],
          stateMutability: 'payable',
        },
      ] as const,
      data: calldata,
    });
    const modeData = decoded.args[0];
    const executionData = decoded.args[1];

    const mode = parseMode(modeData);

    const callType = mode.callType;
    const executionType = mode.executionType;

    if (callType === null || executionType === null) {
      return null;
    }

    switch (callType) {
      case 'single': {
        const target = slice(executionData, 0, 20);
        const value = hexToBigInt(slice(executionData, 20, 52));
        const data = size(executionData) > 52 ? slice(executionData, 52) : '0x';
        return {
          callType: 'single',
          executionType,
          call: {
            target,
            value,
            data,
          },
        };
      }
      case 'batch':
        return decodeBatchCalldata(
          executionType,
          mode.modeSelector,
          executionData,
        );
      case 'static':
        return {
          callType: 'static',
          executionType,
          data: executionData,
        };
      case 'delegate': {
        const call = decodeAbiParameters(
          [
            {
              type: 'address',
              name: 'target',
            },
            {
              type: 'bytes',
              name: 'callData',
            },
          ],
          executionData,
        );
        return {
          callType: 'delegate',
          executionType,
          call: {
            target: call[0],
            value: 0n,
            data: call[1],
          },
        };
      }
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

function decodeBatchCalldata(
  executionType: ExecutionType,
  modeSelector: Hex,
  executionData: Hex,
): Execution | null {
  switch (modeSelector) {
    case '0x00000000': {
      // Simple batch call
      const calls = decodeAbiParameters(
        [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              {
                type: 'address',
                name: 'target',
              },
              {
                type: 'uint256',
                name: 'value',
              },
              {
                type: 'bytes',
                name: 'data',
              },
            ],
          },
        ],
        executionData,
      );
      return {
        callType: 'batch',
        executionType,
        mode: 'simple',
        calls: calls[0].map((call) => ({
          target: call.target,
          value: call.value,
          data: call.data,
        })),
      };
    }
    case '0x78210001': {
      // OpData batch call
      const calls = decodeAbiParameters(
        [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              {
                type: 'address',
                name: 'target',
              },
              {
                type: 'uint256',
                name: 'value',
              },
              {
                type: 'bytes',
                name: 'data',
              },
            ],
          },
          {
            type: 'bytes',
            name: 'opData',
          },
        ],
        executionData,
      );
      return {
        callType: 'batch',
        executionType,
        mode: 'op_data',
        calls: calls[0].map((call) => ({
          target: call.target,
          value: call.value,
          data: call.data,
        })),
        opData: calls[1],
      };
    }
    case '0x78210002': {
      // Multi-batch call
      const callBytes = decodeAbiParameters(
        [
          {
            type: 'bytes[]',
            name: 'bytes',
          },
        ],
        executionData,
      );
      const batches = callBytes[0]
        .map((bytes) => {
          const execution = decodeBatchCalldata(
            executionType,
            '0x78210001',
            bytes,
          );
          if (execution === null) {
            return null;
          }
          if (execution.callType !== 'batch') {
            return null;
          }
          if (execution.mode !== 'op_data') {
            return null;
          }
          return {
            calls: execution.calls,
            opData: execution.opData,
          };
        })
        .filter((call) => call !== null);
      return {
        callType: 'batch',
        executionType,
        mode: 'multi_batch',
        batches,
      };
    }
    default: {
      return null;
    }
  }
}

function parseMode(modeData: Hex): Mode {
  const callTypeHexRaw = slice(modeData, 0, 1);
  const executionTypeRaw = slice(modeData, 1, 2);
  // const unused = slice(modeData, 2, 6);
  const modeSelector = slice(modeData, 6, 10);
  const modePayload = slice(modeData, 10, 32);

  const callType =
    callTypeHexRaw === '0x00'
      ? 'single'
      : callTypeHexRaw === '0x01'
        ? 'batch'
        : callTypeHexRaw === '0xfe'
          ? 'static'
          : callTypeHexRaw === '0xff'
            ? 'delegate'
            : null;
  const executionType =
    executionTypeRaw === '0x00'
      ? 'revert'
      : executionTypeRaw === '0x01'
        ? 'no_revert'
        : null;

  return {
    callType,
    executionType,
    modeSelector,
    modePayload,
  };
}

export { decodeCalldata };
export type { Call, CallType, Execution, ExecutionType };
