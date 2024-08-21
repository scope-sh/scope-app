import type {
  Address,
  ByteArray,
  ContractFunctionParameters,
  Hex,
  MulticallResults,
  PublicClient,
} from 'viem';
import {
  createPublicClient,
  decodeFunctionResult,
  encodeFunctionData,
  http,
  labelhash,
  namehash,
  stringToBytes,
  toHex,
} from 'viem';
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
  getChainData,
  getEndpointUrl,
} from '@/utils/chains.js';

class Service {
  ensChain: Chain;
  ethereumClient: PublicClient;
  chain: Chain;

  constructor(alchemyApiKey: string, chain: Chain) {
    this.ensChain = getFallbackChain(chain);
    this.ethereumClient = createPublicClient({
      chain: getChainData(this.ensChain),
      transport: http(getEndpointUrl(this.ensChain, alchemyApiKey)),
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
    const contracts = names
      .map((name) => {
        return this.#getCalls(name);
      })
      .flat();
    const results = await this.ethereumClient.multicall({
      contracts,
    });
    let index = 0;
    const addresses: Record<string, Address> = {};
    for (const name of names) {
      const callCount = this.#getCalls(name).length;
      const nameResults = results.slice(index, index + callCount);
      const nameAddresses = this.#parseResults(name, nameResults);
      for (const address of nameAddresses) {
        if (!address) {
          continue;
        }
        if (address && !addresses[address]) {
          addresses[name] = address;
        }
      }
      index += callCount;
    }
    return addresses;
  }

  #getCalls(name: string): ContractFunctionParameters[] {
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
    }));
  }

  #parseResults(name: string, results: MulticallResults): (Address | null)[] {
    return results.map((result) => {
      if (result.status !== 'success') return null;
      const value = (result.result as [Hex, Hex])[0];
      if (value === '0x') return null;
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
  }
}

function convertEvmChainIdToCoinType(chainId: number): number {
  if (chainId === ETHEREUM) return 60;
  if (chainId === SEPOLIA) return 60;
  return (0x80000000 | chainId) >>> 0;
}

function encodeLabelhash(hash: Hex): `[${string}]` {
  return `[${hash.slice(2)}]`;
}

function packetToBytes(packet: string): ByteArray {
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '');
  if (value.length === 0) return new Uint8Array(1);

  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);

  let offset = 0;
  const list = value.split('.');
  for (const item of list) {
    let encoded = stringToBytes(item);
    // if the length is > 255, make the encoded label value a labelhash
    // this is compatible with the universal resolver
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(item)));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }

  if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1);
  return bytes;
}

export default Service;
