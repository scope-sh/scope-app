<template>
  <Tooltip.Provider>
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
import { Tooltip } from 'radix-vue/namespaced';
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
  max-height: var(--radix-tooltip-content-available-height);
  padding: var(--spacing-3) var(--spacing-4);
  overflow-y: auto;
  transform-origin: var(--radix-tooltip-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  background: oklch(from var(--color-background-primary) l c h / 80%);
  box-shadow: 1px 2px 0 0 rgb(0 0 0 / 20%);
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
