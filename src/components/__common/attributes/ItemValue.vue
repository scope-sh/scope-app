<template>
  <div class="value">
    <slot />
    <span
      v-if="note"
      class="note"
    >
      {{ note }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  note?: string;
}>();
</script>

<style scoped>
.value {
  display: flex;
  flex: 1;
  gap: var(--spacing-4);
  align-items: baseline;
}

.note {
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}
</style>
