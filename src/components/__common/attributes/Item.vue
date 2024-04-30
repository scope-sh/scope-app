<template>
  <div class="item">
    <slot />
  </div>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-l);
}
</style>
