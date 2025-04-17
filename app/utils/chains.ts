import { quicknode } from 'evm-providers';
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
  mode,
  linea,
  arbitrumNova,
  celo,
  avalanche,
  avalancheFuji,
  gnosis,
  bsc,
  monadTestnet,
  megaethTestnet,
} from 'viem/chains';

import useEnv from '@/composables/useEnv';

const { hideChains, showChains } = useEnv();

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
const MODE = mode.id;
const LINEA = linea.id;
const ARBITRUM_NOVA = arbitrumNova.id;
const CELO = celo.id;
const AVALANCHE = avalanche.id;
const AVALANCHE_FUJI = avalancheFuji.id;
const GNOSIS = gnosis.id;
const BSC = bsc.id;
const MONAD_TESTNET = monadTestnet.id;
const MEGAETH_TESTNET = megaethTestnet.id;

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
  | typeof ARBITRUM_SEPOLIA
  | typeof MODE
  | typeof LINEA
  | typeof ARBITRUM_NOVA
  | typeof CELO
  | typeof AVALANCHE
  | typeof AVALANCHE_FUJI
  | typeof GNOSIS
  | typeof BSC
  | typeof MONAD_TESTNET
  | typeof MEGAETH_TESTNET;

const DEFAULT_CHAIN = ETHEREUM;

const ALL_CHAINS: Chain[] = [
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
];
const CHAINS =
  showChains.length > 0
    ? showChains
    : hideChains.length > 0
      ? ALL_CHAINS.filter((chain) => !hideChains.includes(chain))
      : ALL_CHAINS;

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
    case MODE:
      return mode;
    case LINEA:
      return linea;
    case ARBITRUM_NOVA:
      return arbitrumNova;
    case CELO:
      return celo;
    case AVALANCHE:
      return avalanche;
    case AVALANCHE_FUJI:
      return avalancheFuji;
    case GNOSIS:
      return gnosis;
    case BSC:
      return bsc;
    case MONAD_TESTNET:
      return monadTestnet;
    case MEGAETH_TESTNET:
      return megaethTestnet;
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
      case MODE: {
        return ['mode'];
      }
      case LINEA: {
        return ['linea'];
      }
      case ARBITRUM_NOVA: {
        return ['arbitrum', 'nova'];
      }
      case AVALANCHE_FUJI: {
        return ['fuji'];
      }
      case BSC: {
        return ['bsc', 'binance smart chain'];
      }
      case MEGAETH_TESTNET: {
        return ['mega testnet'];
      }
    }
    return [];
  }
  const mainName = getChainName(chain);
  const aliases = getAliases(chain);
  return [mainName, ...aliases];
}

function getChainIconUrl(chainId: Chain): string {
  switch (chainId) {
    case ETHEREUM:
    case SEPOLIA:
    case OPTIMISM:
    case OPTIMISM_SEPOLIA:
    case BASE:
    case BASE_SEPOLIA:
    case ARBITRUM:
    case ARBITRUM_SEPOLIA:
    case MODE:
    case LINEA:
    case ARBITRUM_NOVA:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/ethereum/info/logo.png';
    case POLYGON:
    case POLYGON_AMOY:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/polygon/info/logo.png';
    case CELO:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/celo/info/logo.png';
    case AVALANCHE:
    case AVALANCHE_FUJI:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/avalanchec/info/logo.png';
    case GNOSIS:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/xdai/info/logo.png';
    case BSC:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/binance/info/logo.png';
    case MONAD_TESTNET:
      return 'https://cdn.prod.website-files.com/667c57e6f9254a4b6d914440/667d7104644c621965495f6e_LogoMark.svg';
    case MEGAETH_TESTNET:
      return 'https://raw.githubusercontent.com/trustwallet/assets/refs/heads/master/blockchains/megaeth/info/logo.png';
  }
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
  if (chainId === MODE) {
    return mode.rpcUrls.default.http[0];
  }
  if (chainId === AVALANCHE) {
    return avalanche.rpcUrls.default.http[0];
  }
  if (chainId === AVALANCHE_FUJI) {
    return avalancheFuji.rpcUrls.default.http[0];
  }
  if (chainId === MEGAETH_TESTNET) {
    return megaethTestnet.rpcUrls.default.http[0];
  }
  return quicknode(chainId, quicknodeAppName, quicknodeAppKey);
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
  getChainByName,
  getChainData,
  getChainName,
  getChainNames,
  getChainIconUrl,
  getEndpointUrl,
  isChainName,
  parseChain,
};
export type { Chain };
