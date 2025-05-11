<template>
  <div
    v-if="isVisible"
    class="banner"
  >
    <div class="message">
      Scope is now
      <a
        href="https://github.com/scope-sh/scope-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        open source</a
      >!
      <span
        class="sunset"
        :class="{ warning: isWarning, error: isError }"
      >
        The hosted version will be sunset on July 19th.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Only show after June 19th
const isVisible = computed(() => {
  const date = new Date('2025-06-19');
  return date < new Date();
});

// Show as a warning after July 5th
const isWarning = computed(() => {
  const date = new Date('2025-07-05');
  return date < new Date();
});

// Show as an error after July 12th
const isError = computed(() => {
  const date = new Date('2025-07-12');
  return date < new Date();
});
</script>

<style scoped>
.banner {
  display: flex;
  gap: var(--spacing-7);
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-tertiary);
  color: var(--color-text-secondary);

  @media (width >= 992px) {
    padding: var(--spacing-6);
  }

  a {
    color: var(--color-text-primary);
  }

  .sunset.warning {
    color: var(--color-accent);
  }

  .sunset.error {
    color: var(--color-error);
  }
}
</style>
