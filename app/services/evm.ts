import {
  zeroHash,
  toHex,
  type Address,
  type Hex,
  type Log,
  type PublicClient,
  type Transaction,
  type TransactionReceipt,
  type BlockTag,
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

type TransactionTraceResponseStateDiffItem =
  | '='
  | Record<'+', Hex>
  | Record<'-', Hex>
  | Record<'*', { from: Hex; to: Hex }>;

type TransactionTraceResponseStateDiff = Record<
  Address,
  {
    balance: TransactionTraceResponseStateDiffItem;
    code: TransactionTraceResponseStateDiffItem;
    nonce: TransactionTraceResponseStateDiffItem;
    storage: Record<Hex, TransactionTraceResponseStateDiffItem>;
  }
>;

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
  stateDiff: TransactionTraceResponseStateDiff;
  trace: TransactionTraceResponseTrace[];
  vmTrace: null;
  transactionHash: Hex;
}

interface TransactionTraceBaseFrame {
  error: null | 'OOG' | 'Reverted';
  subtraces: number;
  traceAddress: number[];
}

interface TransactionTraceCallFrame extends TransactionTraceBaseFrame {
  action: {
    from: Address;
    callType: 'call' | 'delegatecall' | 'staticcall';
    gas: bigint;
    input: Hex;
    to: Address;
    value: bigint;
  };
  result: {
    gasUsed: bigint;
    output: Hex | null;
  };
  type: 'call';
}

interface TransactionTraceCreateFrame extends TransactionTraceBaseFrame {
  action: {
    from: Address;
    gas: bigint;
    init: Hex;
    value: bigint;
  };
  result: {
    gasUsed: bigint;
    address: Address | null;
    code: Hex | null;
  };
  type: 'create';
}

type TransactionTraceFrame =
  | TransactionTraceCallFrame
  | TransactionTraceCreateFrame;

type TransactionTrace = TransactionTraceFrame[];

interface TransactionStateDiffAddress {
  balance: {
    from: bigint;
    to: bigint;
  } | null;
  code: {
    from: Hex;
    to: Hex;
  } | null;
  nonce: {
    from: bigint;
    to: bigint;
  } | null;
  storage: Record<
    Hex,
    {
      from: Hex;
      to: Hex;
    }
  > | null;
}
type TransactionStateDiff = Record<Address, TransactionStateDiffAddress>;

interface TransactionReplay {
  trace: TransactionTrace;
  stateDiff: TransactionStateDiff;
}

type DebugTransactionTracer = 'callTracer' | 'prestateTracer';

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

type DebugTransactionStateResponsePart = Record<
  Address,
  {
    balance?: Hex;
    code?: Hex;
    nonce?: number;
    storage?: Record<Hex, Hex>;
  }
>;

interface DebugTransactionStateResponse {
  pre: DebugTransactionStateResponsePart;
  post?: DebugTransactionStateResponsePart;
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

type DebugTransactionStatePart = Record<
  Address,
  {
    balance?: bigint;
    code?: Hex;
    nonce?: bigint;
    storage?: Record<Hex, Hex>;
  }
>;

interface DebugTransactionState {
  pre: DebugTransactionStatePart;
  post?: DebugTransactionStatePart;
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

