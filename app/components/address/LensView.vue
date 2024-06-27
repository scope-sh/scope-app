<template>
  <!-- Generally, the list should go from the list generic type to the most one -->
  <DaimoAccount
    v-if="hasLabelTypeId('daimo-v1-account')"
    :address="address"
  />
  <KernelV3AccountLens
    v-else-if="hasLabelTypeId('kernel-v3-account')"
    :address="address"
  />
  <SafeV1_4_1Lens
    v-if="hasLabelTypeId('safe-v1.4.1-account')"
    :address="address"
  />
  <UniswapV2PoolLens
    v-else-if="hasLabelTypeId('uniswap-v2-pool')"
    :address="address"
  />
  <UniswapV3PoolLens
    v-else-if="hasLabelTypeId('uniswap-v3-pool')"
    :address="address"
  />
  <Erc7579ModuleLens
    v-else-if="
      hasLabelTypeId('erc7579-module') || hasLabelTypeId('rhinestone-v1-module')
    "
    :address="address"
  />
  <Erc20Lens
    v-else-if="hasLabelTypeId('erc20')"
    :address="address"
  />
</template>

<script setup lang="ts">
import { type Address } from 'viem';

import DaimoAccount from './lenses/DaimoAccount.vue';
import Erc20Lens from './lenses/Erc20Lens.vue';
import Erc7579ModuleLens from './lenses/Erc7579ModuleLens.vue';
import KernelV3AccountLens from './lenses/KernelV3AccountLens.vue';
import SafeV1_4_1Lens from './lenses/SafeV1_4_1Lens.vue';
import UniswapV2PoolLens from './lenses/UniswapV2PoolLens.vue';
import UniswapV3PoolLens from './lenses/UniswapV3PoolLens.vue';

import type { LabelTypeId } from '@/services/api.js';

const props = defineProps<{
  labelTypes: LabelTypeId[];
  address: Address;
}>();

function hasLabelTypeId(labelTypeId: LabelTypeId): boolean {
  return props.labelTypes.includes(labelTypeId);
}
</script>
