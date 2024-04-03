<template>
  <ScopeTooltip>
    <template #trigger>
      <slot name="trigger" />
    </template>
    <template #default>
      <div class="content">
        <div>{{ label }}</div>
        <ScopeShortcutGroup
          size="small"
          :shortcuts="shortcuts"
        />
      </div>
    </template>
  </ScopeTooltip>
</template>

<script setup lang="ts">
import { Shortcut } from '@/utils/shortcuts';

import ScopeShortcutGroup from './ScopeShortcutGroup.vue';
import ScopeTooltip from './ScopeTooltip.vue';

defineProps<{
  label: string;
  shortcuts: Shortcut[];
}>();
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-7);
  align-items: center;
}
</style>
