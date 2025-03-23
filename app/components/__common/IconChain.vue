<template>
  <IconBase
    v-if="chain === BASE"
    :kind
    type="mainnet"
  />
  <IconBase
    v-else-if="chain === BASE_SEPOLIA"
    :kind
    type="sepolia"
  />
  <IconEthereum
    v-else-if="chain === ETHEREUM"
    :kind
    type="mainnet"
  />
  <IconEthereum
    v-else-if="chain === SEPOLIA"
    :kind
    type="sepolia"
  />
  <IconOptimism
    v-else-if="chain === OPTIMISM"
    :kind
    type="mainnet"
  />
  <IconOptimism
    v-else-if="chain === OPTIMISM_SEPOLIA"
    :kind
    type="sepolia"
  />
  <IconPolygon
    v-else-if="chain === POLYGON"
    :kind
    type="mainnet"
  />
  <IconPolygon
    v-else-if="chain === POLYGON_AMOY"
    :kind
    type="amoy"
  />
  <IconArbitrum
    v-else-if="chain === ARBITRUM"
    :kind
    type="mainnet"
  />
  <IconArbitrum
    v-else-if="chain === ARBITRUM_SEPOLIA"
    :kind
    type="sepolia"
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
    type="sepolia"
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
import IconMode from './icon/chain/Mode.vue';
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
} from '@/utils/chains.js';

defineProps<{
  chain: Chain;
  kind: Kind;
}>();
</script>
