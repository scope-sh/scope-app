<template>
  <div class="group">
    <ScopeShortcutPart
      v-for="part in shortcut"
      :key="part.key"
      :size="size"
      :value="part"
    />
  </div>
</template>

<script setup lang="ts">
import ScopeShortcutPart from './ScopeShortcutPart.vue';

import type { ShortcutPart } from '@/utils/shortcuts.js';

defineProps<{
  size: 'small' | 'regular';
  shortcut: ShortcutPart[];
}>();
</script>

<style scoped>
.group {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  color: var(--color-text-primary);
}
</style>
