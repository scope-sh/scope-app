import { HypersyncClient, type Query } from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import type { Address } from 'viem';

import { type Sort } from './common';

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
  const transactions = [];

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }
    transactions.push(...res.data.transactions);
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
