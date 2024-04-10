<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{
        success: status === 'success' || status === null,
        error: status === 'reverted',
      }"
    >
      <ScopeIcon
        v-if="status === 'success' || status === null"
        :kind="'check-circled'"
        class="icon"
      />
      <ScopeIcon
        v-else-if="status === 'reverted'"
        :kind="'cross-circled'"
        class="icon"
      />
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { TransactionStatus } from '@/services/evm';

const props = defineProps<{
  status: TransactionStatus | null;
}>();

const label = computed(() => {
  if (!props.status) {
    return 'Executed';
  }
  const map: Record<TransactionStatus, string> = {
    success: 'Success',
    reverted: 'Reverted',
  };
  return map[props.status];
});
</script>

<style scoped>
.wrapper {
  display: flex;
}

.status {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-m);
}

.status.success {
  border-color: var(--color-success);
  color: var(--color-success);
}

.status.error {
  border-color: var(--color-error);
  color: var(--color-error);
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
