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
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-5);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-4);
}
</style>
