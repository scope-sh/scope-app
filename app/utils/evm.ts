import type {
  DebugTransactionTrace,
  DebugTransactionTraceCall,
  TransactionTrace,
  TransactionTracePart,
  TransactionTraceCallPart,
  TransactionTraceCreatePart,
} from '@/services/evm';

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

// eslint-disable-next-line import/prefer-default-export
export { convertDebugTraceToTransactionTrace };
