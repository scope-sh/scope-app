import type { Address, Hex } from 'viem';
import { decodeFunctionData, pad, slice, zeroHash } from 'viem';

import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  ENTRY_POINT_0_8_ADDRESS,
} from './erc4337/entryPoint';

import entryPointV0_6_0Abi from '@/abi/entryPointV0_6_0';
import entryPointV0_7_0Abi from '@/abi/entryPointV0_7_0';
import entryPointV0_8_0Abi from '@/abi/entryPointV0_8_0';
import iAccountAbi from '@/abi/iAccount';
import type {
  DebugTransactionTrace,
  DebugTransactionTraceCall,
  DebugTransactionState,
  DebugTransactionStatePart,
  TransactionTrace,
  TransactionTraceFrame,
  TransactionTraceCallFrame,
  TransactionStateDiff,
} from '@/services/evm';

type OpTraceFrame = TransactionTraceFrame & {
  fullTraceAddress: number[];
};

interface OpTrace {
  creation: OpTraceFrame[];
  validation: OpTraceFrame[];
  payment: OpTraceFrame[];
  execution: OpTraceFrame[];
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
  ): OpTraceFrame[] {
    const basePart: Pick<OpTraceFrame, 'error' | 'subtraces' | 'traceAddress'> =
      {
        error: call.error,
        subtraces: call.calls.length,
        traceAddress,
      };

    const result: OpTraceFrame[] = [];

    if (
      call.type === 'CALL' ||
      call.type === 'STATICCALL' ||
      call.type === 'DELEGATECALL'
    ) {
      const callPart: OpTraceFrame = {
        ...basePart,
        fullTraceAddress: traceAddress,
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
      const createPart: OpTraceFrame = {
        ...basePart,
        fullTraceAddress: traceAddress,
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

function convertDebugStateToTransactionStateDiff(
  debugState: DebugTransactionState | null,
): TransactionStateDiff | null {
  if (!debugState) {
    return null;
  }

  const pre = debugState.pre;
  const post = debugState.post ?? ({} as DebugTransactionStatePart);

  const result: TransactionStateDiff = {};

  for (const [addressString, preState] of Object.entries(pre)) {
    const address = addressString as Address;
    const postState = post[address];
    const diff: TransactionStateDiff[Address] = {
      balance: null,
      code: null,
      nonce: null,
      storage: null,
    };

    if (
      postState &&
      postState.balance &&
      preState.balance !== postState.balance
    ) {
      diff.balance = {
        from: preState.balance ?? 0n,
        to: postState?.balance ?? 0n,
      };
    }

    if (postState && postState.code && preState.code !== postState.code) {
      diff.code = {
        from: preState.code ?? '0x',
        to: postState?.code ?? '0x',
      };
    }

    if (postState && postState.nonce && preState.nonce !== postState.nonce) {
      diff.nonce = {
        from: preState.nonce ?? 0n,
        to: postState?.nonce ?? 0n,
      };
    }

    if (preState.storage || postState?.storage) {
      diff.storage = {};
      for (const slotString of new Set([
        ...Object.keys(preState.storage ?? {}),
        ...Object.keys(postState?.storage ?? {}),
      ])) {
        const slot = slotString as Hex;
        if (preState.storage?.[slot] !== postState?.storage?.[slot]) {
          diff.storage[slot] = {
            from: preState.storage?.[slot] ?? zeroHash,
            to: postState?.storage?.[slot] ?? zeroHash,
          };
        }
      }
    }

    if (Object.keys(diff).length > 0) {
      result[address] = diff;
    }
  }

  // Handle new addresses in post-state
  for (const [addressString, postState] of Object.entries(post ?? {})) {
    const address = addressString as Address;
    if (!pre[address]) {
      result[address] = {
        balance: postState.balance ? { from: 0n, to: postState.balance } : null,
        code: postState.code ? { from: '0x', to: postState.code } : null,
        nonce: postState.nonce ? { from: 0n, to: postState.nonce } : null,
        storage: postState.storage
          ? Object.fromEntries(
              Object.entries(postState.storage).map(([key, value]) => [
                key,
                { from: zeroHash, to: value },
              ]),
            )
          : null,
      };
    }
  }

  return result;
}

function getChildren(
  trace: TransactionTraceFrame[],
  parent: TransactionTraceFrame,
): TransactionTraceFrame[] {
  return trace.filter((part) => {
    return (
      part.traceAddress.length > parent.traceAddress.length &&
      startsWith(part.traceAddress, parent.traceAddress)
    );
  });
}

function getDirectChildren(
  trace: TransactionTraceFrame[],
  parent: TransactionTraceFrame,
): TransactionTraceFrame[] {
  return trace.filter((part) => {
    return (
      part.traceAddress.length === parent.traceAddress.length + 1 &&
      startsWith(part.traceAddress, parent.traceAddress)
    );
  });
}

// Finds the trace part that bubbles up the error
// There should be a clear path from the top level to the error
// Returns the lowest level error in the path or null if no error is found
function getRevert(
  transactionTrace: TransactionTraceFrame[],
  root: TransactionTraceFrame,
): TransactionTraceFrame | null {
  function getDirectChildRevert(
    parent: TransactionTraceFrame,
  ): TransactionTraceFrame | null {
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
  // Use recursion to find the error
  return getDirectChildRevert(root);
}

function getOpTrace(
  transactionTrace: TransactionTraceFrame[],
  hash: Hex,
  sender: Address,
): OpTrace | null {
  function getSubtrace(
    trace: TransactionTraceFrame[],
    root: TransactionTraceFrame | undefined,
  ): OpTraceFrame[] {
    if (!root) {
      return [];
    }
    const children = getChildren(trace, root);
    // Update trace addresses
    return [root, ...children].map((part) => {
      return {
        ...part,
        traceAddress: part.traceAddress.slice(root.traceAddress.length),
        fullTraceAddress: part.traceAddress,
      };
    });
  }

  // Get creation traces
  // Find the "createSender" calls from the entrypoint
  const createSenderCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallFrame =>
      part.type === 'call' &&
      (part.action.from === ENTRY_POINT_0_6_ADDRESS ||
        part.action.from === ENTRY_POINT_0_7_ADDRESS ||
        part.action.from === ENTRY_POINT_0_8_ADDRESS) &&
      slice(part.action.input, 0, 4) === '0x570e1a36',
  );
  const createSenderCall = createSenderCalls.find(
    (item) => item.result.output === pad(sender.toLowerCase() as Address),
  );
  const createSenderCallInnerCalls = getSubtrace(
    transactionTrace,
    createSenderCall,
  );

  // Get validation traces
  // Find the "validateUserOp" calls from the entrypoint
  const validateOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallFrame =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0x3a871cdd') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x19822f7c') ||
        (part.action.from === ENTRY_POINT_0_8_ADDRESS &&
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
  const validateOpCallInnerCalls = getSubtrace(
    transactionTrace,
    validateOpCall,
  );
  // Get payment traces
  // Find the "validatePaymasterUserOp" calls from the entrypoint
  const validatePaymasterOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallFrame =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0xf465c77e') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x52b7512c') ||
        (part.action.from === ENTRY_POINT_0_8_ADDRESS &&
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
  const validatePaymasterOpCallInnerCalls = getSubtrace(
    transactionTrace,
    validatePaymasterOpCall,
  );

  // Get execution traces
  // Find the "innerHandleOp" calls from the entrypoint to the entrypoint
  const innerHandleOpCalls = transactionTrace.filter(
    (part): part is TransactionTraceCallFrame =>
      part.type === 'call' &&
      ((part.action.from === ENTRY_POINT_0_6_ADDRESS &&
        part.action.to === ENTRY_POINT_0_6_ADDRESS &&
        slice(part.action.input, 0, 4) === '0x1d732756') ||
        (part.action.from === ENTRY_POINT_0_7_ADDRESS &&
          part.action.to === ENTRY_POINT_0_7_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x0042dc53') ||
        (part.action.from === ENTRY_POINT_0_8_ADDRESS &&
          part.action.to === ENTRY_POINT_0_8_ADDRESS &&
          slice(part.action.input, 0, 4) === '0x0042dc53')),
  );
  const innerHandleOpCall = innerHandleOpCalls.find((call) => {
    const decoded =
      call.action.from === ENTRY_POINT_0_6_ADDRESS
        ? decodeFunctionData({
            abi: entryPointV0_6_0Abi,
            data: call.action.input,
          })
        : call.action.from === ENTRY_POINT_0_7_ADDRESS
          ? decodeFunctionData({
              abi: entryPointV0_7_0Abi,
              data: call.action.input,
            })
          : decodeFunctionData({
              abi: entryPointV0_8_0Abi,
              data: call.action.input,
            });
    if (decoded.functionName !== 'innerHandleOp') {
      return false;
    }
    return decoded.args[1].userOpHash === hash;
  });
  const innerHandleOpCallInnerCalls = getSubtrace(
    transactionTrace,
    innerHandleOpCall,
  );

  return {
    creation: createSenderCallInnerCalls,
    validation: validateOpCallInnerCalls,
    payment: validatePaymasterOpCallInnerCalls,
    execution: innerHandleOpCallInnerCalls,
  };
}

export {
  convertDebugTraceToTransactionTrace,
  convertDebugStateToTransactionStateDiff,
  getOpTrace,
  getRevert,
  getDirectChildren,
  getChildren,
};
export type { OpTrace, OpTraceFrame };
