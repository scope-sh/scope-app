import { Address, Hex } from 'viem';

import { Chain } from '@/utils/chains';

type Sort = 'asc' | 'desc';

type BlockFieldSelection = 'number' | 'timestamp';
type TransactionFieldSelection =
  | 'block_number'
  | 'transaction_index'
  | 'hash'
  | 'from'
  | 'to'
  | 'input'
  | 'value'
  | 'gas_price'
  | 'status';
type LogFieldSelection =
  | 'log_index'
  | 'transaction_hash'
  | 'block_number'
  | 'address'
  | 'data'
  | 'topic0'
  | 'topic1'
  | 'topic2'
  | 'topic3';

interface Query {
  from_block?: number;
  to_block?: number;
  logs?: {
    address?: Address[];
    topics?: Hex[][];
  }[];
  transactions?: {
    from?: Address[];
    to?: Address[];
  }[];
  max_num_transactions?: number;
  max_num_logs?: number;
  sort?: Sort;
  field_selection: {
    block?: BlockFieldSelection[];
    transaction?: TransactionFieldSelection[];
    log?: LogFieldSelection[];
  };
}

interface QueryResponse {
  data: {
    blocks?: QueryBlock[];
    transactions?: QueryTransaction[];
    logs?: QueryLog[];
  }[];
  next_block?: number;
  prev_block?: number;
  archive_height: number;
}

interface QueryBlock {
  number: number;
  timestamp: Hex;
}

interface QueryTransaction {
  block_number: number;
  from: Address;
  gas_price: Hex;
  hash: Hex;
  input: Hex;
  to: Hex | null;
  transaction_index: number;
  value: Hex;
  status: 1;
}

interface QueryLog {
  log_index: number;
  transaction_hash: Hex;
  block_number: number;
  address: Address;
  data: Hex;
  topic0: Hex;
  topic1: Hex;
  topic2: Hex;
  topic3: null;
}

interface Pagination {
  cursor: number | null;
  height: number | null;
}

interface AddressTransactions {
  transactions: Transaction[];
  pagination: Pagination;
}

interface AddressLogs {
  logs: Log[];
  pagination: Pagination;
}

interface Transaction {
  blockNumber: number;
  blockTimestamp: number;
  from: Address;
  gasPrice: bigint;
  hash: Hex;
  input: Hex;
  to: Address | null;
  transactionIndex: number;
  value: bigint;
  status: number;
}

interface Log {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  logIndex: number;
  address: Address;
  topics: Hex[];
  data: Hex;
}

class Service {
  chain: Chain;
  endpointUrl: string;

  constructor(chain: Chain) {
    this.chain = chain;
    this.endpointUrl = this.#getEndpoint(chain);
  }

  getSort(): Sort {
    return 'asc';
  }

  async getAddressTransactions(
    address: Address,
    startCursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<AddressTransactions> {
    const transactions: Transaction[] = [];
    let cursor = startCursor;
    let height: number = Infinity;
    while (
      transactions.length < limit &&
      this.#withInBounds(sort, height, cursor)
    ) {
      const response = await this.#getAddressTransactionsPartial(
        address,
        cursor,
        limit,
        sort,
      );
      const data = response.data;
      const newTransactions = data
        .map((dataPage) => {
          const pageTransactions = dataPage.transactions || [];
          return pageTransactions.map((transaction) => {
            const transactionBlock = dataPage.blocks?.find(
              (block) => block.number === transaction.block_number,
            );
            const timestamp = transactionBlock?.timestamp || '0x';
            return {
              blockNumber: transaction.block_number,
              blockTimestamp: 1000 * parseInt(timestamp),
              from: transaction.from,
              gasPrice: BigInt(transaction.gas_price),
              hash: transaction.hash,
              input: transaction.input,
              to: transaction.to,
              transactionIndex: transaction.transaction_index,
              value: BigInt(transaction.value),
              status: transaction.status,
            };
          });
        })
        .flat();
      transactions.push(...newTransactions);
      cursor =
        sort === 'asc'
          ? response.next_block || Infinity
          : response.prev_block || 0;
      height = response.archive_height;
    }
    return {
      transactions,
      pagination: {
        cursor,
        height,
      },
    };
  }

  async #getAddressTransactionsPartial(
    address: Address,
    cursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<QueryResponse> {
    const query: Query = {
      from_block: sort === 'asc' ? cursor || 0 : undefined,
      to_block: sort === 'desc' ? cursor || undefined : undefined,
      transactions: [
        {
          from: [address],
        },
        {
          to: [address],
        },
      ],
      max_num_transactions: limit,
      sort,
      field_selection: {
        block: ['number', 'timestamp'],
        transaction: [
          'block_number',
          'transaction_index',
          'hash',
          'from',
          'to',
          'input',
          'value',
          'gas_price',
          'status',
        ],
      },
    };

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
    const json = (await response.json()) as QueryResponse;
    return json;
  }

  async getAddressLogs(
    address: Address,
    startCursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<AddressLogs> {
    const logs: Log[] = [];
    let cursor = startCursor;
    let height: number = Infinity;
    while (logs.length < limit && this.#withInBounds(sort, height, cursor)) {
      const response = await this.#getAddressLogsPartial(
        address,
        cursor,
        limit,
        sort,
      );
      const data = response.data;
      const newLogs = data
        .map((dataPage) => {
          const pageLogs = dataPage.logs || [];
          return pageLogs.map((log) => {
            const logBlock = dataPage.blocks?.find(
              (block) => block.number === log.block_number,
            );
            const timestamp = logBlock?.timestamp || '0x';
            return {
              blockNumber: log.block_number,
              blockTimestamp: 1000 * parseInt(timestamp),
              logIndex: log.log_index,
              transactionHash: log.transaction_hash,
              address: log.address,
              data: log.data,
              topics: [log.topic0, log.topic1, log.topic2, log.topic3].filter(
                (topic): topic is Hex => topic !== null,
              ),
            };
          });
        })
        .flat();
      logs.push(...newLogs);
      cursor =
        sort === 'asc'
          ? response.next_block || Infinity
          : response.prev_block || 0;
      height = response.archive_height;
    }
    return {
      logs,
      pagination: {
        cursor,
        height,
      },
    };
  }

  async #getAddressLogsPartial(
    address: Address,
    cursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<QueryResponse> {
    const query: Query = {
      from_block: sort === 'asc' ? cursor || 0 : undefined,
      to_block: sort === 'desc' ? cursor || undefined : undefined,
      logs: [
        {
          address: [address],
        },
      ],
      max_num_logs: limit,
      sort,
      field_selection: {
        block: ['number', 'timestamp'],
        log: [
          'log_index',
          'transaction_hash',
          'block_number',
          'address',
          'data',
          'topic0',
          'topic1',
          'topic2',
          'topic3',
        ],
      },
    };

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });
    const json = (await response.json()) as QueryResponse;
    return json;
  }

  #withInBounds(sort: Sort, height: number, cursor: number | null): boolean {
    if (cursor === null) {
      return true;
    }
    if (sort === 'asc') {
      return cursor < height;
    } else {
      return cursor > 0;
    }
  }

  #getEndpoint(chain: Chain): string {
    return `https://${chain}.hypersync.xyz/query`;
  }
}

export default Service;
export type { Transaction, Log, Pagination, Sort };
