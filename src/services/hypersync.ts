import { Address, Hex } from 'viem';

import {
  ARBITRUM,
  ARBITRUM_SEPOLIA,
  BASE,
  BASE_SEPOLIA,
  Chain,
  ETHEREUM,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  SEPOLIA,
} from '@/utils/chains';

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
  from_block: number;
  logs?: {
    address?: Address[];
    topics?: Hex[];
  }[];
  transactions?: {
    from?: Address[];
    to?: Address[];
  }[];
  max_num_transactions?: number;
  max_num_logs?: number;
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
  next_block: number;
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
  to: Hex;
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

interface AddressTransactions {
  transactions: Transaction[];
  hasNextPage: boolean;
}

interface AddressLogs {
  logs: Log[];
  hasNextPage: boolean;
}

interface Transaction {
  blockNumber: number;
  blockTimestamp: Hex;
  from: Address;
  gasPrice: Hex;
  hash: Hex;
  input: Hex;
  to: Address | undefined;
  transactionIndex: number;
  value: Hex;
  status: number;
}

interface Log {
  blockNumber: number;
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

  async getAddressTransactions(
    address: Address,
    fromBlock: number,
    limit: number,
  ): Promise<AddressTransactions> {
    const transactions: Transaction[] = [];
    let nextBlock = fromBlock;
    let height: number = Infinity;
    while (transactions.length < limit && nextBlock < height) {
      const response = await this.#getAddressTransactionsPartial(
        address,
        nextBlock,
        limit,
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
              blockTimestamp: timestamp,
              from: transaction.from,
              gasPrice: transaction.gas_price,
              hash: transaction.hash,
              input: transaction.input,
              to: transaction.to,
              transactionIndex: transaction.transaction_index,
              value: transaction.value,
              status: transaction.status,
            };
          });
        })
        .flat();
      transactions.push(...newTransactions);
      nextBlock = response.next_block;
      height = response.archive_height;
    }
    return {
      transactions,
      hasNextPage: nextBlock < height,
    };
  }

  async #getAddressTransactionsPartial(
    address: Address,
    fromBlock: number,
    limit: number,
  ): Promise<QueryResponse> {
    const query: Query = {
      from_block: fromBlock,
      transactions: [
        {
          from: [address],
        },
        {
          to: [address],
        },
      ],
      max_num_transactions: limit,
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
    fromBlock: number,
    limit: number,
  ): Promise<AddressLogs> {
    const logs: Log[] = [];
    let nextBlock = fromBlock;
    let height: number = Infinity;
    while (logs.length < limit && nextBlock < height) {
      const response = await this.#getAddressLogsPartial(
        address,
        nextBlock,
        limit,
      );
      const data = response.data;
      const newLogs = data
        .map((dataPage) => {
          const pageLogs = dataPage.logs || [];
          return pageLogs.map((log) => ({
            blockNumber: log.block_number,
            logIndex: log.log_index,
            transactionHash: log.transaction_hash,
            address: log.address,
            data: log.data,
            topics: [log.topic0, log.topic1, log.topic2, log.topic3].filter(
              (topic): topic is Hex => topic !== null,
            ),
          }));
        })
        .flat();
      logs.push(...newLogs);
      nextBlock = response.next_block;
      height = response.archive_height;
    }
    return {
      logs,
      hasNextPage: nextBlock < height,
    };
  }

  async #getAddressLogsPartial(
    address: Address,
    fromBlock: number,
    limit: number,
  ): Promise<QueryResponse> {
    const query: Query = {
      from_block: fromBlock,
      logs: [
        {
          address: [address],
        },
      ],
      max_num_logs: limit,
      field_selection: {
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

  #getEndpoint(chain: Chain): string {
    switch (chain) {
      case ETHEREUM:
        return 'https://eth.hypersync.xyz/query';
      case SEPOLIA:
        return 'https://sepolia.hypersync.xyz/query';
      case OPTIMISM:
        return 'https://optimism.hypersync.xyz/query';
      case OPTIMISM_SEPOLIA:
        return 'https://optimism-sepolia.hypersync.xyz/query';
      case BASE:
        return 'https://base.hypersync.xyz/query';
      case BASE_SEPOLIA:
        return 'https://base-sepolia.hypersync.xyz/query';
      case POLYGON:
        return 'https://polygon.hypersync.xyz/query';
      case POLYGON_AMOY:
        return 'https://amoy.hypersync.xyz/query';
      case ARBITRUM:
        return 'https://arbitrum.hypersync.xyz/query';
      case ARBITRUM_SEPOLIA:
        return 'https://arbitrum-sepolia.hypersync.xyz/query';
    }
  }
}

export default Service;
export type { Transaction, Log };
