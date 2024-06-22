<template>
  <div
    class="file"
    :class="{ selected: isSelected }"
    @click="handleClick"
  >
    {{ file }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  file: string;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

function handleClick(): void {
  emit('select');
}
</script>

<style scoped>
.file {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-light);
  cursor: pointer;
}

.file.selected {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-heavy);
}

.file:hover {
  color: var(--color-text-primary);
}
</style>
