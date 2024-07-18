<template>
  <form @submit.prevent="handleSubmit">
    <div class="input">
      <slot name="input" />
      <LensButton @click="handleClick" />
    </div>
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
  gap: var(--spacing-4);
  flex-wrap: wrap;
  align-items: center;
}

.input {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
}

@media (width >= 768px) {
  .input {
    flex-wrap: nowrap;
  }
}
</style>
