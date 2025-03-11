<template>
  <div
    v-if="value"
    class="toast"
    :class="{ expanded }"
  >
    <div class="content">
      <ScopeIcon
        v-if="value.type === 'success'"
        kind="check-circled"
        class="icon"
      />
      <ScopeIcon
        v-if="value.type === 'error'"
        kind="cross-circled"
        class="icon"
      />
      <span class="message">{{ value.message }}</span>
    </div>
    <ScopeIcon
      kind="cross"
      class="icon-close"
      @click="close"
    />
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useTimerFn from '@/composables/useTimerFn';
import type { Toast } from '@/utils/ui';
import { TOAST_DURATION } from '@/utils/ui';

const { expanded } = defineProps<{
  value: Toast | null;
  before: number;
  expanded: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

function close(): void {
  emit('close');
}

watch(
  () => expanded,
  (value) => {
    if (value) {
      pause();
    } else {
      resume();
    }
  },
);

const { pause, resume } = useTimerFn(() => {
  close();
}, TOAST_DURATION);
</script>

<style scoped>
.toast {
  --icon-size: 20px;
  --icon-close-size: 14px;
  --toast-padding: var(--spacing-8);
  --item-gap: var(--spacing-6);
  --item-width: 320px;
  --item-height: 60px;
  --gap: var(--spacing-4);

  display: flex;
  position: fixed;
  z-index: 10;
  right: var(--spacing-10);
  bottom: var(--spacing-10);
  align-items: center;
  justify-content: space-between;
  width: var(--item-width);
  height: var(--item-height);
  margin: 4px;
  padding: var(--toast-padding);
  transform: var(--y);
  transition:
    transform 400ms,
    opacity 400ms,
    height 400ms,
    box-shadow 200ms;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: oklch(from var(--color-background-primary) l c h / 60%);
  gap: var(--item-gap);
  backdrop-filter: blur(4px);

  &:not(.expanded) {
    --lift-amount: -8px;
    --scale: calc(1 - 0.05 * v-bind('before'));
    --y: translateY(calc(var(--lift-amount) * v-bind('before')))
      scale(var(--scale));
  }

  &.expanded {
    --y: translateY(
      calc(-1 * (var(--item-height) + var(--gap)) * v-bind('before'))
    );
  }
}

.content {
  display: flex;
  gap: var(--item-gap);
  align-items: center;
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
}

.message {
  width: calc(
    var(--item-width) - var(--icon-size) - var(--icon-close-size) -
      var(--item-gap) - var(--item-gap) - 2 * var(--toast-padding)
  );
  font-size: var(--font-size-m);
}

.icon-close {
  width: var(--icon-close-size);
  height: var(--icon-close-size);
  opacity: 0;
  cursor: pointer;
}

.toast:hover .icon-close {
  opacity: 0.8;
}

.toast:hover .icon-close:hover {
  opacity: 1;
}
</style>
