<template>
  <div class="item">
    <slot />
  </div>
</template>

<style scoped>
.item {
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-l);
  gap: var(--spacing-2);
}

@media (width >= 768px) {
  .item {
    gap: 0;
    flex-direction: row;
    align-items: center;
  }
}
</style>
