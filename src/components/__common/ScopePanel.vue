<template>
  <div class="panel">
    <div class="header">
      <h2 class="title">{{ title }}</h2>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped>
.panel {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  padding: var(--spacing-8) var(--spacing-6);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-l);
}

@media (width >= 768px) {
  .panel {
    padding: var(--spacing-9) var(--spacing-8);
  }
}

.header {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.title {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-regular);
}

.content {
  display: flex;
  gap: var(--spacing-9);
  flex-direction: column;
}
</style>
