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
</template>

<script setup lang="ts">
import {
  Chain,
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
} from '@/utils/chains';

import IconArbitrum from './icon/chain/Arbitrum.vue';
import IconBase from './icon/chain/Base.vue';
import IconEthereum from './icon/chain/Ethereum.vue';
import IconOptimism from './icon/chain/Optimism.vue';
import IconPolygon from './icon/chain/Polygon.vue';
import { Kind } from './icon/chain/kind';

defineProps<{
  chain: Chain;
  kind: Kind;
}>();
</script>
