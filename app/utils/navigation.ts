import type { Hex } from 'viem';
import { createPublicClient, http } from 'viem';

import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import type { Chain } from '@/utils/chains';
import { CHAINS, getChainData, getEndpointUrl } from '@/utils/chains';

interface SimpleTransaction {
  hash: Hex;
}

interface TransactionResult {
  chain: Chain;
  transaction: SimpleTransaction;
}

interface SearchResult {
  type: 'transaction' | 'op';
  chain: Chain;
  hash: Hex;
}

async function chunkArray<T>(array: T[], size: number): Promise<T[][]> {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function searchTransactionOrOp(
  hash: Hex,
  quicknodeAppName: string,
  quicknodeAppKey: string,
  indexerEndpoint: string,
): Promise<SearchResult | null> {
  const maxRequests = 10;

  // Search for a transaction on each chain
  const transactionPromises = CHAINS.map(async (chain) => {
    const client = createPublicClient({
      chain: getChainData(chain),
      transport: http(getEndpointUrl(chain, quicknodeAppName, quicknodeAppKey)),
    });
    const service = new EvmService(client);
    try {
      const transaction = await service.getTransaction(hash);
      if (transaction) {
        return { chain, transaction: { hash: transaction.hash } };
      }
    } catch {
      // Ignore
    }
    return null;
  });

  // Process in chunks of 10
  const chunks = await chunkArray(transactionPromises, maxRequests);
  for (const chunk of chunks) {
    const results = await Promise.all(chunk);
    const found = results.find(
      (result): result is TransactionResult => result !== null,
    );
    if (found) {
      return {
        type: 'transaction',
        chain: found.chain,
        hash: found.transaction.hash,
      };
    }
  }

  // Search for an op on each chain
  const opPromises = CHAINS.map(async (chain) => {
    const indexerService = new IndexerService(indexerEndpoint, chain);
    const foundOp = await indexerService.getTxHashByOpHash(hash as Hex);
    if (foundOp) {
      return chain;
    }
    return null;
  });

  // Process in chunks of 10
  const opChunks = await chunkArray(opPromises, maxRequests);
  for (const chunk of opChunks) {
    const results = await Promise.all(chunk);
    const foundChain = results.find(
      (result): result is Chain => result !== null,
    );
    if (foundChain) {
      return {
        type: 'op',
        chain: foundChain,
        hash,
      };
    }
  }

  return null;
}

// eslint-disable-next-line import/prefer-default-export
export { searchTransactionOrOp };
