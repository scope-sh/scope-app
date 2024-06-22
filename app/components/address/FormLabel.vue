<template>
  <label :for="id">{{ value }}</label>
</template>

<script setup lang="ts">
defineProps<{
  id?: string;
  value: string;
}>();
</script>

<style scoped>
label {
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
}
</style>
