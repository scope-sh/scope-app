<template>
  <div
    ref="el"
    class="root"
    :class="{ expanded: isHovered }"
    @mouseenter="isHovered = true"
    @mousemove="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <TransitionGroup name="slide-fade">
      <Toast
        v-for="(toast, index) in value"
        :key="toast.id"
        :before="value.length - index - 1"
        :value="toast"
        :expanded="isHovered"
        @close="hideToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import Toast from './Toast.vue';

import type { Toast as ToastData } from '@/utils/ui';

const isHovered = ref(false);

const { value } = defineProps<{
  value: ToastData[];
}>();

const emit = defineEmits<{
  hide: [index: number];
}>();

function hideToast(index: number): void {
  emit('hide', index);
}

const el = ref<HTMLElement | null>(null);

const count = computed(() => value.length);
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

.root {
  --toast-height: 60px;
  --gap: var(--spacing-4);
  --width: 320px;

  position: fixed;
  right: var(--spacing-10);
  bottom: var(--spacing-10);
  flex-direction: column;
  width: var(--width);
  margin: var(--spacing-2);
  transition: all 0.25s ease-in-out;
  border-radius: var(--border-radius-m);

  &.expanded {
    height: calc(
      var(--toast-height) * v-bind('count') + var(--gap) * (v-bind('count') - 1)
    );
  }
}
</style>
