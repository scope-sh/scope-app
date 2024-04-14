<template>
  <input
    v-model="value"
    :placeholder
  />
</template>

<script setup lang="ts">
const value = defineModel<string>({
  required: true,
});

defineProps<{
  placeholder: string;
}>();
</script>

<style scoped>
input {
  padding: 1px 6px;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-s);

  &:focus {
    border-color: var(--color-border-quaternary);
  }
}
</style>
