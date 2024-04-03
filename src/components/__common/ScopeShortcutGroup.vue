<template>
  <div class="group">
    <ScopeShortcut
      v-for="shortcut in shortcuts"
      :key="shortcut.key"
      :size="size"
      :shortcut="shortcut"
    />
  </div>
</template>

<script setup lang="ts">
import { Shortcut } from '@/utils/shortcuts';

import ScopeShortcut from './ScopeShortcut.vue';

defineProps<{
  size: 'small' | 'regular';
  shortcuts: Shortcut[];
}>();
</script>

<style scoped>
.group {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}
</style>
