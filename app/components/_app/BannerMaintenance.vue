<template>
  <div class="banner">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<style scoped>
.banner {
  display: flex;
  gap: var(--spacing-7);
  flex-direction: column;
  align-items: center;
  margin: var(--spacing-5) 8px;
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-l);
  color: var(--color-text-secondary);

  @media (width >= 992px) {
    margin: var(--spacing-10) 96px 16px;
    padding: var(--spacing-6);
  }
}
</style>