  public async getCode(
    address: Address,
    blockNumber?: bigint,
  ): Promise<Hex | null> {
    const bytecode = await this.client.getCode({
      address: address as Address,
      blockNumber,
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

  public async getCallLogs(call: {
    from: Address;
    to: Address;
    value: bigint;
    data: Hex;
    blockNumber?: number;
  }): Promise<Log[] | null> {
    try {
      const response = await this.client.simulateCalls({
        blockNumber: call.blockNumber ? BigInt(call.blockNumber) : undefined,
        account: call.from,
        calls: [
          {
            to: call.to,
            data: call.data,
            value: call.value,
          },
        ],
      });
      const logs = response.results[0].logs || [];
      return logs.map((log, index) => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        blockHash: null,
        blockNumber: null,
        logIndex: index,
        transactionHash: null,
        transactionIndex: null,
        removed: false,
      }));
    } catch {
      return null;
    }
  }

  public async getCallReplay(
    call: {
      from: Address;
      to: Address;
      value: bigint;
      data: Hex;
      gas?: bigint;
      gasPrice?: bigint;
    },
    blockNumber?: Hex | BlockTag,
  ): Promise<TransactionReplay | null> {
    try {
      const traceResponse = await this.client.traceCall(
        {
          from: call.from,
          to: call.to,
          value: toHex(call.value),
          data: call.data,
          gas: call.gas ? toHex(call.gas) : undefined,
          gasPrice: call.gasPrice ? toHex(call.gasPrice) : undefined,
        },
        ['trace', 'stateDiff'],
        blockNumber,
      );
      return traceResponseToReplay(traceResponse);
    } catch {
      return null;
    }
  }

  public async getTransactionReplay(
    hash: Hex,
  ): Promise<TransactionReplay | null> {
    try {
      const traceResponse = await this.client.traceReplayTransaction(hash, [
        'trace',
        'stateDiff',
      ]);
      return traceResponseToReplay(traceResponse);
    } catch {
      return null;
    }
  }

  public async getDebugCallTrace(
    call: {
      from: Address;
      to: Address;
      gas?: Hex;
      gasPrice?: Hex;
      value?: Hex;
      data?: Hex;
    },
    block: BlockTag | Hex,
  ): Promise<DebugTransactionTrace | null> {
    try {
      const traceResponse = await this.client.debugTraceCall(
        call,
        block,
        'callTracer',
        undefined,
      );
      return debugTraceResponseToTransactionTrace(traceResponse);
    } catch {
      return null;
    }
  }

  public async getDebugCallState(
    call: {
      from: Address;
      to: Address;
      gas?: Hex;
      gasPrice?: Hex;
      value?: Hex;
      data?: Hex;
    },
    block: BlockTag | Hex,
  ): Promise<DebugTransactionState | null> {
    try {
      const traceResponse = await this.client.debugTraceCall(
        call,
        block,
        'prestateTracer',
        {
          diffMode: true,
        },
      );
      return {
        pre: formatDebugTransactionStatePart(traceResponse.pre),
        post: traceResponse.post
          ? formatDebugTransactionStatePart(traceResponse.post)
          : undefined,
      };
    } catch {
      return null;
    }
  }

  public async getDebugTransactionTrace(
    hash: Hex,
  ): Promise<DebugTransactionTrace | null> {
    try {
      const traceResponse = await this.client.debugTraceTransaction(
        hash,
        'callTracer',
        undefined,
      );
      return debugTraceResponseToTransactionTrace(traceResponse);
    } catch {
      return null;
    }
  }

  public async getDebugTransactionState(
    hash: Hex,
  ): Promise<DebugTransactionState | null> {
    try {
      const traceResponse = await this.client.debugTraceTransaction(
        hash,
        'prestateTracer',
        {
          diffMode: true,
        },
      );
      return {
        pre: formatDebugTransactionStatePart(traceResponse.pre),
        post: traceResponse.post
          ? formatDebugTransactionStatePart(traceResponse.post)
          : undefined,
      };
    } catch {
      return null;
    }
  }
}

function traceResponseToReplay(
  traceResponse: TransactionTraceResponse,
): TransactionReplay {
  function parseStateDiffItem<T>(
    item: TransactionTraceResponseStateDiffItem,
    zeroValue: T,
    parse: (value: Hex) => T,
  ): {
    from: T;
    to: T;
  } | null {
    if (item === '=') {
      return null;
    } else if ('+' in item) {
      if (parse(item['+']) === zeroValue) {
        return null;
      }
      return {
        from: zeroValue,
        to: parse(item['+']),
      };
    } else if ('-' in item) {
      return {
        from: parse(item['-']),
        to: zeroValue,
      };
    } else {
      return {
        from: parse(item['*'].from),
        to: parse(item['*'].to),
      };
    }
  }

  const trace = traceResponse.trace.map((item) => {
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
      } as TransactionTraceCreateFrame;
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
      } as TransactionTraceCallFrame;
    }
  });
  const stateDiff = Object.fromEntries(
    Object.entries(traceResponse.stateDiff).map(([address, diff]) => {
      return [
        address,
        {
          balance: parseStateDiffItem(diff.balance, 0n, BigInt),
          code: parseStateDiffItem(diff.code, '0x', (value) => value),
          nonce: parseStateDiffItem(diff.nonce, 0n, BigInt),
          storage: Object.fromEntries(
            Object.entries(diff.storage)
              .map(([slot, value]) => {
                return [
                  slot,
                  parseStateDiffItem(value, zeroHash, (value) => value),
                ];
              })
              .filter(([, value]) => value !== null),
          ),
        },
      ];
    }),
  );
  return {
    trace,
    stateDiff,
  };
}

