<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{
        success: status === true,
        error: status !== true,
      }"
    >
      <ScopeIcon
        v-if="status === true"
        kind="check-circled"
        class="icon"
      />
      <ScopeIcon
        v-else
        kind="cross-circled"
        class="icon"
      />
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { CallStatus } from '@/components/__common/TreeInternalCalls.vue';

const props = defineProps<{
  status: CallStatus;
}>();

const label = computed(() => {
  if (props.status === true) {
    return 'Success';
  } else if (props.status.type === 'Revert') {
    return 'Reverted';
  } else if (props.status.type === 'OOG') {
    return 'Out of gas';
  } else {
    return 'Unknown error';
  }
});
</script>

<style scoped>
.wrapper {
  display: flex;
}

.status {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-s);
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
  width: 14px;
  height: 14px;
}

.address {
  display: flex;
  gap: var(--spacing-3);
}
</style>
