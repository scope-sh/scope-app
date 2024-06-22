<template>
  <div class="card">
    <slot />
  </div>
</template>

<style scoped>
.card {
  padding: var(--spacing-7);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
}
</style>
