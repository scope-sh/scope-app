<template>
  <div
    class="button"
    @click="copy"
  >
    <ScopeIcon
      v-if="ready"
      class="icon"
      kind="copy"
    />
    <ScopeIcon
      v-else
      class="icon"
      kind="check"
    />
  </div>
</template>

<script setup lang="ts">
import { useTimeout } from '@vueuse/core';
import { onMounted } from 'vue';

import ScopeIcon from './ScopeIcon.vue';

const props = defineProps<{
  value: string;
}>();

onMounted(() => {
  stop();
});

const { ready, start, stop } = useTimeout(2000, { controls: true });

function copy(): void {
  navigator.clipboard.writeText(props.value);
  start();
}
</script>

<style scoped>
.button {
  cursor: pointer;
}

.icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-secondary);
}
</style>
