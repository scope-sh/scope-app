import {
  BlockField,
  HypersyncClient,
  TransactionField,
  type Query,
} from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import type { Address, Hex } from 'viem';

import type { Sort } from './common';

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

const envioHypersyncApiKey = process.env.ENVIO_HYPERSYNC_API_KEY || '';

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
    bearerToken: envioHypersyncApiKey,
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
      block: [BlockField.Number, BlockField.Timestamp],
      transaction: [
        TransactionField.BlockNumber,
        TransactionField.TransactionIndex,
        TransactionField.Hash,
        TransactionField.From,
        TransactionField.To,
        TransactionField.Input,
        TransactionField.Value,
        TransactionField.GasPrice,
        TransactionField.Status,
      ],
    },
  };

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
      const timestamp = transactionBlock?.timestamp || 0;
      return {
        blockNumber: tx.blockNumber as number,
        blockTimestamp: 1000 * timestamp,
        from: tx.from as Address,
        gasPrice: tx.gasPrice?.toString() as string,
        hash: tx.hash as Hex,
        input: tx.input as Hex,
        to: (tx.to as Address | undefined) || null,
        transactionIndex: tx.transactionIndex as number,
        value: tx.value?.toString() as string,
        status: tx.status as number,
      };
    });
    transactions.push(...pageTransactions);
    height = res.archiveHeight || null;
    if (transactions.length >= limit) {
      break;
    }
  }
  const lastTransaction = transactions.at(-1);
  const prevBlock =
    transactions.length >= limit && lastTransaction
      ? lastTransaction.blockNumber - 1
      : -1;

  return {
    transactions,
    pagination: {
      cursor: prevBlock,
      height,
    },
  };
});
