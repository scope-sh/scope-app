<template>
  <Erc20Lens
    v-if="labelTypeId === 'erc20' || labelTypeId === 'wrapped'"
    :address="address"
  />
  <SafeV1_4_1Lens
    v-if="labelTypeId === 'safe-v1.4.1-account'"
    :address="address"
  />
  <UniswapV2PoolLens
    v-else-if="labelTypeId === 'uniswap-v2-pool'"
    :address="address"
  />
  <UniswapV3PoolLens
    v-else-if="labelTypeId === 'uniswap-v3-pool'"
    :address="address"
  />
</template>

<script setup lang="ts">
import { Address } from 'viem';

import type { LabelId } from '@/services/api';

import Erc20Lens from './lenses/Erc20Lens.vue';
import SafeV1_4_1Lens from './lenses/SafeV1_4_1Lens.vue';
import UniswapV2PoolLens from './lenses/UniswapV2PoolLens.vue';
import UniswapV3PoolLens from './lenses/UniswapV3PoolLens.vue';

defineProps<{
  labelTypeId: LabelId;
  address: Address;
}>();
</script>
