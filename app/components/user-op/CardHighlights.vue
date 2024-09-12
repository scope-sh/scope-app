<template>
  <BaseCard
    v-if="items.length > 0"
    :items
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import BaseCard from '@/components/__common/CardHighlights.vue';
import useLabels from '@/composables/useLabels';
import type { UserOpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { getUserOp, type Item } from '@/utils/context/highlights';

const { getLabel } = useLabels();

const props = defineProps<{
  userOp: UserOpUnpacked;
}>();

const items = computed<Item[]>(() => getUserOp(props.userOp, getLabel));
</script>
