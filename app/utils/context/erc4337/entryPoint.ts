import {
  type Address,
  type Hex,
  type PublicClient,
  decodeFunctionData,
  encodeAbiParameters,
  keccak256,
  decodeEventLog,
  slice,
  size,
} from 'viem';
import { readContract } from 'viem/actions';

import { decodeCallData as decodeDaimoCallData } from './daimo.js';
import { decodeCallData as decodeSafeCoreCallData } from './safeCore.js';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0.js';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0.js';
import klasterPaymasterAbi from '@/abi/klasterPaymaster.js';
import pimlicoBundleBulkerAbi from '@/abi/pimlicoBundleBulker.js';
import type { Log, Transaction } from '@/services/evm.js';
import type { Chain } from '@/utils/chains.js';
import { decodeCallData as decodeKernelV3CallData } from '@/utils/context/erc7579/kernelV3.js';

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
  | typeof TX_TYPE_ENTRY_POINT_0_6
  | typeof TX_TYPE_ENTRY_POINT_0_7
  | typeof TX_TYPE_PIMLICO_BULKER
  | typeof TX_TYPE_KLASTER_PAYMASTER
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

interface UserOpUnpacked {
  hash: Hex;
  success: boolean;
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
  actualGasUsed: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  actualGasCost: bigint;
}

interface AccountDeployment {
  address: Address;
  factory: Address;
}

interface Call {
  to: Address;
  callData: Hex;
  value: bigint;
}

const TX_TYPE_ENTRY_POINT_0_6 = 'Entry Point 0.6';
const TX_TYPE_ENTRY_POINT_0_7 = 'Entry Point 0.7';
const TX_TYPE_PIMLICO_BULKER = 'Pimlico Bulker';
const TX_TYPE_KLASTER_PAYMASTER = 'Klaster Paymaster';
const TX_TYPE_UNKNOWN = 'Unknown';

const ENTRY_POINT_0_6_ADDRESS = '0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789';
const ENTRY_POINT_0_7_ADDRESS = '0x0000000071727de22e5e9d8baf0edac6f37da032';
const PIMLICO_BULKER_ADDRESS = '0x000000000091a1f34f51ce866bed8983db51a97e';
const KLASTER_PAYMASTER_ADDRESS = '0xc31ad82a88609ee88e87d382509060f3490a8eb2';

function getTxType(transaction: Transaction): TxType {
  if (transaction.to === ENTRY_POINT_0_6_ADDRESS) {
    return TX_TYPE_ENTRY_POINT_0_6;
  }
  if (transaction.to === ENTRY_POINT_0_7_ADDRESS) {
    return TX_TYPE_ENTRY_POINT_0_7;
  }
  if (transaction.to === PIMLICO_BULKER_ADDRESS) {
    return TX_TYPE_PIMLICO_BULKER;
  }
  if (transaction.to === KLASTER_PAYMASTER_ADDRESS) {
    return TX_TYPE_KLASTER_PAYMASTER;
  }
  return TX_TYPE_UNKNOWN;
}

function getEntryPoint(transaction: Transaction): Address | null {
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    return ENTRY_POINT_0_6_ADDRESS;
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    return ENTRY_POINT_0_7_ADDRESS;
  }
  if (TX_TYPE_PIMLICO_BULKER) {
    return ENTRY_POINT_0_6_ADDRESS;
  }
  if (TX_TYPE_KLASTER_PAYMASTER) {
    return ENTRY_POINT_0_6_ADDRESS;
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
    }
  }
  return null;
}

