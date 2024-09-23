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
      :value="value"
      compact
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';

const { value } = defineProps<{
  value: string;
}>();

const dirs = computed(() => value.split('/').slice(0, -1));
const name = computed(() => value.split('/').pop());
</script>

<style scoped>
.strip {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.path {
  --spacing: var(--spacing-2);

  display: flex;
  gap: var(--spacing);
  flex-wrap: wrap;
}

.dir {
  color: var(--color-text-secondary);

  &:not(:last-child)::after {
    content: '/';
    margin-left: var(--spacing);
  }
}
</style>
