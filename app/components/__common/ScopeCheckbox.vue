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
  transition:
    border-color 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-xs);
  background: transparent;
  box-shadow: inset var(--elevation-low);
}

label:hover .root {
  border-color: var(--color-border-quaternary);
  box-shadow:
    inset var(--elevation-low),
    var(--elevation-medium);
}

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  filter: drop-shadow(0 1px 1px rgb(0 0 0 / 10%));
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
