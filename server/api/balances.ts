import {
  BlockField,
  HypersyncClient,
  LogField,
  type Query,
} from '@envio-dev/hypersync-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineEventHandler, getQuery } from 'h3';
import {
  createPublicClient,
  formatUnits,
  getAbiItem,
  http,
  pad,
  toEventSelector,
  type Address,
} from 'viem';
import { multicall } from 'viem/actions';

import erc20Abi from '@/abi/erc20';
import { getChainData, parseChain, getEndpointUrl } from '@/utils/chains.js';

const appBaseUrl = process.env.VITE_APP_BASE_URL || '';
const quicknodeAppName = process.env.VITE_QUICKNODE_APP_NAME || '';
const quicknodeAppKey = process.env.VITE_QUICKNODE_APP_KEY || '';
const envioHypersyncApiKey = process.env.ENVIO_HYPERSYNC_API_KEY || '';

interface TokenBalance {
  address: Address;
  symbol: string | null;
  decimals: number;
  balance: string;
  iconUrl?: string;
}

const LOG_LIMIT = 5_000;

export default defineEventHandler(async (event) => {
  const { chain, address } = getQuery<{
    chain: string;
    address: Address;
  }>(event);

  const endpointUrl = `https://${chain}.hypersync.xyz`;
  const client = HypersyncClient.new({
    url: endpointUrl,
    bearerToken: envioHypersyncApiKey,
  });

  const transferTopic = toEventSelector(
    getAbiItem({
      abi: erc20Abi,
      name: 'Transfer',
    }),
  );

  const query: Query = {
    fromBlock: 0,
    logs: [
      {
        topics: [[transferTopic], [pad(address)]],
      },
      {
        topics: [[transferTopic], [], [pad(address)]],
      },
    ],
    maxNumLogs: LOG_LIMIT,
    fieldSelection: {
      block: [BlockField.Number, BlockField.Timestamp],
      log: [
        LogField.LogIndex,
        LogField.TransactionHash,
        LogField.BlockNumber,
        LogField.Address,
        LogField.Data,
        LogField.Topic0,
        LogField.Topic1,
        LogField.Topic2,
        LogField.Topic3,
      ],
    },
  };

  const receiver = await client.stream(query, {
    reverse: true,
    maxNumLogs: LOG_LIMIT,
  });

  const tokenAddresses = new Set<Address>();

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }

    for (const log of res.data.logs) {
      tokenAddresses.add(log.address as Address);
    }
  }

  // Get token metadata and balances
  const chainId = parseChain(chain);
  if (chainId === null) {
    throw new Error('Invalid chain');
  }
  const evmClient = createPublicClient({
    chain: getChainData(chainId),
    transport: http(
      getEndpointUrl(chainId, quicknodeAppName, quicknodeAppKey),
      {
        fetchOptions: {
          headers: {
            Origin: appBaseUrl,
          },
        },
      },
    ),
  });

  const tokenMetadata = await multicall(evmClient, {
    contracts: Array.from(tokenAddresses)
      .map((token) => [
        {
          address: token,
          abi: erc20Abi,
          functionName: 'symbol',
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: 'decimals',
        },
        {
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        },
      ])
      .flat(),
  });

  const tokenBalances: TokenBalance[] = [];
  for (let i = 0; i < tokenAddresses.size; i++) {
    const tokenAddress = Array.from(tokenAddresses)[i];
    if (!tokenAddress) {
      continue;
    }
    const symbolMetadata = tokenMetadata[3 * i];
    if (!symbolMetadata) {
      continue;
    }
    const symbol =
      symbolMetadata.status === 'success'
        ? (symbolMetadata.result as string)
        : null;
    const decimalsMetadata = tokenMetadata[3 * i + 1];
    if (!decimalsMetadata) {
      continue;
    }
    const decimals =
      decimalsMetadata.status === 'success'
        ? (decimalsMetadata.result as number)
        : 18;
    const balanceMetadata = tokenMetadata[3 * i + 2];
    if (!balanceMetadata) {
      continue;
    }
    const balance =
      balanceMetadata.status === 'success'
        ? formatUnits(balanceMetadata.result as bigint, decimals)
        : '0';
    tokenBalances.push({
      address: tokenAddress,
      symbol,
      decimals,
      balance,
    });
  }
  // Filter out tokens with zero balance
  return tokenBalances.filter((token) => token.balance !== '0');
});
