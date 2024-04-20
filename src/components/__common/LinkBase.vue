<template>
  <div class="link">
    <slot />
    <LinkButtonCopy
      v-if="type === 'normal'"
      :value
      class="button"
    />
  </div>
</template>

<script setup lang="ts">
import LinkButtonCopy from './LinkButtonCopy.vue';
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
  gap: var(--spacing-4);

  .button {
    display: none;
    cursor: pointer;
  }

  &:hover {
    .button {
      display: block;
    }
  }
}
</style>
