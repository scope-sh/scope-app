<template>
  <div :class="{ small: size === 'small' }">{{ value }}</div>
</template>

<script setup lang="ts">
const { size = 'medium' } = defineProps<{
  value: string;
  size?: Size;
}>();
</script>

<script lang="ts">
type Size = 'small' | 'medium';
</script>

<style scoped>
div {
  margin: var(--spacing-6) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  text-align: center;

  &.small {
    margin: var(--spacing-4) 0;
    font-size: var(--font-size-s);
  }
}
</style>
