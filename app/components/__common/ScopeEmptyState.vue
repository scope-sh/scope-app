<template>
  <div class="root">
    <ScopeLabelEmptyState :value="label" />
    <div class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScopeLabelEmptyState from './ScopeLabelEmptyState.vue';

defineProps<{
  label: string;
}>();
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
  align-items: center;
}

.actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
}
</style>
