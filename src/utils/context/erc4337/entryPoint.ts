import {
  type Address,
  type Hex,
  decodeFunctionData,
  encodeAbiParameters,
  keccak256,
  decodeEventLog,
  slice,
} from 'viem';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0';
import type { Log, Transaction } from '@/services/evm';
import type { Chain } from '@/utils/chains';

interface UserOpEvent {
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
  | typeof TX_TYPE_ENTRYPOINT_0_6
  | typeof TX_TYPE_ENTRYPOINT_0_7
  | typeof TX_TYPE_UNKNOWN;

interface UserOp_0_6 {
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

interface UserOp_0_7 {
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

type UserOp = UserOp_0_6 | UserOp_0_7;

interface UserOpData {
  hash: Hex;
  success: boolean;
  sender: Address;
  nonce: bigint;
  initCode: Hex;
  callData: Hex;
  paymaster: Address | null;
  paymasterData: Hex | null;
  signature: Hex;
  preVerificationGas: bigint;
  verificationGasLimit: bigint;
  callGasLimit: bigint;
  actualGasUsed: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  actualGasCost: bigint;
}

interface AccountDeployment {
  address: Address;
  factory: Address;
}

interface CallData {
  to: Address;
  data: Hex;
  value: bigint;
}

const TX_TYPE_ENTRYPOINT_0_6 = 'Entrypoint 0.6';
const TX_TYPE_ENTRYPOINT_0_7 = 'Entrypoint 0.7';
const TX_TYPE_UNKNOWN = 'Unknown';

const ENTRYPOINT_0_6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const ENTRYPOINT_0_7_ADDRESS = '0x0000000071727de22e5e9d8baf0edac6f37da032';

function getTxType(transaction: Transaction): TxType {
  if (transaction.to === ENTRYPOINT_0_6_ADDRESS) {
    return TX_TYPE_ENTRYPOINT_0_6;
  }
  if (transaction.to === ENTRYPOINT_0_7_ADDRESS) {
    return TX_TYPE_ENTRYPOINT_0_7;
  }
  return TX_TYPE_UNKNOWN;
}

function getBeforeExecutionLog(logs: Log[]): Log | null {
  for (const log of logs) {
    if (log.address === ENTRYPOINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
      });
      if (event.eventName !== 'BeforeExecution') {
        continue;
      }
      return log;
    } else if (log.address === ENTRYPOINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
      });
      if (event.eventName !== 'BeforeExecution') {
        continue;
      }
      return log;
    }
  }
  return null;
}

function getUserOpEvents(logs: Log[]): UserOpEvent[] {
  const events: UserOpEvent[] = [];
  for (const log of logs) {
    if (log.address === ENTRYPOINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
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
    } else if (log.address === ENTRYPOINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
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

function getUserOpEvent(
  chain: Chain,
  entrypoint: Address,
  logs: Log[],
  op: UserOp,
): UserOpEvent | null {
  const userOpEvents = getUserOpEvents(logs);
  const userOpEvent = userOpEvents.find(
    (event) => event.userOpHash === getUserOpHash(chain, entrypoint, op),
  );
  return userOpEvent || null;
}

function getUserOps(transaction: Transaction): UserOp[] {
  const emptyOps: UserOp[] = [];
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRYPOINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return emptyOps;
    }
    return args[0] as UserOp_0_6[];
  }
  if (txType === TX_TYPE_ENTRYPOINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return emptyOps;
    }
    return args[0] as UserOp_0_7[];
  }
  return emptyOps;
}

function getUserOpHash(
  chain: Chain,
  entrypoint: Address,
  userOp: UserOp,
): Hex | null {
  if (entrypoint === ENTRYPOINT_0_6_ADDRESS) {
    const userOperation = userOp as UserOp_0_6;
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
        userOperation.sender as Address,
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
      [keccak256(packedUserOp), entrypoint, BigInt(chain)],
    ) as `0x${string}`;
    return keccak256(encoded);
  } else if (entrypoint === ENTRYPOINT_0_7_ADDRESS) {
    const userOperation = userOp as UserOp_0_7;
    const sender = userOperation.sender;
    const nonce = userOperation.nonce;
    const hashInitCode = keccak256(userOperation.initCode);
    const hashCallData = keccak256(userOperation.callData);
    const accountGasLimits = userOperation.accountGasLimits;
    const preVerificationGas = userOperation.preVerificationGas;
    const gasFees = userOperation.gasFees;
    const hashPaymasterAndData = keccak256(userOperation.paymasterAndData);
    const encoded = encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint256' },
      ],
      [
        sender,
        nonce,
        hashInitCode,
        hashCallData,
        accountGasLimits,
        preVerificationGas,
        gasFees,
        hashPaymasterAndData,
        entrypoint,
        BigInt(chain),
      ],
    ) as `0x${string}`;
    return keccak256(encoded);
  }
  return null;
}

