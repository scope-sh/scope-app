<template>
  <BaseCard
    v-if="items.length > 0"
    :items
  />
</template>

<script setup lang="ts">
import type { Log } from 'viem';
import { computed } from 'vue';

import BaseCard from '@/components/__common/CardHighlights.vue';
import useLabels from '@/composables/useLabels';
import type { OpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { getOp, getLogs, type Item } from '@/utils/context/highlights';

const { op, logs } = defineProps<{
  op: OpUnpacked;
  logs: Log[];
}>();

const { getLabel } = useLabels();

const items = computed<Item[]>(() => {
  const opItems = getOp(op, getLabel);
  const logItems = getLogs(logs, getLabel);
  return [...opItems, ...logItems];
});
</script>
