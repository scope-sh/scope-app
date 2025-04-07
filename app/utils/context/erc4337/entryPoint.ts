import {
  type Address,
  type Hex,
  type PublicClient,
  type TypedDataDomain,
  decodeFunctionData,
  encodeAbiParameters,
  keccak256,
  decodeEventLog,
  slice,
  size,
  stringToHex,
  hashDomain,
  concat,
  getTypesForEIP712Domain,
  padHex,
} from 'viem';
import { readContract } from 'viem/actions';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0.js';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0.js';
import entryPointV0_8_0Abi from '@/abi/entryPointV0_8_0.js';
import klasterPaymasterAbi from '@/abi/klasterPaymaster.js';
import pimlicoBundleBulkerAbi from '@/abi/pimlicoBundleBulker.js';
import safePaymasterAbi from '@/abi/safePaymaster.js';
import type { Log, Transaction, TransactionTrace } from '@/services/evm.js';
import type { Chain } from '@/utils/chains.js';

interface OpEvent {
  logIndex: number | null;
  userOpHash: Hex;
  sender: Address;
  paymaster: Address;
  nonce: bigint;
  success: boolean;
  actualGasCost: bigint;
  actualGasUsed: bigint;
}

type TxType =
  | typeof TX_TYPE_ENTRY_POINT_0_6
  | typeof TX_TYPE_ENTRY_POINT_0_7
  | typeof TX_TYPE_ENTRY_POINT_0_8
  | typeof TX_TYPE_PIMLICO_BULKER
  | typeof TX_TYPE_KLASTER_PAYMASTER
  | typeof TX_TYPE_SAFE_PAYMASTER
  | typeof TX_TYPE_UNKNOWN;

type Phase = 'creation' | 'validation' | 'payment' | 'execution' | 'unknown';

interface Op_0_6 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: Hex;
  signature: Hex;
}

interface Op_0_7 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: bigint;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

interface Op_0_8 {
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  accountGasLimits: Hex;
  preVerificationGas: bigint;
  gasFees: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

type Op = Op_0_6 | Op_0_7 | Op_0_8;

interface OpUnpacked {
  hash: Hex;
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  factory: Address | null;
  initData: Hex | null;
  callData: Hex;
  paymaster: Address | null;
  paymasterVerificationGasLimit: bigint | null;
  paymasterPostOpGasLimit: bigint | null;
  paymasterData: Hex | null;
  signature: Hex;
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}

interface AccountDeployment {
  address: Address;
  factory: Address;
}

const TX_TYPE_ENTRY_POINT_0_6 = 'Entry Point 0.6';
const TX_TYPE_ENTRY_POINT_0_7 = 'Entry Point 0.7';
const TX_TYPE_ENTRY_POINT_0_8 = 'Entry Point 0.8';
const TX_TYPE_PIMLICO_BULKER = 'Pimlico Bulker';
const TX_TYPE_KLASTER_PAYMASTER = 'Klaster Paymaster';
const TX_TYPE_SAFE_PAYMASTER = 'Safe Paymaster';
const TX_TYPE_UNKNOWN = 'Unknown';

const ENTRY_POINT_0_6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const ENTRY_POINT_0_7_ADDRESS = '0x0000000071727de22e5e9d8baf0edac6f37da032';
const ENTRY_POINT_0_8_ADDRESS = '0x4337084d9e255ff0702461cf8895ce9e3b5ff108';
const PIMLICO_BULKER_ADDRESS = '0x000000000091a1f34f51ce866bed8983db51a97e';
const KLASTER_PAYMASTER_ADDRESS = '0xc31ad82a88609ee88e87d382509060f3490a8eb2';
const SAFE_PAYMASTER_1_ADDRESS = '0xab9b52a97fb334efdb8fd081763952653040806f';
const SAFE_PAYMASTER_2_ADDRESS = '0xb7f0e78413cfb22949e4042e9420b54f1ef0ef0d';

function getTxType(transaction: Transaction): TxType {
  if (transaction.to === ENTRY_POINT_0_6_ADDRESS) {
    return TX_TYPE_ENTRY_POINT_0_6;
  }
  if (transaction.to === ENTRY_POINT_0_7_ADDRESS) {
    return TX_TYPE_ENTRY_POINT_0_7;
  }
  if (transaction.to === ENTRY_POINT_0_8_ADDRESS) {
    return TX_TYPE_ENTRY_POINT_0_8;
  }
  if (transaction.to === PIMLICO_BULKER_ADDRESS) {
    return TX_TYPE_PIMLICO_BULKER;
  }
  if (transaction.to === KLASTER_PAYMASTER_ADDRESS) {
    return TX_TYPE_KLASTER_PAYMASTER;
  }
  if (transaction.to === SAFE_PAYMASTER_1_ADDRESS) {
    return TX_TYPE_SAFE_PAYMASTER;
  }
  if (transaction.to === SAFE_PAYMASTER_2_ADDRESS) {
    return TX_TYPE_SAFE_PAYMASTER;
  }
  return TX_TYPE_UNKNOWN;
}

function getEntryPoint(
  transaction: Transaction,
  trace: TransactionTrace | null,
): Address | null {
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    return ENTRY_POINT_0_6_ADDRESS;
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    return ENTRY_POINT_0_7_ADDRESS;
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_8) {
    return ENTRY_POINT_0_8_ADDRESS;
  }
  if (txType === TX_TYPE_PIMLICO_BULKER) {
    return ENTRY_POINT_0_6_ADDRESS;
  }
  if (txType === TX_TYPE_KLASTER_PAYMASTER) {
    return ENTRY_POINT_0_6_ADDRESS;
  }
  if (txType === TX_TYPE_SAFE_PAYMASTER) {
    return ENTRY_POINT_0_7_ADDRESS;
  } else {
    // Trace-based approach
    if (!trace) {
      return null;
    }
    return getEntryPointFromTrace(trace);
  }
}

