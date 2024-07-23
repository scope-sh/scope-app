<template>
  <div class="root">
    <AbiForm.Root
      :abi-inputs
      :is-loading
      class="form"
      @submit="handleSubmit"
    >
      <template #inputs>
        <div class="list">
          <AbiForm.Inputs>
            <template #primitive="{ abiInput }">
              <AbiForm.InputPrimitive
                :placeholder="abiInput.name || ''"
                class="input"
              />
            </template>
          </AbiForm.Inputs>
        </div>
      </template>
      <template #submit="{ disabled }">
        <button :disabled="disabled">
          <ScopeIcon :kind="'arrow-right'" />
        </button>
      </template>
    </AbiForm.Root>
    <slot name="output" />
  </div>
</template>

<script setup lang="ts">
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import { AbiForm } from '@/components/__common/abi-form';
import type { Input as AbiInput } from '@/utils/validation/abi';

defineProps<{
  abiInputs: readonly AbiInput[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  submit: [unknown[]];
}>();

function handleSubmit(inputs: unknown[]): void {
  emit('submit', inputs);
}
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
}

.form {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.list {
  display: flex;
  gap: var(--spacing-2);
}

button {
  display: flex;
  width: 16px;
  height: 16px;
  padding: 0;
  transition: opacity 0.2s;
  border: none;
  opacity: 0.4;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.1;
  }
}

.input {
  width: 100%;
  padding: 1px 6px;
  transition: border-color 0.2s;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-l);

  &:focus {
    border-color: var(--color-border-quaternary);
  }

  &[disabled] {
    opacity: 0.4;
    pointer-events: none;
  }

  &.invalid {
    border-color: var(--color-error);
  }
}

@media (width >= 768px) {
  .input {
    width: initial;
    font-size: var(--font-size-s);
  }
}
</style>
