<template>
  <form @submit.prevent="handleSubmit">
    <div class="input">
      <slot name="input" />
      <LensButton :loading />
    </div>
    <slot name="output"> &nbsp; </slot>
  </form>
</template>

<script setup lang="ts">
import LensButton from './LensButton.vue';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  query: [];
}>();

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
