<template>
  <div class="input">
    <Checkbox.Root
      :id
      v-model:checked="model as boolean"
      as-child
      class="root"
    >
      <button class="root">
        {{ (model as boolean)?.toString() }}
        <ScopeIcon
          :kind="model ? 'check-circled' : 'circle'"
          class="icon"
        />
      </button>
    </Checkbox.Root>
    <label
      v-if="abiInput.name"
      :for="id"
    >
      {{ abiInput.name }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { Checkbox } from 'radix-vue/namespaced';
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { Input as AbiInput } from '@/utils/validation/abi';

const model = defineModel<unknown>();

defineProps<{
  abiInput: AbiInput;
}>();

const id = computed(
  () => `input-${Math.random().toString(36).substring(2, 15)}`,
);
</script>

<style scoped>
.input {
  position: relative;
}

.root {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 200px;
  border-radius: 4px;
  background: transparent;
  box-shadow: 0 2px 10px var(--black-a7);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

.root:hover {
  background-color: var(--color-background-secondary);
}

.root:focus {
  box-shadow: 0 0 0 2px black;
}

label {
  position: absolute;
  top: -6px;
  left: 8px;
  padding: 0 var(--spacing-2);
  transition: color 0.25s ease-in;
  background: var(--color-background-primary);
  color: var(--color-border-secondary);
  font-size: var(--font-size-s);
  font-weight: 400;
}

button {
  display: inline-flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--spacing-4) var(--spacing-3);
  transition: border-color 0.25s ease-in;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: none;
  box-shadow: inset 2px 2px 2px rgb(0 0 0 / 80%);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-regular);
  gap: var(--spacing-2);

  &:focus {
    border-color: var(--color-border-primary);
  }
}

.icon {
  width: 15px;
  height: 15px;
}
</style>
