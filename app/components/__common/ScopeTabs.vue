<template>
  <Tabs.Root
    :model-value="modelValue"
    class="root"
    @update:model-value="handleUpdate"
  >
    <Tabs.List as-child>
      <div class="list">
        <Tabs.Trigger
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          as-child
        >
          <button class="tab">
            {{ option.label }}
          </button>
        </Tabs.Trigger>
      </div>
    </Tabs.List>
  </Tabs.Root>
</template>

<script setup lang="ts">
import { Tabs } from 'reka-ui/namespaced';

const model = defineModel<Item['value']>();

defineProps<{
  options: Item[];
}>();

function handleUpdate(value: string): void {
  model.value = value;
}
</script>

<script lang="ts">
interface Item {
  value: string;
  label: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { Item };
</script>

<style scoped>
.root {
  display: inline-flex;
  flex-direction: column;
}

.list {
  display: inline-flex;
  gap: var(--spacing-7);
}

.tab {
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-heavy);
  cursor: pointer;

  &[data-state='active'] {
    color: var(--color-text-primary);
  }

  &:hover {
    color: var(--color-text-primary);
  }
}
</style>
