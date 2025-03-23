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
  decodeEventLog,
  formatUnits,
  getAbiItem,
  http,
  pad,
  size,
  toEventSelector,
  zeroHash,
  type Address,
  type Hex,
} from 'viem';
import { multicall } from 'viem/actions';

import type { Sort } from './common';

import erc1155Abi from '@/abi/erc1155';
import erc20Abi from '@/abi/erc20';
import { getChainData, parseChain, getEndpointUrl } from '@/utils/chains.js';

const appBaseUrl = process.env.VITE_APP_BASE_URL || '';
const quicknodeAppName = process.env.VITE_QUICKNODE_APP_NAME || '';
const quicknodeAppKey = process.env.VITE_QUICKNODE_APP_KEY || '';
const envioHypersyncApiKey = process.env.ENVIO_HYPERSYNC_API_KEY || '';

interface TransferData {
  type: 'transfer';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  value: bigint;
}

interface TransferSingleData {
  type: 'transfer-single';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  id: bigint;
  value: bigint;
}

interface TransferBatchData {
  type: 'transfer-batch';
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  from: Address;
  to: Address;
  values: bigint[];
  ids: bigint[];
}

type Data = TransferData | TransferSingleData | TransferBatchData;

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

  const transferTopic = toEventSelector(
    getAbiItem({
      abi: erc20Abi,
      name: 'Transfer',
    }),
  );
  const transferSingleTopic = toEventSelector(
    getAbiItem({
      abi: erc1155Abi,
      name: 'TransferSingle',
    }),
  );
  const transferBatchTopic = toEventSelector(
    getAbiItem({
      abi: erc1155Abi,
      name: 'TransferBatch',
    }),
  );
  const query: Query = {
    fromBlock: sort === 'asc' ? cursor || 0 : 0,
    toBlock: sort === 'desc' ? cursor || undefined : undefined,
    logs: [
      {
        topics: [[transferTopic], [pad(address)]],
      },
      {
        topics: [[transferTopic], [], [pad(address)]],
      },
      {
        topics: [[transferSingleTopic], [], [pad(address)]],
      },
      {
        topics: [[transferSingleTopic], [], [], [pad(address)]],
      },
      {
        topics: [[transferBatchTopic], [], [pad(address)]],
      },
      {
        topics: [[transferBatchTopic], [], [], [pad(address)]],
      },
    ],
    maxNumLogs: limit,
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

  let height: number | null = null;
  const receiver = await client.stream(query, {
    reverse: sort === 'desc',
    maxNumLogs: limit,
  });
  const transferData: Data[] = [];

  for (;;) {
    const res = await receiver.recv();
    if (res === null) {
      break;
    }
    const pageBlocks = res.data.blocks;
    const pageData = res.data.logs
      .map((log) => {
        const logBlock = pageBlocks.find(
          (block) => block.number === log.blockNumber,
        );
        const timestamp = logBlock?.timestamp || 0;
        const decodedLog = decodeEventLog({
          abi: [...erc20Abi, ...erc1155Abi],
          data: log.data
            ? size(log.data as Hex) > 0
              ? (log.data as Hex)
              : zeroHash
            : zeroHash,
          topics: log.topics.filter(
            (topic) => topic !== null && topic !== undefined,
          ) as [Hex, ...Hex[]],
          strict: false,
        });
        if (decodedLog.eventName === 'Transfer') {
          const from = decodedLog.args.from?.toLowerCase() as
            | Address
            | undefined;
          const to = decodedLog.args.to?.toLowerCase() as Address | undefined;
          if (!from || !to) {
            return null;
          }
          return {
            type: 'transfer',
            blockNumber: log.blockNumber as number,
            blockTimestamp: 1000 * timestamp,
            transactionHash: log.transactionHash as Hex,
            asset: log.address as Address,
            from,
            to,
            value: decodedLog.args.value,
          } as Data;
        }
        if (decodedLog.eventName === 'TransferSingle') {
          const from = decodedLog.args.from?.toLowerCase() as
            | Address
            | undefined;
          const to = decodedLog.args.to?.toLowerCase() as Address | undefined;
          if (!from || !to) {
            return null;
          }
          return {
            type: 'transfer-single',
            blockNumber: log.blockNumber as number,
            blockTimestamp: 1000 * timestamp,
            transactionHash: log.transactionHash as Hex,
            asset: log.address as Address,
            from,
            to,
            id: decodedLog.args.id,
            value: decodedLog.args.value,
          } as Data;
        }
        if (decodedLog.eventName === 'TransferBatch') {
          const from = decodedLog.args.from?.toLowerCase() as
            | Address
            | undefined;
          const to = decodedLog.args.to?.toLowerCase() as Address | undefined;
          if (!from || !to) {
            return null;
          }
          return {
            type: 'transfer-batch',
            blockNumber: log.blockNumber as number,
            blockTimestamp: 1000 * timestamp,
            transactionHash: log.transactionHash as Hex,
            asset: log.address as Address,
            from,
            to,
            values: decodedLog.args.values,
            ids: decodedLog.args.ids,
          } as Data;
        }
        return null;
      })
      .filter((transfer) => transfer !== null);
    transferData.push(...pageData);

    height = res.archiveHeight || null;
    if (transferData.length >= limit) {
      break;
    }
  }
  const lastTransfer = transferData.at(-1);
  const prevBlock =
    transferData.length >= limit && lastTransfer
      ? lastTransfer.blockNumber - 1
      : -1;

  // For each asset, try to get the decimals
  // If the call is successful, assume it's an ERC20 token and normalize the amount
  // Otherwise, assume it's an ERC721 token, set the amount to 1, use the value as token ID
  const assets = [...new Set(transferData.map((transfer) => transfer.asset))];
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
  const decimalResults = await multicall(evmClient, {
    contracts: assets.map((asset) => ({
      address: asset,
      abi: erc20Abi,
      functionName: 'decimals',
    })),
  });

  const transfers: Transfer[] = transferData.map((transfer) => {
    if (transfer.type === 'transfer-single') {
      return {
        type: 'erc1155',
        blockNumber: transfer.blockNumber,
        blockTimestamp: transfer.blockTimestamp,
        transactionHash: transfer.transactionHash,
        asset: transfer.asset,
        from: transfer.from,
        to: transfer.to,
        ids: [transfer.id.toString()],
        amounts: [transfer.value.toString()],
      };
    }
    if (transfer.type === 'transfer-batch') {
      return {
        type: 'erc1155',
        blockNumber: transfer.blockNumber,
        blockTimestamp: transfer.blockTimestamp,
        transactionHash: transfer.transactionHash,
        asset: transfer.asset,
        from: transfer.from,
        to: transfer.to,
        ids: transfer.ids.map((id) => id.toString()),
        amounts: transfer.values.map((value) => value.toString()),
      };
    }
    const assetIndex = assets.indexOf(transfer.asset);
    const decimals = decimalResults[assetIndex];
    if (decimals !== undefined && decimals.status === 'success') {
      return {
        type: 'erc20',
        blockNumber: transfer.blockNumber,
        blockTimestamp: transfer.blockTimestamp,
        transactionHash: transfer.transactionHash,
        asset: transfer.asset,
        from: transfer.from,
        to: transfer.to,
        amount: formatUnits(
          transfer.value,
          decimals.result as number,
        ).toString(),
      };
    }
    return {
      type: 'erc721',
      blockNumber: transfer.blockNumber,
      blockTimestamp: transfer.blockTimestamp,
      transactionHash: transfer.transactionHash,
      asset: transfer.asset,
      from: transfer.from,
      to: transfer.to,
      id: transfer.value.toString(),
      amount: '1',
    };
  });

  return {
    transfers,
    pagination: {
      cursor: prevBlock,
      height,
    },
  };
});
