import type {
  Address,
  ContractFunctionParameters,
  Hex,
  PublicClient,
} from 'viem';
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  namehash,
  slice,
  toHex,
} from 'viem';
import { packetToBytes } from 'viem/ens';
import { trim } from 'viem/utils';

import ensAddressResolverAbi from '@/abi/ensAddressResolver';
import ensUniversalResolverAbi from '@/abi/ensUniversalResolver';
import {
  type Chain,
  ARBITRUM_SEPOLIA,
  ARBITRUM,
  BASE_SEPOLIA,
  BASE,
  ETHEREUM,
  OPTIMISM_SEPOLIA,
  OPTIMISM,
  POLYGON_AMOY,
  POLYGON,
  SEPOLIA,
  MODE,
  LINEA,
  ARBITRUM_NOVA,
  CELO,
  AVALANCHE,
  AVALANCHE_FUJI,
  GNOSIS,
  BSC,
  MONAD_TESTNET,
  MEGAETH_TESTNET,
  getChainData,
  getEndpointUrl,
} from '@/utils/chains.js';

const BASE_L2_RESOLVER_ADDRESS = '0xc6d566a56a1aff6508b41f6c90ff131615583bcd';

interface EnsCall {
  name: string;
  client: PublicClient;
  params: ContractFunctionParameters;
}

type CallResult =
  | {
      name: string;
      status: 'success';
      result: unknown;
    }
  | {
      name: string;
      status: 'failure';
      error: Error;
    };

class Service {
  baseClient: PublicClient;
  ensChain: Chain;
  ensClient: PublicClient;
  chain: Chain;

  constructor(quicknodeAppName: string, quicknodeAppKey: string, chain: Chain) {
    this.baseClient = createPublicClient({
      chain: getChainData(BASE),
      transport: http(getEndpointUrl(BASE, quicknodeAppName, quicknodeAppKey), {
        batch: true,
      }),
    });
    this.ensChain = getFallbackChain(chain);
    this.ensClient = createPublicClient({
      chain: getChainData(this.ensChain),
      transport: http(
        getEndpointUrl(this.ensChain, quicknodeAppName, quicknodeAppKey),
        {
          batch: true,
        },
      ),
    });
    this.chain = chain;
  }

  public async resolveEns(name: string): Promise<Address | null> {
    const addresses = await this.resolveEnsMany([name]);
    return addresses[name] || null;
  }

  // Resolves multiple ENS names to addresses
  // Uses the provided chain as a coin type
  // Uses Ethereum as a fallback coin type
  public async resolveEnsMany(
    names: string[],
  ): Promise<Record<string, Address>> {
    // In case there is no record for the chain, we use a fallback
    const ensCalls = names
      .map((name) => {
        return this.#getCalls(name);
      })
      .flat();
    // Group calls by client
    const results: CallResult[] = [];
    const groupedCalls = ensCalls.reduce(
      (acc, call) => {
        const clientChain = call.client.chain;
        if (!clientChain) {
          throw new Error('Client chain not found');
        }
        const chainCalls = acc[clientChain.id];
        if (!chainCalls) {
          return {
            ...acc,
            [clientChain.id]: [call],
          };
        }
        chainCalls.push(call);
        return acc;
      },
      {} as Record<number, EnsCall[]>,
    );
    // Execute multicall for each client
    for (const chainId in groupedCalls) {
      const calls = groupedCalls[parseInt(chainId)];
      if (!calls) {
        continue;
      }
      const chainResults = await Promise.all(
        calls.map((call) => this.#queryCall(call)),
      );
      results.push(...chainResults);
    }
    // Merge results
    const addresses: Record<string, Address> = {};
    for (const name of names) {
      const nameResults = results.filter((result) => result.name === name);
      const nameAddresses = this.#parseResults(name, nameResults);
      for (const address of nameAddresses) {
        if (!address) {
          continue;
        }
        if (address && !addresses[address]) {
          addresses[name] = address;
        }
      }
    }
    return addresses;
  }

  async #queryCall(call: EnsCall): Promise<CallResult> {
    try {
      const result = await call.client.readContract(call.params);
      return {
        name: call.name,
        status: 'success',
        result,
      };
    } catch (e) {
      return {
        name: call.name,
        status: 'failure',
        error: e as Error,
      };
    }
  }

