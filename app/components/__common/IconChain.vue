<template>
  <IconBase
    v-if="chain === BASE"
    :kind
    type="mainnet"
  />
  <IconBase
    v-else-if="chain === BASE_SEPOLIA"
    :kind
    type="testnet"
  />
  <IconEthereum
    v-else-if="chain === ETHEREUM"
    :kind
    type="mainnet"
  />
  <IconEthereum
    v-else-if="chain === SEPOLIA"
    :kind
    type="testnet"
  />
  <IconOptimism
    v-else-if="chain === OPTIMISM"
    :kind
    type="mainnet"
  />
  <IconOptimism
    v-else-if="chain === OPTIMISM_SEPOLIA"
    :kind
    type="testnet"
  />
  <IconPolygon
    v-else-if="chain === POLYGON"
    :kind
    type="mainnet"
  />
  <IconPolygon
    v-else-if="chain === POLYGON_AMOY"
    :kind
    type="testnet"
  />
  <IconArbitrum
    v-else-if="chain === ARBITRUM"
    :kind
    type="mainnet"
  />
  <IconArbitrum
    v-else-if="chain === ARBITRUM_SEPOLIA"
    :kind
    type="testnet"
  />
  <IconMode
    v-else-if="chain === MODE"
    :kind
    type="mainnet"
  />
  <IconLinea
    v-else-if="chain === LINEA"
    :kind
    type="mainnet"
  />
  <IconArbitrumNova
    v-else-if="chain === ARBITRUM_NOVA"
    :kind
    type="mainnet"
  />
  <IconCelo
    v-else-if="chain === CELO"
    :kind
    type="mainnet"
  />
  <IconAvalanche
    v-else-if="chain === AVALANCHE"
    :kind
    type="mainnet"
  />
  <IconAvalanche
    v-else-if="chain === AVALANCHE_FUJI"
    :kind
    type="testnet"
  />
  <IconGnosis
    v-else-if="chain === GNOSIS"
    :kind
    type="mainnet"
  />
  <IconBsc
    v-else-if="chain === BSC"
    :kind
    type="mainnet"
  />
  <IconMonad
    v-else-if="chain === MONAD_TESTNET"
    :kind
    type="testnet"
  />
  <IconMegaeth
    v-else-if="chain === MEGAETH_TESTNET"
    :kind
    type="testnet"
  />
</template>

<script setup lang="ts">
import IconArbitrum from './icon/chain/Arbitrum.vue';
import IconArbitrumNova from './icon/chain/ArbitrumNova.vue';
import IconAvalanche from './icon/chain/Avalanche.vue';
import IconBase from './icon/chain/Base.vue';
import IconBsc from './icon/chain/Bsc.vue';
import IconCelo from './icon/chain/Celo.vue';
import IconEthereum from './icon/chain/Ethereum.vue';
import IconGnosis from './icon/chain/Gnosis.vue';
import IconLinea from './icon/chain/Linea.vue';
import IconMegaeth from './icon/chain/Megaeth.vue';
import IconMode from './icon/chain/Mode.vue';
import IconMonad from './icon/chain/Monad.vue';
import IconOptimism from './icon/chain/Optimism.vue';
import IconPolygon from './icon/chain/Polygon.vue';
import type { Kind } from './icon/chain/kind.js';

import {
  type Chain,
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
} from '@/utils/chains.js';

defineProps<{
  chain: Chain;
  kind: Kind;
}>();
</script>
