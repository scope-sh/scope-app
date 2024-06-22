<template>
  <ScopeCard>
    <div class="list">
      <div
        v-for="(action, actionIndex) in actions"
        :key="actionIndex"
        class="item"
      >
        <div
          v-for="(part, partIndex) in action"
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
import { type Address } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';

defineProps<{
  actions: Action[];
}>();
</script>

<script lang="ts">
interface ActionPartText {
  type: 'text';
  value: string;
}

interface ActionPartAddress {
  type: 'address';
  address: Address;
}

type ActionPart = ActionPartText | ActionPartAddress;

type Action = ActionPart[];

// eslint-disable-next-line import/prefer-default-export
export type { Action };
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
}
</style>
