<template>
  <div class="list">
    <slot />
  </div>
</template>

<style scoped>
.list {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
  font-weight: var(--font-weight-light);
}
</style>
