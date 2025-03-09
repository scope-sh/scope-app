<template>
  <label>
    <Checkbox.Root
      v-model="modelValue"
      as-child
    >
      <button class="root">
        <Checkbox.Indicator class="indicator">
          <ScopeIcon
            kind="check"
            class="icon"
          />
        </Checkbox.Indicator>
      </button>
    </Checkbox.Root>
    <span class="label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
import { Checkbox } from 'reka-ui/namespaced';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const modelValue = defineModel<boolean>('modelValue', {
  required: true,
});

defineProps<{
  label: string;
}>();
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
  user-select: none;
}

label:hover .label {
  color: var(--color-text-primary);
}
</style>