function debugTraceResponseToTransactionTrace(
  traceResponse: DebugTransactionTraceResponse,
): DebugTransactionTrace {
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
  return {
    afterEVMTransfers: traceResponse.afterEVMTransfers.map((transfer) => ({
      from: transfer.from,
      purpose: transfer.purpose,
      to: transfer.to,
      value: BigInt(transfer.value),
    })),
    beforeEVMTransfers: traceResponse.beforeEVMTransfers.map((transfer) => ({
      from: transfer.from,
      purpose: transfer.purpose,
      to: transfer.to,
      value: BigInt(transfer.value),
    })),
    ...parseCall({
      from: traceResponse.from,
      gas: traceResponse.gas,
      gasUsed: traceResponse.gasUsed,
      input: traceResponse.input,
      output: traceResponse.output,
      error: traceResponse.error,
      to: traceResponse.to,
      type: traceResponse.type,
      value: traceResponse.value,
      calls: traceResponse.calls,
    }),
  };
}

function formatDebugTransactionStatePart(
  part: DebugTransactionStateResponsePart,
): DebugTransactionStatePart {
  return Object.fromEntries(
    Object.entries(part).map(([address, data]) => [
      address,
      {
        balance: data.balance ? BigInt(data.balance) : undefined,
        code: data.code,
        nonce: data.nonce ? BigInt(data.nonce) : undefined,
        storage: data.storage
          ? Object.fromEntries(
              Object.entries(data.storage).map(([slot, value]) => [
                slot,
                value,
              ]),
            )
          : undefined,
      },
    ]),
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getClient(client: PublicClient) {
  return client.extend((client) => ({
    async traceCall(
      call: {
        from?: Address;
        to: Address;
        gas?: Hex;
        gasPrice?: Hex;
        value?: Hex;
        data?: Hex;
        maxFeePerGas?: Hex;
        maxPriorityFeePerGas?: Hex;
      },
      type: ('trace' | 'stateDiff' | 'vmTrace')[],
      block?: Hex | BlockTag,
    ): Promise<TransactionTraceResponse> {
      return await client.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: 'trace_call',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        params: [call, type, block],
      });
    },
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
    async debugTraceCall<T extends DebugTransactionTracer>(
      call: {
        from: Address;
        to: Address;
        gas?: Hex;
        gasPrice?: Hex;
        value?: Hex;
        data?: Hex;
      },
      block: BlockTag | Hex,
      tracer: T,
      tracerConfig: T extends 'callTracer'
        ? undefined
        : {
            diffMode: boolean;
          },
    ): Promise<
      T extends 'callTracer'
        ? DebugTransactionTraceResponse
        : DebugTransactionStateResponse
    > {
      return await client.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: 'debug_traceCall',
        params: [
          call,
          block,
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tracer,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tracerConfig,
          },
        ],
      });
    },
    async debugTraceTransaction<T extends DebugTransactionTracer>(
      hash: Hex,
      tracer: T,
      tracerConfig: T extends 'callTracer'
        ? undefined
        : {
            diffMode: boolean;
          },
    ): Promise<
      T extends 'callTracer'
        ? DebugTransactionTraceResponse
        : DebugTransactionStateResponse
    > {
      return await client.request({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        method: 'debug_traceTransaction',
        params: [
          hash,
          {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tracer,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tracerConfig,
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
  TransactionReplay,
  TransactionTrace,
  TransactionTraceFrame,
  TransactionTraceCallFrame,
  TransactionTraceCreateFrame,
  TransactionStateDiff,
  TransactionStateDiffAddress,
  DebugTransactionTrace,
  DebugTransactionTraceCall,
  DebugTransactionStatePart,
  DebugTransactionState,
};
