<template>
  <Tooltip.Provider
    :delay-duration
    :disable-closing-trigger
  >
    <Tooltip.Root>
      <Tooltip.Trigger as-child>
        <button class="trigger">
          <slot name="trigger" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          :side-offset="4"
        >
          <div class="panel">
            <slot />
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
</template>

<script setup lang="ts">
import { Tooltip } from 'reka-ui/namespaced';
import { computed } from 'vue';

type Delay = 'small' | 'medium' | 'large';

const { delay, disableClosingTrigger = false } = defineProps<{
  delay: Delay;
  disableClosingTrigger?: boolean;
}>();

const delayDuration = computed<number>(() => {
  switch (delay) {
    case 'small':
      return 300;
    case 'medium':
      return 600;
    case 'large':
      return 1200;
  }
  return 0;
});
</script>

<style scoped>
.trigger {
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.panel {
  max-height: var(--reka-tooltip-content-available-height);
  padding: var(--spacing-3) var(--spacing-4);
  overflow-y: auto;
  transform-origin: var(--reka-tooltip-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  background: oklch(from var(--color-background-primary) l c h / 80%);
  box-shadow:
    0 2px 4px rgb(0 0 0 / 8%),
    0 1px 2px rgb(0 0 0 / 12%);
  font-size: var(--font-size-s);
  text-align: center;
  text-wrap: balance;
  backdrop-filter: blur(4px);
}

@keyframes scale-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
