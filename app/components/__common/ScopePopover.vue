<template>
  <Popover.Root>
    <Popover.Trigger as-child>
      <button class="trigger">
        <slot name="trigger" />
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        side="bottom"
        :side-offset="8"
      >
        <div class="panel">
          <slot />
        </div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>

<script setup lang="ts">
import { Popover } from 'reka-ui/namespaced';
</script>

<style scoped>
.trigger {
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  cursor: pointer;
}

.panel {
  max-height: var(--reka-popover-content-available-height);
  padding: var(--spacing-7);
  overflow-y: auto;
  transform-origin: var(--reka-popover-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: oklch(from var(--color-background-primary) l c h / 60%);
  box-shadow: var(--elevation-medium);
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
