import type {
  Address,
  Hex,
  Log,
  PublicClient,
  Transaction,
  TransactionReceipt,
} from 'viem';

type BlockStatus = 'executed';
type TransactionStatus = 'success' | 'reverted';

interface BaseBlock {
  number: number;
  timestamp: Date;
  producer: Address;
  gasLimit: bigint;
  gasUsed: bigint;
}

interface Block extends BaseBlock {
  transactions: number;
}

interface BlockWithTransactions extends BaseBlock {
  transactions: Transaction[];
}

interface TransactionTraceResponseCallTrace {
  action: {
    from: Address;
    callType: 'call' | 'delegatecall' | 'staticcall';
    gas: Hex;
    input: Hex;
    to: Address;
    value: Hex;
  };
  error?: 'out of gas' | 'Reverted';
  result: null | {
    gasUsed: Hex;
    output: Hex;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'call';
}

interface TransactionTraceResponseCreateTrace {
  action: {
    from: Address;
    gas: Hex;
    init: Hex;
    value: Hex;
  };
  error?: 'out of gas' | 'Reverted';
  result: null | {
    address: Address;
    code: Hex;
    gasUsed: Hex;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'create';
}

type TransactionTraceResponseTrace =
  | TransactionTraceResponseCallTrace
  | TransactionTraceResponseCreateTrace;

interface TransactionTraceResponse {
  output: Hex;
  stateDiff: null;
  trace: TransactionTraceResponseTrace[];
  vmTrace: null;
  transactionHash: Hex;
}

interface TransactionTraceCallFrame {
  action: {
    from: Address;
    callType: 'call' | 'delegatecall' | 'staticcall';
    gas: bigint;
    input: Hex;
    to: Address;
    value: bigint;
  };
  error: null | 'OOG' | 'Reverted';
  result: {
    gasUsed: bigint;
    output: Hex | null;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'call';
}

interface TransactionTraceCreateFrame {
  action: {
    from: Address;
    gas: bigint;
    init: Hex;
    value: bigint;
  };
  error: null | 'OOG' | 'Reverted';
  result: {
    gasUsed: bigint;
    address: Address | null;
    code: Hex | null;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'create';
}

type TransactionTraceFrame =
  | TransactionTraceCallFrame
  | TransactionTraceCreateFrame;

type TransactionTrace = TransactionTraceFrame[];

interface DebugTransactionTraceResponseCall {
  from: Address;
  gas: Hex;
  gasUsed: Hex;
  input: Hex;
  output?: Hex;
  to: Address;
  value?: Hex;
  type: 'CALL' | 'STATICCALL' | 'DELEGATECALL' | 'CREATE' | 'CREATE2';
  calls?: DebugTransactionTraceResponseCall[];
  error?: 'execution reverted' | 'out of gas';
}

interface DebugTransactionTraceResponse
  extends DebugTransactionTraceResponseCall {
  afterEVMTransfers: {
    from: null;
    purpose: 'gasRefund' | 'feeCollection';
    to: Address;
    value: Hex;
  }[];
  beforeEVMTransfers: {
    from: Address;
    purpose: 'feePayment';
    to: null;
    value: Hex;
  }[];
}

interface DebugTransactionTraceCall {
  from: Address;
  gas: bigint;
  gasUsed: bigint;
  input: Hex;
  output: Hex;
  to: Address;
  type: 'CALL' | 'STATICCALL' | 'DELEGATECALL' | 'CREATE' | 'CREATE2';
  value: bigint;
  calls: DebugTransactionTraceCall[];
  error: null | 'Reverted' | 'OOG';
}

interface DebugTransactionTrace extends DebugTransactionTraceCall {
  afterEVMTransfers: {
    from: null;
    purpose: 'gasRefund' | 'feeCollection';
    to: Address;
    value: bigint;
  }[];
  beforeEVMTransfers: {
    from: Address;
    purpose: 'feePayment';
    to: null;
    value: bigint;
  }[];
}

class Service {
  client: ReturnType<typeof getClient>;

  constructor(client: PublicClient) {
    this.client = getClient(client);
  }

  public async getLatestBlock(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  public async getGasPrice(): Promise<bigint> {
    return await this.client.getGasPrice();
  }

  public async getCode(address: Address): Promise<Hex | null> {
    const bytecode = await this.client.getCode({
      address: address as Address,
    });
    return bytecode || null;
  }

  public async getBlock(number: bigint): Promise<Block | null> {
    const block = await this.client.getBlock({ blockNumber: number });
    if (!block) return null;
    const { timestamp, transactions, miner, gasLimit, gasUsed } = block;
    return {
      number: Number(number),
      timestamp: new Date(parseInt(timestamp.toString()) * 1000),
      transactions: transactions.length,
      producer: miner,
      gasLimit,
      gasUsed,
    };
  }

  public async getBlockWithTransactions(
    number: bigint,
  ): Promise<BlockWithTransactions | null> {
    const block = await this.client.getBlock({
      blockNumber: number,
      includeTransactions: true,
    });
    if (!block) {
      return null;
    }
    const { timestamp, miner, gasLimit, gasUsed } = block;
    return {
      number: Number(number),
      timestamp: new Date(parseInt(timestamp.toString()) * 1000),
      transactions: block.transactions,
      producer: miner,
      gasLimit,
      gasUsed,
    };
  }

  public async getTransaction(hash: Hex): Promise<Transaction | null> {
    try {
      const transaction = await this.client.getTransaction({
        hash,
      });
      return transaction || null;
    } catch {
      return null;
    }
  }

  public async getBlockTransaction(
    block: number,
    index: number,
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.client.getTransaction({
        blockNumber: BigInt(block),
        index,
      });
      return transaction;
    } catch {
      return null;
    }
  }

