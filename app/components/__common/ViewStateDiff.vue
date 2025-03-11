<template>
  <div class="root">
    <div
      v-for="(addressDiff, address) in diff"
      :key="address"
    >
      <ViewStateDiffAddress
        :address
        :diff="addressDiff"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ViewStateDiffAddress from './ViewStateDiffAddress.vue';

import type { TransactionStateDiff } from '@/services/evm';

defineProps<{
  diff: TransactionStateDiff;
}>();
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-8);
  flex-direction: column;
  padding: var(--spacing-8);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
}
</style>