function getEntryPointFromTrace(trace: TransactionTrace): Address | null {
  for (const tracePart of trace) {
    if (tracePart.type === 'call') {
      if (tracePart.action.to === ENTRY_POINT_0_6_ADDRESS) {
        return ENTRY_POINT_0_6_ADDRESS;
      }
      if (tracePart.action.to === ENTRY_POINT_0_7_ADDRESS) {
        return ENTRY_POINT_0_7_ADDRESS;
      }
      if (tracePart.action.to === ENTRY_POINT_0_8_ADDRESS) {
        return ENTRY_POINT_0_8_ADDRESS;
      }
    }
  }
  return null;
}

function getBeforeExecutionLog(logs: Log[]): Log | null {
  for (const log of logs) {
    if (log.address === ENTRY_POINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'BeforeExecution') {
        continue;
      }
      return log;
    } else if (log.address === ENTRY_POINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'BeforeExecution') {
        continue;
      }
      return log;
    } else if (log.address === ENTRY_POINT_0_8_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_8_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'BeforeExecution') {
        continue;
      }
      return log;
    }
  }
  return null;
}

function getOpEvents(logs: Log[]): OpEvent[] {
  const events: OpEvent[] = [];
  for (const log of logs) {
    if (log.address === ENTRY_POINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'UserOperationEvent') {
        continue;
      }
      events.push({
        logIndex: log.logIndex,
        userOpHash: event.args.userOpHash,
        sender: event.args.sender.toLowerCase() as Address,
        paymaster: event.args.paymaster.toLowerCase() as Address,
        nonce: event.args.nonce,
        success: event.args.success,
        actualGasCost: event.args.actualGasCost,
        actualGasUsed: event.args.actualGasUsed,
      });
    } else if (log.address === ENTRY_POINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'UserOperationEvent') {
        continue;
      }
      events.push({
        logIndex: log.logIndex,
        userOpHash: event.args.userOpHash,
        sender: event.args.sender.toLowerCase() as Address,
        paymaster: event.args.paymaster.toLowerCase() as Address,
        nonce: event.args.nonce,
        success: event.args.success,
        actualGasCost: event.args.actualGasCost,
        actualGasUsed: event.args.actualGasUsed,
      });
    } else if (log.address === ENTRY_POINT_0_8_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_8_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'UserOperationEvent') {
        continue;
      }
      events.push({
        logIndex: log.logIndex,
        userOpHash: event.args.userOpHash,
        sender: event.args.sender.toLowerCase() as Address,
        paymaster: event.args.paymaster.toLowerCase() as Address,
        nonce: event.args.nonce,
        success: event.args.success,
        actualGasCost: event.args.actualGasCost,
        actualGasUsed: event.args.actualGasUsed,
      });
    }
  }
  return events;
}

