<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{ success: status === 'executed' }"
    >
      <ScopeIcon
        v-if="status === 'executed'"
        kind="check-circled"
        class="icon"
      />
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { BlockStatus } from '@/services/evm.js';

const { status } = defineProps<{
  status: BlockStatus;
}>();

const label = computed(() => {
  const map: Record<BlockStatus, string> = {
    executed: 'Executed',
  };
  return map[status];
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
  border-color: rgb(from var(--color-success) r g b / 60%);
  background: rgb(from var(--color-success) r g b / 10%);
  color: var(--color-success);
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
