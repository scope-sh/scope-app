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
import type { UserOpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { getUserOp, getLogs, type Item } from '@/utils/context/highlights';

const { getLabel } = useLabels();

const props = defineProps<{
  userOp: UserOpUnpacked;
  logs: Log[];
}>();

const items = computed<Item[]>(() => {
  const userOpItems = getUserOp(props.userOp, getLabel);
  const logItems = getLogs(props.logs, getLabel);
  return [...userOpItems, ...logItems];
});
</script>
