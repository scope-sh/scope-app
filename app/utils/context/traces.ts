import type { Address, Hex } from 'viem';
import { decodeFunctionData, pad, slice } from 'viem';

import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
} from './erc4337/entryPoint';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0';
import iAccountAbi from '@/abi/iAccount';
import type {
  DebugTransactionTrace,
  DebugTransactionTraceCall,
  TransactionTrace,
  TransactionTracePart,
  TransactionTraceCallPart,
  TransactionTraceCreatePart,
} from '@/services/evm';

interface OpTrace {
  creation: TransactionTracePart[];
  validation: TransactionTracePart[];
  execution: TransactionTracePart[];
}

function startsWith(a: number[], b: number[]): boolean {
  if (b.length > a.length) return false;
  return b.every((num, index) => num === a[index]);
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

// Finds the trace part that bubbles up the error
// There should be a clear path from the top level to the error
// Returns the lowest level error in the path or null if no error is found
function getRevert(
  transactionTrace: TransactionTracePart[],
): TransactionTracePart | null {
  function getDirectChildren(
    trace: TransactionTracePart[],
    parent: TransactionTracePart,
  ): TransactionTracePart[] {
    return trace.filter((part) => {
      return (
        part.traceAddress.length === parent.traceAddress.length + 1 &&
        startsWith(part.traceAddress, parent.traceAddress)
      );
    });
  }

  function getDirectChildRevert(
    parent: TransactionTracePart,
  ): TransactionTracePart | null {
    if (parent.error === null) {
      return null;
    }
    const children = getDirectChildren(transactionTrace, parent);
    for (const child of children) {
      const result = getDirectChildRevert(child);
      if (result) {
        return result;
      }
    }
    if (parent.error !== null) {
      return parent;
    }
    return null;
  }

  const root = transactionTrace.find((part) => part.traceAddress.length === 0);
  if (!root) {
    return null;
  }
  // Use recursion to find the error
  return getDirectChildRevert(root);
}

function getOpTrace(
  transactionTrace: TransactionTracePart[],
  hash: Hex,
  sender: Address,
): OpTrace | null {
  function getInternalCalls(
    trace: TransactionTrace,
    tracePart: TransactionTracePart | undefined,
  ): TransactionTracePart[] {
    if (!tracePart) {
      return [];
    }
    return trace.filter((part) => {
      return (
        part.traceAddress.length >= tracePart.traceAddress.length &&
        startsWith(part.traceAddress, tracePart.traceAddress)
      );
    });
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
  const validateOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0x3a871cdd') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x19822f7c')),
  );
  const validateOpCall = validateOpCalls.find((call) => {
    const decoded = decodeFunctionData({
      abi: iAccountAbi,
      data: call.action.input,
    });
    if (decoded.functionName !== 'validateUserOp') {
      return false;
    }
    return decoded.args[1] === hash;
  });
  if (!validateOpCall) {
    return null;
  }
  const validateOpCallInnerCalls = getInternalCalls(
    transactionTrace,
    validateOpCall,
  );

  // Find the "validatePaymasterUserOp" calls from the entrypoint
  const validatePaymasterOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallPart =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0xf465c77e') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x52b7512c')),
  );
  const validatePaymasterOpCall = validatePaymasterOpCalls.find((call) => {
    const decoded = decodeFunctionData({
      abi: iAccountAbi,
      data: call.action.input,
    });
    if (decoded.functionName !== 'validatePaymasterUserOp') {
      return false;
    }
    return decoded.args[1] === hash;
  });
  const validatePaymasterOpCallInnerCalls = getInternalCalls(
    transactionTrace,
    validatePaymasterOpCall,
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
      ...validateOpCallInnerCalls,
      ...validatePaymasterOpCallInnerCalls,
    ],
    execution: innerHandleOpCallInnerCalls,
  };
}

export { convertDebugTraceToTransactionTrace, getOpTrace, getRevert };
export type { OpTrace };
