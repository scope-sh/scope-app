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
        The hosted version will be sunset on {{ formattedSunsetDate }}.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const SUNSET_DATE = new Date('2025-08-03');
const DAY = 24 * 60 * 60 * 1000;
const formattedSunsetDate = SUNSET_DATE.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

// Show banner 30 days before sunset
const isVisible = computed(() => {
  const date = new Date(SUNSET_DATE.getTime() - 30 * DAY);
  return date < new Date();
});

// Show as a warning 14 days before sunset
const isWarning = computed(() => {
  const date = new Date(SUNSET_DATE.getTime() - 14 * DAY);
  return date < new Date();
});

// Show as an error 7 days before sunset
const isError = computed(() => {
  const date = new Date(SUNSET_DATE.getTime() - 7 * DAY);
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
