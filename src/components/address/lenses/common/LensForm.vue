<template>
  <form @submit.prevent="handleSubmit">
    <slot name="input" />
    <LensButton @click="handleClick" />
    <slot name="output"> &nbsp; </slot>
  </form>
</template>

<script setup lang="ts">
import LensButton from './LensButton.vue';

const emit = defineEmits<{
  query: [];
}>();

function handleClick(): void {
  emit('query');
}

function handleSubmit(): void {
  emit('query');
}
</script>

<style scoped>
form {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}
</style>
