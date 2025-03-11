<template>
  <div class="item">
    <slot />
  </div>
</template>

<style scoped>
.item {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  font-size: var(--font-size-l);
}

@media (width >= 768px) {
  .item {
    gap: 0;
    flex-direction: row;
    align-items: center;
  }
}
</style>
