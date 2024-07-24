<template>
  <input
    :id="id"
    v-model="model"
    :placeholder="abiInput.name"
    :class="{ invalid: !isValid }"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { whenever } from '@vueuse/core';
import { computed, ref } from 'vue';

import type { PrimitiveInput as PrimitiveAbiInput } from '@/utils/validation/abi';
import { isPrimitiveValid } from '@/utils/validation/abi';

const model = defineModel<unknown>();

const props = defineProps<{
  id?: string;
  abiInput: PrimitiveAbiInput;
  isContainerBlurred: boolean;
}>();

const containerBeenBlurred = ref<boolean>(false);
whenever(
  () => props.isContainerBlurred,
  () => {
    containerBeenBlurred.value = true;
  },
);

const isValueValid = ref<boolean>(true);
const isValid = computed(() =>
  containerBeenBlurred.value
    ? isValueValid.value && model.value !== ''
    : isValueValid.value,
);

function handleInput(): void {
  isValueValid.value = true;
}

function handleBlur(): void {
  isValueValid.value = isPrimitiveValid(model.value, props.abiInput.type);
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
    font-size: var(--font-size-s);
  }
}
</style>
