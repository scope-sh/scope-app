import { quicknode, tenderly } from 'evm-providers';
import type { Chain as ChainData } from 'viem';
import {
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
  polygon,
  polygonAmoy,
  arbitrum,
  arbitrumSepolia,
} from 'viem/chains';

const ETHEREUM = mainnet.id;
const SEPOLIA = sepolia.id;
const OPTIMISM = optimism.id;
const OPTIMISM_SEPOLIA = optimismSepolia.id;
const BASE = base.id;
const BASE_SEPOLIA = baseSepolia.id;
const POLYGON = polygon.id;
const POLYGON_AMOY = polygonAmoy.id;
const ARBITRUM = arbitrum.id;
const ARBITRUM_SEPOLIA = arbitrumSepolia.id;

type Chain =
  | typeof ETHEREUM
  | typeof SEPOLIA
  | typeof OPTIMISM
  | typeof OPTIMISM_SEPOLIA
  | typeof BASE
  | typeof BASE_SEPOLIA
  | typeof POLYGON
  | typeof POLYGON_AMOY
  | typeof ARBITRUM
  | typeof ARBITRUM_SEPOLIA;

const DEFAULT_CHAIN = ETHEREUM;

const CHAINS: Chain[] = [
  ETHEREUM,
  SEPOLIA,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  BASE,
  BASE_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  ARBITRUM,
  ARBITRUM_SEPOLIA,
];

function getChainData(chainId: Chain): ChainData {
  switch (chainId) {
    case ETHEREUM:
      return mainnet;
    case SEPOLIA:
      return sepolia;
    case OPTIMISM:
      return optimism;
    case OPTIMISM_SEPOLIA:
      return optimismSepolia;
    case BASE:
      return base;
    case BASE_SEPOLIA:
      return baseSepolia;
    case POLYGON:
      return polygon;
    case POLYGON_AMOY:
      return polygonAmoy;
    case ARBITRUM:
      return arbitrum;
    case ARBITRUM_SEPOLIA:
      return arbitrumSepolia;
  }
}

function getChainName(chainId: Chain): string {
  return getChainData(chainId).name;
}

function getChainNames(chain: Chain): string[] {
  function getAliases(chain: Chain): string[] {
    switch (chain) {
      case ETHEREUM: {
        return ['mainnet'];
      }
      case OPTIMISM: {
        return ['optimism'];
      }
      case OPTIMISM_SEPOLIA: {
        return ['optimism sepolia'];
      }
      case POLYGON_AMOY: {
        return ['amoy'];
      }
      case ARBITRUM: {
        return ['arbitrum'];
      }
    }
    return [];
  }
  const mainName = getChainName(chain);
  const aliases = getAliases(chain);
  return [mainName, ...aliases];
}

function getChainByName(value: string): Chain | null {
  const chainIndex = CHAINS.findIndex((chain) => {
    const chainNames = getChainNames(chain);
    return chainNames.some(
      (name) => name.toLowerCase() === value.toLowerCase(),
    );
  });
  return CHAINS[chainIndex] || null;
}

function isChainName(value: string): boolean {
  const chain = getChainByName(value);
  return !!chain;
}

function getEndpointUrl(
  chainId: Chain,
  quicknodeAppName: string,
  quicknodeAppKey: string,
): string {
  return quicknode(chainId, quicknodeAppName, quicknodeAppKey);
}

function getTenderlyEndpointUrl(
  chainId: Chain,
  tenderlyNodeAccessKey: string,
): string {
  return tenderly(chainId, tenderlyNodeAccessKey);
}

function parseChain(value: string): Chain | null {
  const chain = CHAINS.find((chain) => value === chain.toString());
  return chain ?? null;
}

export {
  CHAINS,
  DEFAULT_CHAIN,
  ETHEREUM,
  SEPOLIA,
  OPTIMISM,
  OPTIMISM_SEPOLIA,
  BASE,
  BASE_SEPOLIA,
  POLYGON,
  POLYGON_AMOY,
  ARBITRUM,
  ARBITRUM_SEPOLIA,
  getChainByName,
  getChainData,
  getChainName,
  getChainNames,
  getEndpointUrl,
  getTenderlyEndpointUrl,
  isChainName,
  parseChain,
};
export type { Chain };
