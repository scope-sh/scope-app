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
  width: 160px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  text-transform: uppercase;
}

@media (width >= 768px) {
  .label {
    width: 224px;
  }
}
</style>