function getUserOpEvents(logs: Log[]): UserOpEvent[] {
  const events: UserOpEvent[] = [];
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

async function getUserOps(
  client: PublicClient,
  transaction: Transaction,
): Promise<UserOp[]> {
  const txType = getTxType(transaction);
  if (txType === TX_TYPE_ENTRY_POINT_0_6) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_6_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as UserOp_0_6[];
  }
  if (txType === TX_TYPE_ENTRY_POINT_0_7) {
    const { functionName, args } = decodeFunctionData({
      abi: entryPointV0_7_0Abi,
      data: transaction.input,
    });
    if (functionName !== 'handleOps') {
      return [];
    }
    return args[0] as UserOp_0_7[];
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
    return args[0] as UserOp_0_6[];
  }
  return [];
}

function getUserOpHash(
  chain: Chain,
  entryPoint: Address,
  userOp: UserOp,
): Hex | null {
  if (entryPoint === ENTRY_POINT_0_6_ADDRESS) {
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
    const userOperation = userOp as UserOp_0_7;
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
  }
  return null;
}

function unpackUserOp(
  hash: Hex,
  userOp: UserOp,
  event: UserOpEvent,
): UserOpUnpacked {
  const initCodeUnpacked =
    size(userOp.initCode) > 0
      ? {
          factory: slice(userOp.initCode, 0, 20),
          initData: slice(userOp.initCode, 20),
        }
      : {
          factory: null,
          initData: null,
        };
  const paymasterDataUnpacked =
    size(userOp.paymasterAndData) > 0
      ? size(userOp.paymasterAndData) > 20
        ? {
            paymaster: slice(userOp.paymasterAndData, 0, 20),
            paymasterVerificationGasLimit: BigInt(
              slice(userOp.paymasterAndData, 20, 36),
            ),
            paymasterPostOpGasLimit: BigInt(
              slice(userOp.paymasterAndData, 36, 52),
            ),
            paymasterData: slice(userOp.paymasterAndData, 52),
          }
        : {
            paymaster: slice(userOp.paymasterAndData, 0, 20),
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
    factory: initCodeUnpacked.factory,
    initData: initCodeUnpacked.initData,
    callData: userOp.callData,
    paymaster: paymasterDataUnpacked.paymaster,
    paymasterVerificationGasLimit:
      paymasterDataUnpacked.paymasterVerificationGasLimit,
    paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
    paymasterData: paymasterDataUnpacked.paymasterData,
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
  return null;
}

function decodeCalls(callData: Hex): Call[] | null {
  const selector = slice(callData, 0, 4);
  try {
    if (selector === '0xe9ae5c53') {
      // Kernel V3 `execute` function
      const decodedCallData = decodeKernelV3CallData(callData);
      if (!decodedCallData) {
        return null;
      }
      if (decodedCallData.type === 'single') {
        return [decodedCallData.execution];
      }
      if (decodedCallData.type === 'batch') {
        return decodedCallData.executions;
      }
      return null;
    }
    if (selector === '0x541d63c8' || selector === '0x7bb37428') {
      // Safe Core 4337 module
      const decodedCallData = decodeSafeCoreCallData(callData);
      if (Array.isArray(decodedCallData)) {
        return decodedCallData.map((call) => ({
          to: call.to,
          callData: call.data,
          value: call.value,
        }));
      }
      return [decodedCallData];
    }
    if (selector === '0x34fcd5be') {
      // Daimo "executeBatch" function
      const decodedCallData = decodeDaimoCallData(callData);
      return decodedCallData.map((call) => ({
        to: call.dest,
        callData: call.data,
        value: call.value,
      }));
    }
  } catch {
    return null;
  }
  return null;
}

export {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  TX_TYPE_ENTRY_POINT_0_6,
  TX_TYPE_ENTRY_POINT_0_7,
  TX_TYPE_UNKNOWN,
  getTxType,
  getEntryPoint,
  getUserOpEvent,
  getUserOpEvents,
  getUserOps,
  getUserOpHash,
  getAccountDeployments,
  getBeneficiary,
  getUserOpLogs,
  decodeCalls,
  unpackUserOp,
};
export type { Call, TxType, UserOp, UserOpUnpacked, UserOp_0_6, UserOp_0_7 };
