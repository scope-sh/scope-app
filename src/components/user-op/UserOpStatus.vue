<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{ success: success, error: !success }"
    >
      <ScopeIcon
        v-if="success"
        :kind="'check-circled'"
        class="icon"
      />
      <ScopeIcon
        v-else
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

const props = defineProps<{
  success: boolean;
}>();

const label = computed(() => {
  return props.success ? 'Success' : 'Failed';
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
