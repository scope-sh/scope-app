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
  gap: var(--spacing-4);
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  overflow-x: hidden;
  text-overflow: ellipsis;

  @media (width >= 768px) {
    overflow-x: initial;
    text-overflow: initial;
  }
}

.note {
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}
</style>