function getOpEvent(
  chain: Chain,
  entrypoint: Address,
  logs: Log[],
  op: Op,
  delegate: Address | null,
): OpEvent | null {
  const opEvents = getOpEvents(logs);
  const userOpEvent = opEvents.find(
    (event) => event.userOpHash === getOpHash(chain, entrypoint, op, delegate),
  );
  return userOpEvent || null;
}

async function getOps(
  client: PublicClient,
  transaction: Transaction,
  trace: TransactionTrace | null,
): Promise<Op[]> {
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as Op_0_6[];
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as Op_0_7[];
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_8) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_8_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as Op_0_7[];
  }
  if (txType === TX_TYPE_PIMLICO_BULKER) {
    const bundle = await readContract(client, {
      abi: pimlicoBundleBulkerAbi,
      address: PIMLICO_BULKER_ADDRESS,
      functionName: 'inflate',
      args: [transaction.input],
    });
    return bundle[0].map((op) => ({
      ...op,
    }));
  }
  if (txType === TX_TYPE_KLASTER_PAYMASTER) {
    const { functionName, args } = decodeFunctionData({
      abi: klasterPaymasterAbi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as Op_0_6[];
  } else if (txType === TX_TYPE_SAFE_PAYMASTER) {
    const { functionName, args } = decodeFunctionData({
      abi: safePaymasterAbi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as Op_0_7[];
  } else {
    // Trace-based approach
    if (!trace) {
      return [];
    }
    return getTraceOps(trace);
  }
}

function getTraceOps(trace: TransactionTrace): Op[] {
  const ops: Op[] = [];
  for (const tracePart of trace) {
    if (tracePart.type === 'call') {
      if (tracePart.action.to === ENTRY_POINT_0_6_ADDRESS) {
        try {
          const { functionName, args } = decodeFunctionData({
            abi: entryPointV0_6_0Abi,
            data: tracePart.action.input,
          });
          if (functionName !== 'handleOps') {
            continue;
          }
          ops.push(...args[0]);
        } catch {
          // Ignore
        }
      } else if (tracePart.action.to === ENTRY_POINT_0_7_ADDRESS) {
        try {
          const { functionName, args } = decodeFunctionData({
            abi: entryPointV0_7_0Abi,
            data: tracePart.action.input,
          });
          if (functionName !== 'handleOps') {
            continue;
          }
          ops.push(...args[0]);
        } catch {
          // Ignore
        }
      } else if (tracePart.action.to === ENTRY_POINT_0_8_ADDRESS) {
        try {
          const { functionName, args } = decodeFunctionData({
            abi: entryPointV0_8_0Abi,
            data: tracePart.action.input,
          });
          if (functionName !== 'handleOps') {
            continue;
          }
          ops.push(...args[0]);
        } catch {
          // Ignore
        }
      }
    }
  }
  return ops;
}

function getEip7702InitCodeHashOverride(
  initCode: Hex,
  delegate: Address | null,
): Hex {
  if (!isEip7702InitCode(initCode)) {
    return '0x';
  }
  if (!delegate) {
    return '0x';
  }
  if (size(initCode) <= 20) {
    return keccak256(delegate);
  } else {
    return keccak256(concat([delegate, slice(initCode, 20)]));
  }
}

function isEip7702InitCode(initCode: Hex): boolean {
  if (size(initCode) < 2) {
    return false;
  }
  const initCodeStart = slice(initCode, 0, 20);
  return (
    initCodeStart ===
    padHex('0x7702', {
      size: 20,
      dir: 'right',
    })
  );
}

function getOpHash(
  chain: Chain,
  entryPoint: Address,
  op: Op,
  delegate: Address | null,
): Hex | null {
  if (entryPoint === ENTRY_POINT_0_6_ADDRESS) {
    const userOperation = op as Op_0_6;
    const hashedInitCode = keccak256(userOperation.initCode);
    const hashedCallData = keccak256(userOperation.callData);
    const hashedPaymasterAndData = keccak256(userOperation.paymasterAndData);

    const packedUserOp = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'bytes32' },
      ],
      [
        userOperation.sender,
        userOperation.nonce,
        hashedInitCode,
        hashedCallData,
        userOperation.callGasLimit,
        userOperation.verificationGasLimit,
        userOperation.preVerificationGas,
        userOperation.maxFeePerGas,
        userOperation.maxPriorityFeePerGas,
        hashedPaymasterAndData,
      ],
    );
    const encoded = encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPoint, BigInt(chain)],
    ) as `0x${string}`;
    return keccak256(encoded);
  } else if (entryPoint === ENTRY_POINT_0_7_ADDRESS) {
    const userOperation = op as Op_0_7;
    const hashedInitCode = keccak256(userOperation.initCode);
    const hashedCallData = keccak256(userOperation.callData);
    const hashedPaymasterAndData = keccak256(userOperation.paymasterAndData);
    const packedUserOp = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
      ],
      [
        userOperation.sender,
        userOperation.nonce,
        hashedInitCode,
        hashedCallData,
        userOperation.accountGasLimits,
        userOperation.preVerificationGas,
        userOperation.gasFees,
        hashedPaymasterAndData,
      ],
    );
    const encoded = encodeAbiParameters(
      [{ type: 'bytes32' }, { type: 'address' }, { type: 'uint256' }],
      [keccak256(packedUserOp), entryPoint, BigInt(chain)],
    );
    return keccak256(encoded);
  } else if (entryPoint === ENTRY_POINT_0_8_ADDRESS) {
    const userOperation = op as Op_0_8;
    const typeHash = keccak256(
      stringToHex(
        'PackedUserOperation(address sender,uint256 nonce,bytes initCode,bytes callData,bytes32 accountGasLimits,uint256 preVerificationGas,bytes32 gasFees,bytes paymasterAndData)',
      ),
    );
    const initCodeHashOverride = getEip7702InitCodeHashOverride(
      userOperation.initCode,
      delegate,
    );
    const hashedInitCode =
      initCodeHashOverride === '0x'
        ? keccak256(userOperation.initCode)
        : initCodeHashOverride;
    const hashedCallData = keccak256(userOperation.callData);
    const hashedPaymasterAndData = keccak256(userOperation.paymasterAndData);
    const packedUserOp = encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
      ],
      [
        typeHash,
        userOperation.sender,
        userOperation.nonce,
        hashedInitCode,
        hashedCallData,
        userOperation.accountGasLimits,
        userOperation.preVerificationGas,
        userOperation.gasFees,
        hashedPaymasterAndData,
      ],
    );
    const domain = {
      name: 'ERC4337',
      version: '1',
      chainId: chain,
      verifyingContract: ENTRY_POINT_0_8_ADDRESS,
    } as TypedDataDomain;
    const parts = concat([
      '0x1901',
      hashDomain({
        domain,
        types: {
          EIP712Domain: getTypesForEIP712Domain({ domain }),
        },
      }),
      keccak256(packedUserOp),
    ]);
    return keccak256(parts);
  }
  return null;
}

