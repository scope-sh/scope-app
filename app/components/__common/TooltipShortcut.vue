<template>
  <ScopeTooltip delay="medium">
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #default>
      <div class="content">
        <div>{{ label }}</div>
        <ScopeShortcut
          size="small"
          :shortcut="shortcut"
        />
      </div>
    </template>
  </ScopeTooltip>
</template>

<script setup lang="ts">
import ScopeShortcut from './ScopeShortcut.vue';
import ScopeTooltip from './ScopeTooltip.vue';

import type { Shortcut } from '@/utils/shortcuts.js';

defineProps<{
  label: string;
  shortcut: Shortcut;
}>();
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-7);
  align-items: center;
}
</style>
