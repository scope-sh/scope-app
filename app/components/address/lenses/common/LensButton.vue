<template>
  <button @click="handleClick">
    <ScopeIcon kind="arrow-right" />
  </button>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const emit = defineEmits<{
  click: [];
}>();

function handleClick(): void {
  emit('click');
}
</script>

<style scoped>
button {
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  opacity: 0.8;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}

button:hover {
  opacity: 1;
}
</style>
