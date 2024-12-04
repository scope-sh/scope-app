<template>
  <!-- Generally, the list should go from the list generic type to the most one -->
  <Erc7579ModuleLens
    v-if="hasLabelTypeId('erc7579-module')"
    :address="address"
  />
  <Erc20Lens
    v-else-if="hasLabelTypeId('erc20')"
    :address="address"
  />
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import Erc20Lens from './lenses/Erc20Lens.vue';
import Erc7579ModuleLens from './lenses/Erc7579ModuleLens.vue';

import type { LabelTypeId } from '@/services/api.js';

const { labelTypes } = defineProps<{
  labelTypes: LabelTypeId[];
  address: Address;
}>();

function hasLabelTypeId(labelTypeId: LabelTypeId): boolean {
  return labelTypes.includes(labelTypeId);
}
</script>
