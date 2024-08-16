<template>
  <div>
    <div class="link">
      <slot />
      <ButtonCopy
        v-if="type !== 'minimal'"
        :value
        class="button"
        compact
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ButtonCopy from './ButtonCopy.vue';
import type { Type } from './ScopeLinkInternal.vue';

defineProps<{
  value: string;
  type: Type;
}>();
</script>

<style scoped>
.link {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  max-width: 100%;

  .button {
    opacity: 0.4;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
