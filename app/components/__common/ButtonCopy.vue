<template>
  <div
    class="button"
    :class="{ compact }"
    @click="copy"
  >
    <ScopeIcon
      v-if="ready"
      class="icon"
      kind="copy"
      :class="{ compact }"
    />
    <ScopeIcon
      v-else
      class="icon"
      kind="check"
      :class="{ compact }"
    />
  </div>
</template>

<script setup lang="ts">
import { useTimeout } from '@vueuse/core';
import { onMounted } from 'vue';

import ScopeIcon from './ScopeIcon.vue';

const { value, compact = false } = defineProps<{
  value: string;
  compact?: boolean;
}>();

onMounted(() => {
  stop();
});

const { ready, start, stop } = useTimeout(2000, { controls: true });

function copy(): void {
  navigator.clipboard.writeText(value);
  start();
}
</script>

<style scoped>
.button {
  padding: 8px;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  cursor: pointer;
}

.button:hover {
  border: 1px solid var(--color-border-quaternary);
}

.button.compact {
  padding: 2px;
  border: none;
}

.icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
}

.icon.compact {
  width: 14px;
  height: 14px;
}
</style>
