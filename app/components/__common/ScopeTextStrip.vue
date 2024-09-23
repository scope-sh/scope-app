<template>
  <div class="view">{{ value }}</div>
</template>

<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<style scoped>
.view {
  width: 320px;
  padding: var(--spacing-4);
  border: 1px solid transparent;
  border-radius: var(--border-radius-s);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

@media (width >= 768px) {
  .view {
    width: 520px;
  }
}
</style>
