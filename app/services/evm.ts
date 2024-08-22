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
  result: {
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
  result: {
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

interface TransactionTraceCallPart {
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
    output: Hex;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'call';
}

interface TransactionTraceCreatePart {
  action: {
    from: Address;
    gas: bigint;
    init: Hex;
    value: bigint;
  };
  error: null | 'OOG' | 'Reverted';
  result: {
    gasUsed: bigint;
    address: Address;
    code: Hex;
  };
  subtraces: number;
  traceAddress: number[];
  type: 'create';
}

type TransactionTracePart =
  | TransactionTraceCallPart
  | TransactionTraceCreatePart;

type TransactionTrace = TransactionTracePart[];

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
            result: {
              gasUsed: BigInt(item.result.gasUsed),
              address: item.result.address,
              code: item.result.code,
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
            result: {
              gasUsed: BigInt(item.result.gasUsed),
              output: item.result.output,
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
};
