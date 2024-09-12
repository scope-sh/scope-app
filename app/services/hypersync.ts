import ky, { type KyInstance } from 'ky';
import type { Address, Hex } from 'viem';

import type { Chain } from '@/utils/chains.js';

type Sort = 'asc' | 'desc';

interface Pagination {
  cursor: number | null;
  height: number | null;
}

interface AddressTransactionsResponse {
  transactions: TransactionResponse[];
  pagination: Pagination;
}

interface AddressTransactions {
  transactions: Transaction[];
  pagination: Pagination;
}

interface AddressLogs {
  logs: Log[];
  pagination: Pagination;
}

interface TransactionResponse {
  blockNumber: number;
  blockTimestamp: number;
  from: Address;
  gasPrice: string;
  hash: Hex;
  input: Hex;
  to: Address | null;
  transactionIndex: number;
  value: string;
  status: number;
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

interface Erc20Transfer {
  type: 'erc20';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  amount: string;
}

interface Erc721Transfer {
  type: 'erc721';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  id: string;
  amount: string;
}

interface Erc1155Transfer {
  type: 'erc1155';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  ids: string[];
  amounts: string[];
}

type Transfer = Erc20Transfer | Erc721Transfer | Erc1155Transfer;

interface AddressTransfers {
  transfers: Transfer[];
  pagination: Pagination;
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
  client: KyInstance;

  constructor(chain: Chain, appBaseUrl: string) {
    this.chain = chain;
    this.client = ky.create({
      prefixUrl: `${appBaseUrl}/api`,
      timeout: false,
    });
  }

  getSort(): Sort {
    return 'desc';
  }

  async getAddressTransactions(
    address: Address,
    startCursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<AddressTransactions> {
    const response = await this.client.get('transactions', {
      searchParams: {
        chain: this.chain,
        address,
        cursor: startCursor ? startCursor : 0,
        limit,
        sort,
      },
    });
    const transactions = await response.json<AddressTransactionsResponse>();
    return {
      transactions: transactions.transactions.map((transaction) => ({
        ...transaction,
        gasPrice: BigInt(transaction.gasPrice),
        value: BigInt(transaction.value),
      })),
      pagination: transactions.pagination,
    };
  }

  async getAddressLogs(
    address: Address,
    startCursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<AddressLogs> {
    const response = await this.client.get('logs', {
      searchParams: {
        chain: this.chain,
        address,
        cursor: startCursor ? startCursor : 0,
        limit,
        sort,
      },
    });
    return response.json<AddressLogs>();
  }

  async getAddressTransfers(
    address: Address,
    startCursor: number | null,
    limit: number,
    sort: Sort,
  ): Promise<AddressTransfers> {
    const response = await this.client.get('transfers', {
      searchParams: {
        chain: this.chain,
        address,
        cursor: startCursor ? startCursor : 0,
        limit,
        sort,
      },
    });
    return response.json<AddressTransfers>();
  }

  async getOpTxHash(hash: Hex): Promise<Hex> {
    const response = await this.client.get('userop', {
      searchParams: {
        chain: this.chain,
        hash,
      },
    });
    return response.text() as Promise<Hex>;
  }
}

export default Service;
export type { Transaction, Log, Transfer, Pagination, Sort };
