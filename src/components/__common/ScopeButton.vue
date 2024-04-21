<template>
  <button>
    <slot></slot>
  </button>
</template>

<style scoped>
button {
  padding: var(--spacing-3) var(--spacing-5);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  background-color: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-m);
  cursor: pointer;

  &:hover {
    border-color: var(--color-border-primary);
  }
}
</style>
