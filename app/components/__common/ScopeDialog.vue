<template>
  <Dialog.Root
    :open="open"
    @update:open="handleOpen"
  >
    <Dialog.Portal>
      <Dialog.Overlay class="overlay" />
      <Dialog.Content as-child>
        <div
          class="content"
          :class="{ 'with-context': withContext }"
        >
          <VisuallyHidden as-child>
            <Dialog.Title>{{ title }}</Dialog.Title>
          </VisuallyHidden>
          <VisuallyHidden as-child>
            <Dialog.Description>{{ description }}</Dialog.Description>
          </VisuallyHidden>
          <div class="panel">
            <slot />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>

<script setup lang="ts">
import { VisuallyHidden } from 'reka-ui';
import { Dialog } from 'reka-ui/namespaced';

const open = defineModel<boolean>('open', {
  required: true,
});

defineProps<{
  title: string;
  description?: string;
  withContext?: boolean;
}>();

function handleOpen(value: boolean): void {
  if (!value) {
    open.value = false;
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  z-index: 1;
  background-color: rgb(0 0 0 / 40%);
  inset: 0;
  backdrop-filter: blur(4px);
}

.overlay[data-state='open'] {
  animation: overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes overlay-show {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.content {
  --top: 40%;

  position: fixed;
  z-index: 1;
  top: var(--top);
  left: 50%;
  width: 640px;
  max-width: 90vw;
  max-height: 80vh;
  transform: translate(-50%, -50%);

  @media (height < 680px) {
    --top: 50%;
  }

  &.with-context {
    top: calc(var(--top) - 12px);
  }
}

.content[data-state='open'] {
  animation: content-show 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes content-show {
  from {
    transform: translate(-50%, -48%) scale(0.96);
    opacity: 0;
  }

  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.panel {
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background-color: var(--color-background-primary);
  box-shadow: var(--elevation-high);
}

.panel:focus {
  outline: none;
}
</style>
