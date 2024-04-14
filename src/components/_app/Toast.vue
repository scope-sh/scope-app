<template>
  <Transition name="slide-fade">
    <div
      v-if="value"
      class="toast"
    >
      <div class="content">
        <ScopeIcon
          v-if="value.type === 'success'"
          :kind="'check-circled'"
          class="icon"
        />
        <ScopeIcon
          v-if="value.type === 'error'"
          :kind="'cross-circled'"
          class="icon"
        />
        <span class="message">{{ value.message }}</span>
      </div>
      <ScopeIcon
        :kind="'cross'"
        class="icon-close"
        @click="close"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { Toast } from '@/utils/ui';

defineProps<{
  value: Toast | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

function close(): void {
  emit('close');
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease-in-out;
}

.slide-fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(40%);
  opacity: 0;
}

.toast {
  --icon-size: 20px;
  --icon-close-size: 14px;
  --toast-padding: var(--spacing-8);
  --item-gap: var(--spacing-6);

  display: flex;
  gap: var(--item-gap);
  position: fixed;
  right: var(--spacing-10);
  bottom: var(--spacing-10);
  align-items: center;
  justify-content: space-between;
  width: 320px;
  padding: var(--toast-padding);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: oklch(from var(--color-background-primary) l c h / 60%);
  backdrop-filter: blur(4px);
}

.content {
  display: flex;
  align-items: center;
  gap: var(--item-gap);
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
}

.message {
  width: calc(
    320px - var(--icon-size) - var(--icon-close-size) - var(--item-gap) -
      var(--item-gap) - 2 * var(--toast-padding)
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
