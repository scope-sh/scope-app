<template>
  <ScopeCard>
    <div class="list">
      <div
        v-for="(item, itemIndex) in items"
        :key="itemIndex"
        class="item"
      >
        <div
          v-for="(part, partIndex) in item"
          :key="partIndex"
        >
          <template v-if="part.type === 'text'">
            <span>{{ part.value }}</span>
          </template>
          <template v-else-if="part.type === 'address'">
            <LinkAddress :address="part.address" />
          </template>
        </div>
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';

defineProps<{
  items: Item[];
}>();
</script>

<script lang="ts">
interface ItemPartText {
  type: 'text';
  value: string;
}

interface ItemPartAddress {
  type: 'address';
  address: Address;
}

type ItemPart = ItemPartText | ItemPartAddress;

type Item = ItemPart[];

// eslint-disable-next-line import/prefer-default-export
export type { Item };
</script>

<style scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.item {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}
</style>