function unpackOp(hash: Hex, op: Op): OpUnpacked {
  const initCodeUnpacked =
    size(op.initCode) > 0
      ? size(op.initCode) > 20
        ? {
            factory: slice(op.initCode, 0, 20),
            initData: slice(op.initCode, 20),
          }
        : {
            factory: slice(op.initCode, 0, 20),
            initData: null,
          }
      : {
          factory: null,
          initData: null,
        };
  const paymasterDataUnpacked =
    size(op.paymasterAndData) > 0
      ? size(op.paymasterAndData) > 20
        ? {
            paymaster: slice(op.paymasterAndData, 0, 20),
            paymasterVerificationGasLimit: BigInt(
              slice(op.paymasterAndData, 20, 36),
            ),
            paymasterPostOpGasLimit: BigInt(slice(op.paymasterAndData, 36, 52)),
            paymasterData:
              size(op.paymasterAndData) > 52
                ? slice(op.paymasterAndData, 52)
                : '0x',
          }
        : {
            paymaster: slice(op.paymasterAndData, 0, 20),
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
          }
      : {
          paymaster: null,
          paymasterVerificationGasLimit: null,
          paymasterPostOpGasLimit: null,
          paymasterData: null,
        };
  const verificationGasLimit =
    'verificationGasLimit' in op
      ? op.verificationGasLimit
      : BigInt(slice(op.accountGasLimits, 0, 16));
  const callGasLimit =
    'callGasLimit' in op
      ? op.callGasLimit
      : BigInt(slice(op.accountGasLimits, 16));
  const maxFeePerGas =
    'maxFeePerGas' in op ? op.maxFeePerGas : BigInt(slice(op.gasFees, 0, 16));
  const maxPriorityFeePerGas =
    'maxPriorityFeePerGas' in op
      ? op.maxPriorityFeePerGas
      : BigInt(slice(op.gasFees, 16));
  return {
    hash,
    sender: op.sender.toLowerCase() as Address,
    nonce: op.nonce,
    initCode: op.initCode,
    factory: initCodeUnpacked.factory,
    initData: initCodeUnpacked.initData,
    callData: op.callData,
    paymaster: paymasterDataUnpacked.paymaster,
    paymasterVerificationGasLimit:
      paymasterDataUnpacked.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
    paymasterData: paymasterDataUnpacked.paymasterData,
    signature: op.signature,
    preVerificationGas: op.preVerificationGas,
    verificationGasLimit: verificationGasLimit,
    callGasLimit: callGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
}

function getOpLogs(logs: Log[], hash: Hex): Log[] {
  const beforeExecutionLog = getBeforeExecutionLog(logs);
  if (!beforeExecutionLog) {
    return [];
  }
  const opEvents = getOpEvents(logs);
  const matchingEvent = opEvents.find((event) => hash === event.userOpHash);
  if (!matchingEvent) {
    return [];
  }
  const maxLogIndex = matchingEvent.logIndex;
  if (!maxLogIndex) {
    return [];
  }
  const prevOpEvent = opEvents[opEvents.indexOf(matchingEvent) - 1];
  const minLogIndex = prevOpEvent
    ? prevOpEvent.logIndex
    : beforeExecutionLog.logIndex;
  if (minLogIndex === null) {
    return [];
  }
  return logs.filter(
    (log) =>
      log.logIndex && log.logIndex > minLogIndex && log.logIndex <= maxLogIndex,
  );
}

function getAccountDeployments(logs: Log[]): AccountDeployment[] {
  const deployments: AccountDeployment[] = [];
  for (const log of logs) {
    if (log.address === ENTRY_POINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'AccountDeployed') {
        continue;
      }
      deployments.push({
        address: event.args.sender,
        factory: event.args.factory,
      });
    } else if (log.address === ENTRY_POINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'AccountDeployed') {
        continue;
      }
      deployments.push({
        address: event.args.sender,
        factory: event.args.factory,
      });
    } else if (log.address === ENTRY_POINT_0_8_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_8_0Abi,
        data: log.data,
        topics: log.topics as [Hex, ...Hex[]],
      });
      if (event.eventName !== 'AccountDeployed') {
        continue;
      }
      deployments.push({
        address: event.args.sender,
        factory: event.args.factory,
      });
    }
  }
  return deployments;
}

