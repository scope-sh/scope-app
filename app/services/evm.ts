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

class Service {
  client: PublicClient;

  constructor(client: PublicClient) {
    this.client = client;
  }

  public async getLatestBlock(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  public async getGasPrice(): Promise<bigint> {
    return await this.client.getGasPrice();
  }

  public async getCode(address: Address): Promise<Hex | null> {
    const bytecode = await this.client.getBytecode({
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  }

  public async getBalance(address: Address): Promise<bigint> {
    const balance = await this.client.getBalance({
      address,
    });
    return balance;
  }
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
};
