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

const { transaction, logs } = defineProps<{
  transaction: Transaction;
  logs: Log[];
}>();

const { getLabel } = useLabels();

const items = computed<Item[]>(() => {
  const contractDeployment = getContractDeployment(transaction);
  const logItems = getLogs(logs, getLabel);
  return [...contractDeployment, ...logItems];
});
</script>
