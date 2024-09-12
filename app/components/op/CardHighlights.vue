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

const { getLabel } = useLabels();

const props = defineProps<{
  op: OpUnpacked;
  logs: Log[];
}>();

const items = computed<Item[]>(() => {
  const opItems = getOp(props.op, getLabel);
  const logItems = getLogs(props.logs, getLabel);
  return [...opItems, ...logItems];
});
</script>
