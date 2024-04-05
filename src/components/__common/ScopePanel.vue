<template>
  <div
    ref="rootEl"
    class="panel"
  >
    <div class="header">
      <h2 class="title">{{ title }}</h2>
      <div
        v-if="subtitle"
        class="subtitle"
      >
        {{ subtitle }}
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
  subtitle?: string;
}>();

const rootEl = ref<HTMLElement | null>(null);

defineExpose({
  rootEl,
});
</script>

<style scoped>
.panel {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  padding: var(--spacing-8) var(--spacing-6);
  scroll-margin-top: var(--spacing-8);
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
  flex-direction: column;
}

.title {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-regular);
}

.subtitle {
  font-size: var(--font-size-l);
  font-weight: var(--font-weight-light);
}

.content {
  display: flex;
  gap: var(--spacing-9);
  flex-direction: column;
}
</style>
