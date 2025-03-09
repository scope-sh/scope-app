<template>
  <div>
    <ToggleGroup.Root
      v-model="modelValue"
      type="single"
      class="list"
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
          v-if="option.icon"
          :kind="option.icon"
          class="icon"
        />
        <span
          v-if="option.label"
          class="label"
          >{{ option.label }}</span
        >
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  </div>
</template>

<script setup lang="ts">
import { ToggleGroup } from 'reka-ui/namespaced';

import ScopeIcon from './ScopeIcon.vue';
import type { Kind as IconKind } from './icon/general';

const modelValue = defineModel<string>();

defineProps<{
  options: Option[];
}>();
</script>

<script lang="ts">
interface Option<T = string> {
  value: T;
  icon?: IconKind;
  label?: string;
}

// eslint-disable-next-line import/prefer-default-export
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
  margin: 3px;
}

.label {
  margin: 3px 6px;
}
</style>
