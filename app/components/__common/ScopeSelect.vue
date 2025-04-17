<template>
  <Select.Root
    :model-value="modelValue"
    :disabled
    @update:model-value="handleModelValueUpdate"
    @update:open="handleOpenUpdate"
  >
    <Select.Trigger
      as-child
      :aria-label="placeholder"
    >
      <button
        class="trigger"
        :disabled
      >
        <Select.Value
          as="div"
          class="value"
          :placeholder="placeholder"
        >
          <slot name="trigger">
            {{ modelValue }}
          </slot>
        </Select.Value>
        <ScopeIcon
          class="icon"
          :kind="isOpen ? 'chevron-up' : 'chevron-down'"
        />
      </button>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content
        :side-offset="4"
        position="popper"
      >
        <div class="panel">
          <Select.ScrollUpButton class="scroll-button">
            <ScopeIcon kind="chevron-up" />
          </Select.ScrollUpButton>

          <Select.Viewport>
            <div class="view">
              <input
                v-if="options.length >= FILTER_THRESHOLD"
                v-model="search"
                placeholder="Filter"
                class="search"
              />
              <template v-if="filteredOptions.length > 0">
                <Select.Group>
                  <Select.Item
                    v-for="(item, index) in filteredOptions"
                    :key="index"
                    class="item"
                    :value="item.value"
                  >
                    <slot
                      name="item"
                      :item
                    >
                      {{ item.label }}
                    </slot>
                  </Select.Item>
                </Select.Group>
              </template>
              <template v-else>
                <ScopeLabelEmptyState
                  value="No results found"
                  size="small"
                />
              </template>
            </div>
          </Select.Viewport>

          <Select.ScrollDownButton class="scroll-button">
            <ScopeIcon kind="chevron-down" />
          </Select.ScrollDownButton>
        </div>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>

<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui';
import { Select } from 'reka-ui/namespaced';
import { computed, ref } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';

const model = defineModel<Option['value']>({
  required: true,
});

const {
  options,
  placeholder,
  disabled = false,
} = defineProps<{
  options: Option[];
  placeholder: string;
  disabled?: boolean;
}>();

const FILTER_THRESHOLD = 8;

const search = ref('');
const filteredOptions = computed(() => {
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.value.toLowerCase()) ||
      option.value === search.value,
  );
});

function handleModelValueUpdate(newValue: AcceptableValue): void {
  if (typeof newValue === 'string') {
    model.value = newValue;
  }
}

const isOpen = ref(false);
function handleOpenUpdate(open: boolean): void {
  isOpen.value = open;
  search.value = '';
}
</script>

<script lang="ts">
interface Option {
  value: string;
  label: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { Option };
</script>

<style scoped>
.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  overflow: hidden;
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: var(--elevation-low);
  color: var(--color-text-secondary);
  cursor: pointer;

  &:disabled {
    opacity: 0.8;
    cursor: default;
    pointer-events: none;
  }

  &:focus {
    border: 1px solid var(--color-border-quaternary);
    box-shadow: var(--elevation-medium);
  }

  &:hover {
    border-color: var(--color-border-quaternary);
    box-shadow: var(--elevation-medium);
    color: var(--color-text-primary);
  }

  & .value {
    display: flex;
    gap: var(--spacing-4);
    align-items: center;
    font-size: var(--font-size-s);
  }
}

.icon {
  width: 15px;
  height: 15px;
}

.panel {
  width: var(--reka-select-trigger-width);
  max-height: 368px;
  padding: var(--spacing-2);
  overflow-y: auto;
  transform-origin: var(--reka-select-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: oklch(from var(--color-background-primary) l c h / 60%);
  box-shadow: var(--elevation-medium);
  backdrop-filter: blur(4px);
}

@keyframes scale-in {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  cursor: default;
}

.view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.search {
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-s);
}

.item {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-3) var(--spacing-2);
  border-radius: var(--border-radius-s);
  outline: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  cursor: pointer;

  &:hover,
  &:focus {
    background: oklch(from var(--color-background-secondary) l c h / 50%);
    color: var(--color-text-primary);
  }
}
</style>
