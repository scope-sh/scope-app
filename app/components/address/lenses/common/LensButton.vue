<template>
  <button
    :disabled="loading"
    @click="handleClick"
  >
    <ScopeIcon kind="arrow-right" />
  </button>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

function handleClick(): void {
  emit('click');
}
</script>

<style scoped>
button {
  width: 16px;
  height: 16px;
  padding: 0;
  transition: opacity 0.2s;
  border: none;
  opacity: 0.4;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.1;
  }
}
</style>