function getUserOpData(
  hash: Hex,
  userOp: UserOp,
  event: UserOpEvent,
): UserOpData {
  const paymasterAndDataDecoded =
    userOp.paymasterAndData.length > 2
      ? {
          paymaster: slice(userOp.paymasterAndData, 0, 20),
          data: slice(userOp.paymasterAndData, 20),
        }
      : {
          paymaster: null,
          data: null,
        };
  const verificationGasLimit =
    'verificationGasLimit' in userOp
      ? userOp.verificationGasLimit
      : BigInt(slice(userOp.accountGasLimits, 0, 16));
  const callGasLimit =
    'callGasLimit' in userOp
      ? userOp.callGasLimit
      : BigInt(slice(userOp.accountGasLimits, 16));
  const maxFeePerGas =
    'maxFeePerGas' in userOp
      ? userOp.maxFeePerGas
      : BigInt(slice(userOp.gasFees, 0, 16));
  const maxPriorityFeePerGas =
    'maxPriorityFeePerGas' in userOp
      ? userOp.maxPriorityFeePerGas
      : BigInt(slice(userOp.gasFees, 16));
  return {
    hash,
    success: event.success,
    sender: event.sender.toLowerCase() as Address,
    nonce: event.nonce,
    initCode: userOp.initCode,
    callData: userOp.callData,
    paymaster: paymasterAndDataDecoded.paymaster,
    paymasterData: paymasterAndDataDecoded.data,
    signature: userOp.signature,
    preVerificationGas: userOp.preVerificationGas,
    verificationGasLimit: verificationGasLimit,
    callGasLimit: callGasLimit,
    actualGasUsed: event.actualGasUsed,
    maxFeePerGas,
    maxPriorityFeePerGas,
    actualGasCost: event.actualGasCost,
  };
}

function isEntrypoint(address: Address): boolean {
  return (
    address === ENTRYPOINT_0_6_ADDRESS || address === ENTRYPOINT_0_7_ADDRESS
  );
}

function getUserOpLogs(logs: Log[], hash: Hex): Log[] {
  const beforeExecutionLog = getBeforeExecutionLog(logs);
  if (!beforeExecutionLog) {
    return [];
  }
  const userOpEvents = getUserOpEvents(logs);
  const matchingEvent = userOpEvents.find((event) => hash === event.userOpHash);
  if (!matchingEvent) {
    return [];
  }
  const maxLogIndex = matchingEvent.logIndex;
  if (!maxLogIndex) {
    return [];
  }
  const prevUserOpEvent = userOpEvents[userOpEvents.indexOf(matchingEvent) - 1];
  const minLogIndex = prevUserOpEvent
    ? prevUserOpEvent.logIndex
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
    if (log.address === ENTRYPOINT_0_6_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_6_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
      });
      if (event.eventName !== 'AccountDeployed') {
        continue;
      }
      deployments.push({
        address: event.args.sender,
        factory: event.args.factory,
      });
    } else if (log.address === ENTRYPOINT_0_7_ADDRESS) {
      const event = decodeEventLog({
        abi: entryPointV0_7_0Abi,
        data: log.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        topics: log.topics,
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
  if (txType === TX_TYPE_ENTRYPOINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return null;
    }
    return args[1].toLowerCase() as Address;
  }
  if (txType === TX_TYPE_ENTRYPOINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return null;
    }
    return args[1].toLowerCase() as Address;
  }
  return null;
}

function decodeCallData(callData: Hex): CallData | null {
  return null;
}

export {
  ENTRYPOINT_0_6_ADDRESS,
  ENTRYPOINT_0_7_ADDRESS,
  TX_TYPE_ENTRYPOINT_0_6,
  TX_TYPE_ENTRYPOINT_0_7,
  TX_TYPE_UNKNOWN,
  getTxType,
  getUserOpEvent,
  getUserOpEvents,
  getUserOpData,
  getUserOps,
  getUserOpHash,
  getAccountDeployments,
  getBeneficiary,
  getUserOpLogs,
  isEntrypoint,
  decodeCallData,
};
export type { CallData, TxType, UserOp, UserOp_0_6, UserOp_0_7 };
