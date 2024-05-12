<template>
  <label>
    <CheckboxRoot
      :checked="modelValue"
      as-child
      @update:checked="handleModelValueUpdate"
    >
      <button class="root">
        <CheckboxIndicator class="indicator">
          <ScopeIcon
            kind="check"
            class="icon"
          />
        </CheckboxIndicator>
      </button>
    </CheckboxRoot>
    <span class="label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

defineProps<{
  modelValue: boolean;
  label: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

function handleModelValueUpdate(value: boolean): void {
  emit('update:modelValue', value);
}
</script>

<style scoped>
label {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.root {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-xs);
  background: transparent;
}

label:hover .root {
  border-color: var(--color-border-quaternary);
}

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
}

.label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  cursor: pointer;
}

label:hover .label {
  color: var(--color-text-primary);
}
</style>
