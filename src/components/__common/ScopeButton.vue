<template>
  <button
    :class="{
      primary: kind === 'primary',
      minimal: kind === 'minimal',
    }"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
type Kind = 'primary' | 'minimal';

defineProps<{
  kind: Kind;
}>();
</script>

<style scoped>
button {
  border-radius: var(--border-radius-s);
  background-color: transparent;
  cursor: pointer;

  &.primary {
    padding: var(--spacing-3) var(--spacing-5);
    border: 1px solid var(--color-border-secondary);
    color: var(--color-text-primary);
    font-size: var(--font-size-m);

    &:hover {
      border-color: var(--color-border-primary);
    }
  }

  &.minimal {
    padding: var(--spacing-1) var(--spacing-3);
    border: 1px solid var(--color-border-tertiary);
    color: var(--color-text-secondary);
    font-size: var(--font-size-s);

    &:hover {
      border-color: var(--color-border-quaternary);
    }
  }
}
</style>
