<template>
  <input
    :id="id"
    v-model="model"
    :placeholder="abiInput.name"
    :class="{ invalid: !isValid }"
    @keydown.enter="handleEnter"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { PrimitiveInput as PrimitiveAbiInput } from '@/utils/validation/abi';
import { isPrimitiveValid } from '@/utils/validation/abi';

const model = defineModel<unknown>();

const { abiInput } = defineProps<{
  id?: string;
  abiInput: PrimitiveAbiInput;
}>();

const isValid = ref<boolean>(true);

function handleEnter(): void {
  isValid.value = isPrimitiveValid(model.value, abiInput.type);
}

function handleInput(): void {
  isValid.value = true;
}
</script>

<style scoped>
input {
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
  input {
    width: initial;
    font-size: var(--font-size-m);
  }
}
</style>
