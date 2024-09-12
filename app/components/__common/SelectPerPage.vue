<template>
  <div class="root">
    Per page
    <div class="control">
      <ScopeSelect
        :model-value="stringValue"
        :options="options"
        placeholder="Pages"
        @update:model-value="handleValueUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import ScopeSelect from '@/components/__common/ScopeSelect.vue';
import type { Option as SelectOption } from '@/components/__common/ScopeSelect.vue';

const value = defineModel<number>({
  required: true,
});

const stringValue = computed<string>(() => value.value.toString());

function handleValueUpdate(newValue: string): void {
  value.value = parseInt(newValue, 10);
}

const options = computed<SelectOption[]>(() => [
  {
    value: '10',
    label: '10',
  },
  {
    value: '20',
    label: '20',
  },
  {
    value: '50',
    label: '50',
  },
  {
    value: '100',
    label: '100',
  },
]);
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  font-size: var(--font-size-s);
}

.control {
  width: 60px;
}
</style>
