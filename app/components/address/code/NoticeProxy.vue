<template>
  <div class="notice">
    <div class="info">
      This is a proxy contract.
      <template v-if="implementation">
        Its implementation is
        <LinkAddress :address="implementation" />.
      </template>
    </div>
    <div class="toggle">
      <ScopeCheckbox
        :model-value="showAsProxy"
        label="Show as proxy"
        @update:model-value="handleToggleUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCheckbox from '@/components/__common/ScopeCheckbox.vue';

const showAsProxy = defineModel<boolean>('showAsProxy', {
  required: true,
});

defineProps<{
  implementation: Address | null;
}>();

function handleToggleUpdate(newValue: boolean): void {
  showAsProxy.value = newValue;
}
</script>

<style scoped>
.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-7);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.info {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}
</style>
