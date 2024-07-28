import { HypersyncClient, type Query } from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import type { Address, Hex } from 'viem';

import { type Sort } from './common';

interface Log {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  logIndex: number;
  address: Address;
  topics: Hex[];
  data: Hex;
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
    logs: [
      {
        address: [address],
      },
    ],
    maxNumLogs: limit,
    fieldSelection: {
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

  let height: number | null = null;
  const receiver = await client.stream(query, {
    reverse: sort === 'desc',
    maxNumLogs: limit,
  });
  const logs: Log[] = [];

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }
    const pageBlocks = res.data.blocks;
    const pageLogs = res.data.logs.map((log) => {
      const logBlock = pageBlocks.find(
        (block) => block.number === log.blockNumber,
      );
      const timestamp = logBlock?.timestamp || '0x';
      return {
        blockNumber: log.blockNumber as number,
        blockTimestamp: 1000 * parseInt(timestamp),
        logIndex: log.logIndex as number,
        transactionHash: log.transactionHash as Hex,
        address: log.address as Address,
        data: log.data as Hex,
        topics: log.topics.filter(
          (topic) => topic !== null && topic !== undefined,
        ) as Hex[],
      };
    });
    logs.push(...pageLogs);

    height = res.archiveHeight || null;
    if (logs.length >= limit) {
      break;
    }
  }
  const lastLog = logs.at(-1);
  const prevBlock =
    logs.length >= limit && lastLog ? lastLog.blockNumber - 1 : -1;

  return {
    logs,
    pagination: {
      cursor: prevBlock,
      height,
    },
  };
});
