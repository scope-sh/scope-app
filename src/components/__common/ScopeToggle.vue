<template>
  <div>
    <ToggleGroup.Root
      :model-value="modelValue"
      class="list"
      @update:model-value="handleModelValueUpdate"
    >
      <ToggleGroup.Item
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        class="item"
        :class="{
          active: modelValue === option.value,
        }"
      >
        <ScopeIcon
          :kind="option.icon"
          class="icon"
        />
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  </div>
</template>

<script setup lang="ts">
import { ToggleGroup } from 'radix-vue/namespaced';

import ScopeIcon from './ScopeIcon.vue';
import type { Kind as IconKind } from './icon/general';

defineProps<{
  options: Option[];
}>();

const modelValue = defineModel<string>();

function handleModelValueUpdate(value: string | undefined): void {
  if (!value) {
    return;
  }
  modelValue.value = value;
}
</script>

<script lang="ts">
interface Option<T = string> {
  value: T;
  icon: IconKind;
}

export type { Option };
</script>

<style scoped>
.list {
  display: flex;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-s);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.item.active {
  color: var(--color-text-primary);
}

.item:hover {
  background: var(--color-background-secondary);
}

.icon {
  width: 16px;
  height: 16px;
}
</style>
