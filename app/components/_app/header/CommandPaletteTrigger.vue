<template>
  <button @click="handleClick">
    <div class="label">
      <ScopeIcon
        kind="magnifying-glass"
        class="icon"
      />
      Explore
    </div>
    <ScopeShortcut
      v-if="!isMobile"
      :shortcut="[{ key: 'K', isMeta: true }]"
      size="regular"
    />
  </button>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeShortcut from '@/components/__common/ScopeShortcut.vue';
import useUiStore from '@/stores/ui';

const uiStore = useUiStore();

function handleClick(): void {
  uiStore.setPaletteOpen(true);
}

const isMobile = /(iPhone|android)/i.test(navigator.userAgent);
</script>

<style scoped>
button {
  --transition: 0.25s ease-in-out;

  display: flex;
  gap: var(--spacing-7);
  align-items: center;
  padding: var(--spacing-1) var(--spacing-5);
  transition: var(--transition);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  background: transparent;
  box-shadow: var(--elevation-low);
  cursor: pointer;
}

button:hover {
  border-color: var(--color-border-quaternary);
  box-shadow: var(--elevation-medium);
}

.label {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  transition: var(--transition);
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

button:hover .label {
  color: var(--color-text-primary);
}

.icon {
  width: 16px;
  height: 16px;
}

.key {
  padding: var(--spacing-2);
  border-radius: var(--border-radius-xs);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
}
</style>
