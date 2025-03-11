<template>
  <div class="view">
    <Combobox.Root
      v-model="model"
      class="root"
      :filter-function="filterOptions"
    >
      <Combobox.Anchor class="anchor">
        <Combobox.Input
          class="input"
          placeholder="Search functions…"
          :display-value="(val) => (val ? val.label : '')"
        />
        <Combobox.Cancel
          v-if="model"
          @click="handleCancelClick"
        >
          <ScopeIcon
            kind="cross"
            class="icon-close"
          />
        </Combobox.Cancel>
        <Combobox.Trigger>
          <ScopeIcon
            kind="chevron-down"
            class="icon"
          />
        </Combobox.Trigger>
      </Combobox.Anchor>

      <Combobox.Content class="content">
        <Combobox.Viewport class="viewport">
          <Combobox.Empty>
            <ScopeLabelEmptyState
              value="No functions found"
              size="small"
            />
          </Combobox.Empty>

          <Combobox.Group
            v-for="(group, groupIndex) of nonEmptyOptions"
            :key="groupIndex"
          >
            <Combobox.Label class="label"> {{ group.label }} </Combobox.Label>

            <Combobox.Item
              v-for="(option, optionIndex) in group.options"
              :key="optionIndex"
              class="item"
              :value="option"
            >
              <Combobox.ItemIndicator class="indicator">
                <ScopeIcon
                  kind="check"
                  class="icon"
                />
              </Combobox.ItemIndicator>
              <span>
                {{ option.label }}
              </span>
            </Combobox.Item>
            <Combobox.Separator
              v-if="groupIndex !== nonEmptyOptions.length - 1"
              class="separator"
            />
          </Combobox.Group>
        </Combobox.Viewport>
      </Combobox.Content>
    </Combobox.Root>
  </div>
</template>

<script setup lang="ts" generic="T">
import { Combobox } from 'reka-ui/namespaced';
import { computed } from 'vue';

import ScopeLabelEmptyState from './ScopeLabelEmptyState.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const model = defineModel<Option<T> | undefined>();

const { options } = defineProps<{
  options: OptionGroup<T>[];
}>();

const nonEmptyOptions = computed(() => {
  return options.filter((group) => group.options.length > 0);
});

function filterOptions(options: Option<T>[], query: string): Option<T>[] {
  return options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );
}

function handleCancelClick(): void {
  model.value = undefined;
}
</script>

<script lang="ts">
interface OptionGroup<T> {
  label: string;
  options: Option<T>[];
}

interface Option<T> {
  value: T;
  label: string;
}

export type { OptionGroup, Option };
</script>

<style scoped>
/* reset */
button,
input {
  all: unset;
}

.view {
  width: 200px;
}

.root {
  position: relative;
}

.anchor {
  display: inline-flex;
  gap: var(--spacing-3);
  align-items: center;
  width: 100%;
  padding: var(--spacing-4);
  border-radius: var(--border-radius-s);
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-m);
}

.anchor:hover {
  background-color: var(--color-background-tertiary);
}

.input {
  flex: 1;
  min-width: 100px;
  background: transparent;
  color: var(--color-text-primary);
}

.input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-close {
  width: 14px;
  height: 14px;
}

.icon {
  width: 16px;
  height: 16px;
}

.content {
  position: absolute;
  z-index: 1;
  min-width: 160px;
  max-height: 60vh;
  margin-top: var(--spacing-4);
  overflow: hidden;
  animation: content-show 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: var(--color-background-primary);
  box-shadow: var(--elevation-medium);
}

.viewport {
  padding: var(--spacing-3);
}

.item {
  display: flex;
  position: relative;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-10);
  border-radius: var(--border-radius-s);
  color: var(--color-text-primary);
  font-size: var(--font-size-m);
  cursor: pointer;
}

.item[data-disabled] {
  opacity: 0.4;
  pointer-events: none;
}

.item[data-highlighted] {
  outline: none;
  background-color: var(--color-background-secondary);
  color: var(--color-text-primary);
}

.label {
  padding: var(--spacing-3) var(--spacing-10);
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.separator {
  height: 1px;
  margin: var(--spacing-2) 0;
  background-color: var(--color-border-tertiary);
}

.indicator {
  display: inline-flex;
  position: absolute;
  left: 0;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}
</style>
