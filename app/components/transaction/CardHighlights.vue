<template>
  <BaseCard
    v-if="items.length > 0"
    :items
  />
</template>

<script setup lang="ts">
import type { Transaction, Log } from 'viem';
import { computed } from 'vue';

import BaseCard from '@/components/__common/CardHighlights.vue';
import useLabels from '@/composables/useLabels';
import type { Item } from '@/utils/context/highlights';
import { getContractDeployment, getLogs } from '@/utils/context/highlights';

const { getLabel } = useLabels();

const props = defineProps<{
  transaction: Transaction;
  logs: Log[];
}>();

const items = computed<Item[]>(() => {
  const contractDeployment = getContractDeployment(props.transaction);
  const logItems = getLogs(props.logs, getLabel);
  return [...contractDeployment, ...logItems];
});
</script>