  public async getTransactionReceipt(
    hash: Hex,
  ): Promise<TransactionReceipt | null> {
    try {
      const receipt = await this.client.getTransactionReceipt({
        hash,
      });
      return receipt || null;
    } catch {
      return null;
    }
  }

  public async getBalance(address: Address): Promise<bigint> {
    const balance = await this.client.getBalance({
      address,
    });
    return balance;
  }

  public async getTransactionTrace(
    hash: Hex,
  ): Promise<TransactionTrace | null> {
    try {
      const traceResponse = await this.client.traceReplayTransaction(hash, [
        'trace',
      ]);
      return traceResponse.trace.map((item) => {
        const error =
          item.error === undefined
            ? null
            : item.error === 'Reverted'
              ? 'Reverted'
              : 'OOG';
        const subtraces = item.subtraces;
        const traceAddress = item.traceAddress;
        if (item.type === 'create') {
          return {
            action: {
              from: item.action.from,
              gas: BigInt(item.action.gas),
              init: item.action.init,
              value: BigInt(item.action.value),
            },
            error,
            result:
              item.result !== null
                ? {
                    gasUsed: BigInt(item.result.gasUsed),
                    address: item.result.address,
                    code: item.result.code,
                  }
                : {
                    gasUsed: BigInt(item.action.gas),
                    address: null,
                    code: null,
                  },
            subtraces,
            traceAddress,
            type: item.type,
          };
        } else {
          return {
            action: {
              from: item.action.from,
              callType: item.action.callType,
              gas: BigInt(item.action.gas),
              input: item.action.input,
              to: item.action.to,
              value: BigInt(item.action.value),
            },
            error,
            result:
              item.result !== null
                ? {
                    gasUsed: BigInt(item.result.gasUsed),
                    output: item.result.output,
                  }
                : {
                    gasUsed: BigInt(item.action.gas),
                    output: null,
                  },
            subtraces,
            traceAddress,
            type: item.type,
          };
        }
      });
    } catch {
      return null;
    }
  }

  public async getDebugTransactionTrace(
    hash: Hex,
  ): Promise<DebugTransactionTrace | null> {
    function parseCall(
      call: DebugTransactionTraceResponseCall,
    ): DebugTransactionTraceCall {
      return {
        calls: (call.calls || []).map(parseCall),
        from: call.from,
        gas: BigInt(call.gas),
        gasUsed: BigInt(call.gasUsed),
        input: call.input,
        output: call.output || '0x',
        to: call.to,
        type: call.type,
        value: BigInt(call.value || '0'),
        error:
          call.error === 'execution reverted'
            ? 'Reverted'
            : call.error === 'out of gas'
              ? 'OOG'
              : null,
      };
    }

    try {
      const traceResponse = await this.client.debugTraceTransaction(
        hash,
        'callTracer',
      );
      return {
        afterEVMTransfers: traceResponse.afterEVMTransfers.map((transfer) => ({
          from: transfer.from,
          purpose: transfer.purpose,
          to: transfer.to,
          value: BigInt(transfer.value),
        })),
        beforeEVMTransfers: traceResponse.beforeEVMTransfers.map(
          (transfer) => ({
            from: transfer.from,
            purpose: transfer.purpose,
            to: transfer.to,
            value: BigInt(transfer.value),
          }),
        ),
        ...parseCall({
          from: traceResponse.from,
          gas: traceResponse.gas,
          gasUsed: traceResponse.gasUsed,
          input: traceResponse.input,
          output: traceResponse.output,
          to: traceResponse.to,
          type: traceResponse.type,
          value: traceResponse.value,
          calls: traceResponse.calls,
        }),
      };
    } catch {
      return null;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getClient(client: PublicClient) {
  return client.extend((client) => ({
    async traceReplayTransaction(
      hash: Hex,
      type: ('trace' | 'stateDiff' | 'vmTrace')[],
    ): Promise<TransactionTraceResponse> {
      return await client.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: 'trace_replayTransaction',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        params: [hash, type],
      });
    },
    async debugTraceTransaction(
      hash: Hex,
      tracer: 'callTracer' | 'prestateTracer',
    ): Promise<DebugTransactionTraceResponse> {
      return await client.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: 'debug_traceTransaction',
        params: [
          hash,
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tracer: tracer,
          },
        ],
      });
    },
  }));
}

export default Service;
export type {
  Block,
  BlockStatus,
  BlockWithTransactions,
  Log,
  Transaction,
  TransactionReceipt,
  TransactionStatus,
  TransactionTrace,
  TransactionTraceFrame,
  TransactionTraceCallFrame,
  TransactionTraceCreateFrame,
  DebugTransactionTrace,
  DebugTransactionTraceCall,
};
