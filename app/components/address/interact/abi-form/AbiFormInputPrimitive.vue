<template>
  <fieldset>
    <input
      :id="id"
      v-model="model"
      :placeholder="abiInput.type"
      :class="{ invalid: !isValid }"
      @keydown.enter="handleEnter"
      @input="handleInput"
    />
    <label
      v-if="abiInput.name"
      :for="id"
      :class="{ invalid: !isValid }"
    >
      {{ abiInput.name }}
    </label>
  </fieldset>
</template>

<script setup lang="ts">
import { whenever } from '@vueuse/core';
import { computed, inject, ref, useId } from 'vue';

import { injectionKey, type Injection } from './AbiForm.vue';

import type { PrimitiveInput } from '@/utils/validation/abi';
import { isPrimitiveValid } from '@/utils/validation/abi';

const model = defineModel<unknown>();

const { abiInput } = defineProps<{
  abiInput: PrimitiveInput;
}>();

const { validated: containerValidated, requestValidation } = inject<Injection>(
  injectionKey,
  {
    validated: ref<boolean>(false),
    requestValidation: () => {},
  },
);

whenever(containerValidated, () => {
  inputValidated.value = true;
});

const id = useId();

const inputValidated = ref<boolean>(false);
const isInputValid = computed(() =>
  isPrimitiveValid(model.value, abiInput.type),
);
const isValid = computed<boolean>(() =>
  inputValidated.value ? isInputValid.value : true,
);

function handleEnter(): void {
  inputValidated.value = true;
  requestValidation();
}

function handleInput(): void {
  inputValidated.value = false;
}
</script>

<style scoped>
fieldset {
  all: unset;
  position: relative;
  gap: var(--spacing-2);
  flex-direction: column;
  width: 320px;
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

  &.invalid {
    color: var(--color-error);
  }
}

input {
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
  box-shadow: inset var(--elevation-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-regular);
  gap: var(--spacing-2);

  &:focus ~ label:not(.invalid) {
    color: var(--color-border-primary);
  }

  &:focus {
    border-color: var(--color-border-primary);
  }

  &.invalid {
    border-color: var(--color-error);
  }
}

input::placeholder {
  color: var(--color-text-placeholder);
}
</style>
