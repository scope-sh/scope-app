<template>
  <div class="strip">
    <div class="path">
      <span
        v-for="dir in dirs"
        :key="dir"
        class="dir"
      >
        {{ dir }}
      </span>
      <span>{{ name }}</span>
    </div>
    <ButtonCopy
      :value="props.value"
      compact
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';

const props = defineProps<{
  value: string;
}>();

const dirs = computed(() => props.value.split('/').slice(0, -1));
const name = computed(() => props.value.split('/').pop());
</script>

<style scoped>
.strip {
  display: flex;
  gap: var(--spacing-4);
}

.path {
  --spacing: var(--spacing-2);

  display: flex;
  gap: var(--spacing);
}

.dir {
  color: var(--color-text-secondary);

  &:not(:last-child)::after {
    content: '/';
    margin-left: var(--spacing);
  }
}
</style>
