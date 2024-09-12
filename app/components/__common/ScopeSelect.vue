<template>
  <Select.Root
    :model-value="modelValue"
    @update:model-value="handleModelValueUpdate"
  >
    <Select.Trigger
      as-child
      :aria-label="placeholder"
    >
      <button class="trigger">
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
          kind="chevron-down"
        />
      </button>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content
        :side-offset="4"
        :position="'popper'"
      >
        <div class="panel">
          <Select.ScrollUpButton class="scroll-button">
            <ScopeIcon kind="chevron-up" />
          </Select.ScrollUpButton>

          <Select.Viewport>
            <Select.Group>
              <Select.Item
                v-for="(item, index) in options"
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
import { Select } from 'radix-vue/namespaced';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

defineProps<{
  options: Option[];
  placeholder: string;
}>();

const model = defineModel<Option['value']>({
  required: true,
});

function handleModelValueUpdate(newValue: string): void {
  model.value = newValue;
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
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: 1px 1px 0 0 rgb(0 0 0 / 60%);
  color: var(--color-text-secondary);
  cursor: pointer;

  &:focus {
    border: 1px solid var(--color-border-quaternary);
    box-shadow: 2px 2px 0 0 rgb(0 0 0 / 60%);
  }

  &:hover {
    border-color: var(--color-border-quaternary);
    box-shadow: 2px 2px 0 0 rgb(0 0 0 / 60%);
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
  width: var(--radix-select-trigger-width);
  max-height: var(--radix-select-content-available-height);
  padding: var(--spacing-2);
  overflow-y: auto;
  transform-origin: var(--radix-select-content-transform-origin);
  animation: scale-in 0.125s ease-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  background: oklch(from var(--color-background-primary) l c h / 60%);
  box-shadow: 1px 1px 0 0 rgb(0 0 0 / 80%);
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
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
  }
}
</style>