function getBeneficiary(transaction: Transaction): Address | null {
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return null;
    }
    return args[1].toLowerCase() as Address;
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return null;
    }
    return args[1].toLowerCase() as Address;
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_8) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_8_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return null;
    }
    return args[1].toLowerCase() as Address;
  }
  return null;
}

function getPhaseByEntryPointError(error: string): Phase {
  const CREATION_ERRORS = [
    'AA10 sender already constructed',
    'AA13 initCode failed or OOG',
    'AA14 initCode must return sender',
    'AA15 initCode must create sender',
  ];

  const VALIDATION_ERRORS = [
    'AA20 account not deployed',
    "AA21 didn't pay prefund",
    'AA22 expired or not due',
    'AA23 reverted (or OOG)',
    'AA24 signature error',
    'AA25 invalid account nonce',
  ];

  const PAYMENT_ERRORS = [
    'AA30 paymaster not deployed',
    'AA31 paymaster deposit too low',
    'AA32 paymaster expired or not due',
    'AA33 reverted (or OOG)',
    'AA34 signature error',
    'AA50 postOp reverted',
    'AA51 prefund below actualGasCost',
    'AA93 invalid paymasterAndData',
  ];

  if (CREATION_ERRORS.includes(error)) {
    return 'creation';
  }
  if (VALIDATION_ERRORS.includes(error)) {
    return 'validation';
  }
  if (PAYMENT_ERRORS.includes(error)) {
    return 'payment';
  }
  return 'unknown';
}

export {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  ENTRY_POINT_0_8_ADDRESS,
  TX_TYPE_UNKNOWN,
  getTxType,
  getEntryPoint,
  getOpEvent,
  getOpEvents,
  getOps,
  getOpHash,
  getAccountDeployments,
  getBeneficiary,
  getOpLogs,
  getPhaseByEntryPointError,
  unpackOp,
};
export type { TxType, Phase, Op, OpUnpacked, Op_0_6, Op_0_7, Op_0_8 };
