<template>
  <div class="notice">
    <div class="info">
      This EOA delegates to <LinkAddress :address="delegation" />.
    </div>
    <div class="toggle">
      <ScopeCheckbox
        :model-value="showAsDelegatee"
        label="Show as delegatee"
        @update:model-value="handleToggleUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCheckbox from '@/components/__common/ScopeCheckbox.vue';

const showAsDelegatee = defineModel<boolean>('showAsDelegatee', {
  required: true,
});

defineProps<{
  delegation: Address;
}>();

function handleToggleUpdate(newValue: boolean): void {
  showAsDelegatee.value = newValue;
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
  gap: var(--spacing-4);
  align-items: center;
}
</style>