  #getCalls(name: string): EnsCall[] {
    // Base names
    if (isBaseName(name)) {
      return [
        {
          name,
          client: this.baseClient,
          params: {
            address: BASE_L2_RESOLVER_ADDRESS,
            abi: ensUniversalResolverAbi,
            functionName: 'resolve',
            args: [
              toHex(packetToBytes(name)),
              encodeFunctionData({
                abi: ensAddressResolverAbi,
                functionName: 'addr',
                args: [namehash(name)],
              }),
            ],
          },
        },
      ];
    }
    // Ethereum names
    const ethereumChainData = getChainData(this.ensChain);
    const ensUniversalResolver =
      ethereumChainData.contracts?.ensUniversalResolver;
    if (!ensUniversalResolver) {
      throw new Error('ENS Universal Resolver contract not found');
    }
    // In case there is no record for the chain, we use a fallback
    const fallbackChain = getFallbackChain(this.chain);
    const queriedChains =
      this.chain === fallbackChain ? [this.chain] : [this.chain, fallbackChain];
    const coinTypes = queriedChains.map((chain) =>
      convertEvmChainIdToCoinType(chain),
    );
    return coinTypes.map((coinType) => ({
      name,
      client: this.ensClient,
      params: {
        address: ensUniversalResolver.address,
        abi: ensUniversalResolverAbi,
        functionName: 'resolve',
        args: [
          toHex(packetToBytes(name)),
          encodeFunctionData({
            abi: ensAddressResolverAbi,
            functionName: 'addr',
            args: [namehash(name), BigInt(coinType)],
          }),
        ],
      },
    }));
  }

  #parseResults(name: string, results: CallResult[]): (Address | null)[] {
    return results.map((result) => {
      if (result.status !== 'success') return null;
      const value = (result.result as [Hex, Hex])[0];
      if (value === '0x') return null;
      // Base names
      if (isBaseName(name)) {
        // Convert bytes32 to address
        return slice(value, 12, 32);
      }
      // Ethereum names
      const address = decodeFunctionResult({
        abi: ensAddressResolverAbi,
        args: [namehash(name), BigInt(0)],
        functionName: 'addr',
        data: value,
      });
      if (address === '0x') return null;
      if (trim(address) === '0x00') return null;
      return address;
    });
  }
}

function getFallbackChain(chain: Chain): Chain {
  switch (chain) {
    case ETHEREUM:
      return ETHEREUM;
    case SEPOLIA:
      return SEPOLIA;
    case OPTIMISM:
      return ETHEREUM;
    case OPTIMISM_SEPOLIA:
      return SEPOLIA;
    case BASE:
      return ETHEREUM;
    case BASE_SEPOLIA:
      return SEPOLIA;
    case POLYGON:
      return ETHEREUM;
    case POLYGON_AMOY:
      return SEPOLIA;
    case ARBITRUM:
      return ETHEREUM;
    case ARBITRUM_SEPOLIA:
      return SEPOLIA;
    case MODE:
      return ETHEREUM;
    case LINEA:
      return ETHEREUM;
    case ARBITRUM_NOVA:
      return ETHEREUM;
    case CELO:
      return ETHEREUM;
    case AVALANCHE:
      return ETHEREUM;
    case AVALANCHE_FUJI:
      return SEPOLIA;
    case GNOSIS:
      return ETHEREUM;
    case BSC:
      return ETHEREUM;
    case MONAD_TESTNET:
      return SEPOLIA;
    case MEGAETH_TESTNET:
      return SEPOLIA;
  }
}

function isBaseName(name: string): boolean {
  return name.endsWith('.base.eth');
}

function convertEvmChainIdToCoinType(chainId: number): number {
  if (chainId === ETHEREUM) return 60;
  if (chainId === SEPOLIA) return 60;
  return (0x80000000 | chainId) >>> 0;
}

export default Service;
