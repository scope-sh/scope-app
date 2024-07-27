import { HypersyncClient, type Query } from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import { type Address, type Hex } from 'viem';

import { type Sort } from './common';

interface Transaction {
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

export default defineEventHandler(async (event) => {
  const {
    chain,
    address,
    cursor: cursorString,
    limit: limitString,
    sort,
  } = getQuery<{
    chain: string;
    address: Address;
    cursor: string;
    limit: string;
    sort: Sort;
  }>(event);
  const cursor = parseInt(cursorString as string);
  const limit = parseInt(limitString as string);
  const endpointUrl = `https://${chain}.hypersync.xyz`;
  const client = HypersyncClient.new({
    url: endpointUrl,
  });

  const query: Query = {
    fromBlock: sort === 'asc' ? cursor || 0 : 0,
    toBlock: sort === 'desc' ? cursor || undefined : undefined,
    transactions: [
      {
        from: [address],
      },
      {
        to: [address],
      },
    ],
    maxNumTransactions: limit,
    fieldSelection: {
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

  let nextBlock: number | null = null;
  let height: number | null = null;
  const receiver = await client.stream(query, {
    reverse: sort === 'desc',
    maxNumTransactions: limit,
  });
  const transactions: Transaction[] = [];

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }
    const pageBlocks = res.data.blocks;
    const pageTransactions = res.data.transactions.map((tx) => {
      const transactionBlock = pageBlocks.find(
        (block) => block.number === tx.blockNumber,
      );
      const timestamp = transactionBlock?.timestamp || '0x';
      return {
        blockNumber: tx.blockNumber as number,
        blockTimestamp: 1000 * parseInt(timestamp),
        from: tx.from as Address,
        gasPrice: tx.gasPrice || '0x',
        hash: tx.hash as Hex,
        input: tx.input as Hex,
        to: (tx.to as Address | undefined) || null,
        transactionIndex: tx.transactionIndex as number,
        value: tx.value as string,
        status: tx.status as number,
      };
    });
    transactions.push(...pageTransactions);
    nextBlock = res.nextBlock;
    height = res.archiveHeight || null;
    if (transactions.length >= limit) {
      break;
    }
  }

  return {
    transactions,
    pagination: {
      cursor: nextBlock,
      height,
    },
  };
});
