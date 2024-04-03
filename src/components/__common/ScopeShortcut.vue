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
import { ShortcutPart } from '@/utils/shortcuts';

import ScopeShortcutPart from './ScopeShortcutPart.vue';

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
}
</style>
