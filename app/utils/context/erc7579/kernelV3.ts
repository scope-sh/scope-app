import {
  type Address,
  type Hex,
  decodeAbiParameters,
  decodeFunctionData,
  parseAbiParameters,
  size,
  slice,
  toBytes,
  toHex,
} from 'viem';

import kernelV3AccountAbi from '@/abi/kernelV3Account.js';

type CallType = 'single' | 'batch' | 'static' | 'delegatecall';
type ExecType = 'default' | 'try';
type ValidationMode = 'default' | 'enable' | 'install';
type ValidationType = 'root' | 'validator' | 'permission';

interface ExecMode {
  callType: CallType;
  execType: ExecType;
  execModeSelector: Hex;
  execModePayload: Hex;
}

interface NonceDecoded {
  mode: ValidationMode;
  vType: ValidationType;
  identifier: Hex;
}

interface Execution {
  to: Address;
  data: Hex;
  value: bigint;
}

interface CallDataBatch {
  type: 'batch';
  executions: Execution[];
}

interface CallDataSingle {
  type: 'single';
  execution: Execution;
}

interface CallDataDelegate {
  type: 'delegate';
  delegate: Address;
  calldata: Hex;
}

type CallDataDecoded = CallDataBatch | CallDataSingle | CallDataDelegate;

function bitwiseAndHexStrings(hex1: Hex, hex2: Hex): Hex {
  const num1 = BigInt(hex1);
  const num2 = BigInt(hex2);
  const result = num1 & num2;
  return result.toString(16) as Hex;
}

function decodeNonce(nonce: bigint): NonceDecoded | null {
  function decodeValidationMode(modeIndex: Hex): ValidationMode | null {
    switch (modeIndex) {
      case '0x00':
        return 'default';
      case '0x01':
        return 'enable';
      case '0x02':
        return 'install';
      default:
        return null;
    }
  }
  function decodeValidationType(vType: Hex): ValidationType | null {
    switch (vType) {
      case '0x00':
        return 'root';
      case '0x01':
        return 'validator';
      case '0x02':
        return 'permission';
      default:
        return null;
    }
  }

  const nonceHex: Hex = toHex(toBytes(nonce, { size: 32 }));
  const modeIndex = slice(nonceHex, 0, 1);
  const vTypeIndex = slice(nonceHex, 1, 2);
  let identifier = slice(nonceHex, 2, 22);
  const mode = decodeValidationMode(modeIndex);
  const vType = decodeValidationType(vTypeIndex);
  if (mode === null || vType === null) {
    return null;
  }
  if (slice(nonceHex, 31, 32) === '0x02') {
    identifier = bitwiseAndHexStrings(
      identifier,
      '0xffffffffff000000000000000000000000000000000000000000000000000000',
    );
  }
  return { mode, vType, identifier };
}

function decodeExecMode(execMode: Hex): ExecMode {
  function decodeCallType(callType: Hex): CallType {
    switch (callType) {
      case '0x00':
        return 'single';
      case '0x01':
        return 'batch';
      case '0xfe':
        return 'static';
      case '0xff':
        return 'delegatecall';
      default:
        throw new Error('Invalid call type');
    }
  }

  function decodeExecType(execType: Hex): ExecType {
    switch (execType) {
      case '0x00':
        return 'default';
      case '0x01':
        return 'try';
      default:
        throw new Error('Invalid exec type');
    }
  }

  const callType = decodeCallType(slice(execMode, 0, 1));
  const execType = decodeExecType(slice(execMode, 1, 2));
  const execModeSelector = slice(execMode, 6, 10);
  const execModePayload = slice(execMode, 10);

  return {
    callType,
    execType,
    execModeSelector,
    execModePayload,
  };
}

function decodeCallData(callData: Hex): CallDataDecoded | null {
  const { functionName, args } = decodeFunctionData({
    abi: kernelV3AccountAbi,
    data: callData,
  });
  if (functionName !== 'execute') {
    return null;
  }
  const execModeDecoded = decodeExecMode(args[0]);
  const packedCalldata = args[1];
  switch (execModeDecoded.callType) {
    case 'batch': {
      const executions = decodeAbiParameters(
        parseAbiParameters('(address target, uint256 value, bytes callData)[]'),
        packedCalldata,
      );
      return {
        type: 'batch',
        executions: executions[0].map((execution) => ({
          to: execution.target.toLowerCase() as Address,
          value: execution.value,
          data: execution.callData,
        })),
      };
    }
    case 'single': {
      const target = slice(packedCalldata, 0, 20);
      const value = slice(packedCalldata, 20, 52);
      const data = size(packedCalldata) > 52 ? slice(packedCalldata, 52) : '0x';
      return {
        type: 'single',
        execution: {
          to: target,
          value: BigInt(value),
          data: data,
        },
      };
    }
    case 'delegatecall': {
      const delegate = slice(packedCalldata, 0, 20);
      const calldata = slice(packedCalldata, 20);
      return {
        type: 'delegate',
        delegate,
        calldata,
      };
    }
    default: {
      throw new Error('Not supported');
    }
  }
}

export { decodeNonce, decodeCallData };
