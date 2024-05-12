<template>
  <div class="link">
    <slot />
    <ButtonCopy
      v-if="type === 'normal'"
      :value
      class="button"
      compact
    />
  </div>
</template>

<script setup lang="ts">
import ButtonCopy from './ButtonCopy.vue';
import { Type } from './ScopeLinkInternal.vue';

defineProps<{
  value: string;
  type: Type;
}>();
</script>

<style scoped>
.link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);

  .button {
    opacity: 0.4;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
