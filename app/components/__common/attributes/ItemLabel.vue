<template>
  <div class="label">{{ value }}</div>
</template>

<script setup lang="ts">
defineProps<{
  value: string;
}>();
</script>

<style scoped>
.label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  text-transform: uppercase;
}

@media (width >= 768px) {
  .label {
    width: 224px;
    font-size: var(--font-size-m);
  }
}
</style>
