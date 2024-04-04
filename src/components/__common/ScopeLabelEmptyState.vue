<template>
  <div>{{ value }}</div>
</template>

<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<style scoped>
div {
  margin: var(--spacing-6) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  text-align: center;
}
</style>
