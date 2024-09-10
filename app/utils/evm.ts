import type { Address, Hex } from 'viem';
import { decodeFunctionData, pad, slice } from 'viem';

import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
} from './context/erc4337/entryPoint';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0';
import iAccountAbi from '@/abi/iAccount';
import type { Call as InternalCallRow } from '@/components/__common/TreeInternalCalls.vue';
import type {
  DebugTransactionTrace,
  DebugTransactionTraceCall,
  TransactionTrace,
  TransactionTracePart,
  TransactionTraceCallPart,
  TransactionTraceCreatePart,
} from '@/services/evm';

interface UserOpTrace {
  creation: TransactionTracePart[];
  validation: TransactionTracePart[];
  execution: TransactionTracePart[];
}

function convertTransactionTraceToRows(
  trace: TransactionTrace | null,
): InternalCallRow[] {
  if (!trace) {
    return [];
  }
  return trace.map((transaction) => {
    return {
      success:
        transaction.error === null
          ? true
          : transaction.error === 'OOG'
            ? {
                type: 'OOG',
              }
            : {
                type: 'Revert',
                reason: '',
              },
      type:
        transaction.type === 'create' ? 'create' : transaction.action.callType,
      from: transaction.action.from,
      to: transaction.type === 'call' ? transaction.action.to : null,
      input:
        transaction.type === 'call'
          ? transaction.action.input
          : transaction.action.init,
      value: transaction.action.value,
      gas: {
        used: transaction.result.gasUsed,
        limit: transaction.action.gas,
      },
      traceAddress: transaction.traceAddress,
    };
  });
}

function convertDebugTraceToTransactionTrace(
  debugTrace: DebugTransactionTrace | null,
): TransactionTrace | null {
  function processCall(
    call: DebugTransactionTraceCall,
    traceAddress: number[] = [],
  ): TransactionTracePart[] {
    const basePart: Pick<
      TransactionTracePart,
      'error' | 'subtraces' | 'traceAddress'
    > = {
      error: call.error,
      subtraces: call.calls.length,
      traceAddress,
    };

    const result: TransactionTracePart[] = [];

    if (
      call.type === 'CALL' ||
      call.type === 'STATICCALL' ||
      call.type === 'DELEGATECALL'
    ) {
      const callPart: TransactionTraceCallPart = {
        ...basePart,
        type: 'call',
        action: {
          from: call.from,
          callType: call.type.toLowerCase() as
            | 'call'
            | 'delegatecall'
            | 'staticcall',
          gas: call.gas,
          input: call.input,
          to: call.to,
          value: call.value,
        },
        result: {
          gasUsed: call.gasUsed,
          output: call.output,
        },
      };
      result.push(callPart);
    } else if (call.type === 'CREATE' || call.type === 'CREATE2') {
      const createPart: TransactionTraceCreatePart = {
        ...basePart,
        type: 'create',
        action: {
          from: call.from,
          gas: call.gas,
          init: call.input,
          value: call.value,
        },
        result: {
          gasUsed: call.gasUsed,
          address: call.to,
          code: call.output,
        },
      };
      result.push(createPart);
    }

    // Process nested calls
    call.calls.forEach((nestedCall, index) => {
      result.push(...processCall(nestedCall, [...traceAddress, index]));
    });

    return result;
  }

  if (!debugTrace) {
    return null;
  }
  return processCall(debugTrace);
}

function getUserOpTrace(
  transactionTrace: TransactionTracePart[],
  hash: Hex,
  sender: Address,
): UserOpTrace | null {
  function getInternalCalls(
    trace: TransactionTrace,
    tracePart: TransactionTracePart | undefined,
  ): TransactionTracePart[] {
    if (!tracePart) {
      return [];
    }
    return trace.filter(
      (part) =>
        part.traceAddress.length >= tracePart.traceAddress.length &&
        part.traceAddress.join().startsWith(tracePart.traceAddress.join()),
    );
  }

  // Get creation traces
  // Find the "createSender" calls from the entrypoint
  const createSenderCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      (part.action.from === ENTRY_POINT_0_6_ADDRESS ||
        part.action.from === ENTRY_POINT_0_7_ADDRESS) &&
      slice(part.action.input, 0, 4) === '0x570e1a36',
  );
  const createSenderCall = createSenderCalls.find(
    (item) => item.result.output === pad(sender.toLowerCase() as Address),
  );
  const createSenderCallInnerCalls = getInternalCalls(
    transactionTrace,
    createSenderCall,
  );

  // Get validation traces

  // Find the "validateUserOp" calls from the entrypoint
  const validateUserOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0x3a871cdd') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x19822f7c')),
  );
  const validateUserOpCall = validateUserOpCalls.find((call) => {
    const decoded = decodeFunctionData({
      abi: iAccountAbi,
      data: call.action.input,
    });
    if (decoded.functionName !== 'validateUserOp') {
      return false;
    }
    return decoded.args[1] === hash;
  });
  if (!validateUserOpCall) {
    return null;
  }
  const validateUserOpCallInnerCalls = getInternalCalls(
    transactionTrace,
    validateUserOpCall,
  );

  // Find the "validatePaymasterUserOp" calls from the entrypoint
  const validatePaymasterUserOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0xf465c77e') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x52b7512c')),
  );
  const validatePaymasterUserOpCall = validatePaymasterUserOpCalls.find(
    (call) => {
      const decoded = decodeFunctionData({
        abi: iAccountAbi,
        data: call.action.input,
      });
      if (decoded.functionName !== 'validatePaymasterUserOp') {
        return false;
      }
      return decoded.args[1] === hash;
    },
  );
  const validatePaymasterUserOpCallInnerCalls = getInternalCalls(
    transactionTrace,
    validatePaymasterUserOpCall,
  );

  // Get execution traces
  // Find the "innerHandleOp" calls from the entrypoint to the entrypoint
  const innerHandleOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        part.action.to === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0x1d732756') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          part.action.to === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x0042dc53')),
  );
  const innerHandleOpCall = innerHandleOpCalls.find((call) => {
    const decoded =
      call.action.from === ENTRY_POINT_0_6_ADDRESS
        ? decodeFunctionData({
            abi: entryPointV0_6_0Abi,
            data: call.action.input,
          })
        : decodeFunctionData({
            abi: entryPointV0_7_0Abi,
            data: call.action.input,
          });
    if (decoded.functionName !== 'innerHandleOp') {
      return false;
    }
    return decoded.args[1].userOpHash === hash;
  });
  if (!innerHandleOpCall) {
    return null;
  }
  const innerHandleOpCallInnerCalls = getInternalCalls(
    transactionTrace,
    innerHandleOpCall,
  );

  return {
    creation: createSenderCallInnerCalls,
    validation: [
      ...validateUserOpCallInnerCalls,
      ...validatePaymasterUserOpCallInnerCalls,
    ],
    execution: innerHandleOpCallInnerCalls,
  };
}

export {
  convertTransactionTraceToRows,
  convertDebugTraceToTransactionTrace,
  getUserOpTrace,
};
export type { UserOpTrace };
