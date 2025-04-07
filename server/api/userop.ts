import {
  HypersyncClient,
  LogField,
  type Query,
} from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import type { Hash } from 'viem';

import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  ENTRY_POINT_0_8_ADDRESS,
} from '@/utils/context/erc4337/entryPoint';

const envioHypersyncApiKey = process.env.ENVIO_HYPERSYNC_API_KEY || '';

const USER_OPERATION_EVENT_TOPIC =
  '0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f';

export default defineEventHandler(async (event) => {
  const { chain, hash } = getQuery<{
    chain: string;
    hash: Hash;
  }>(event);
  const endpointUrl = `https://${chain}.hypersync.xyz`;
  const client = HypersyncClient.new({
    url: endpointUrl,
    bearerToken: envioHypersyncApiKey,
  });

  const query: Query = {
    fromBlock: 0,
    logs: [
      {
        address: [
          ENTRY_POINT_0_6_ADDRESS,
          ENTRY_POINT_0_7_ADDRESS,
          ENTRY_POINT_0_8_ADDRESS,
        ],
        topics: [[USER_OPERATION_EVENT_TOPIC], [hash]],
      },
    ],
    maxNumLogs: 1,
    fieldSelection: {
      log: [LogField.TransactionHash],
    },
  };

  const receiver = await client.stream(query, {
    reverse: true,
    maxNumLogs: 1,
  });

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }
    const logs = res.data.logs;
    const firstLog = logs[0];
    if (firstLog === undefined) {
      continue;
    }
    const transactionHash = firstLog.transactionHash;
    return transactionHash;
  }
});
