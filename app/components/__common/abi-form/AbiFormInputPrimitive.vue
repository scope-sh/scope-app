<template>
  <input
    :id="id"
    :value="modelValue"
    :placeholder
    :class="{ invalid: !isValid }"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { whenever } from '@vueuse/core';
import { computed, ref } from 'vue';

import { injectAbiFormInputContext } from './AbiFormInput.vue';

import {
  isPrimitiveValid,
  type PrimitiveInputType,
} from '@/utils/validation/abi';

defineProps<{
  placeholder: string;
}>();

const rootContext = injectAbiFormInputContext();
const id = computed(() => rootContext.id.value);
const type = computed<PrimitiveInputType>(
  () => rootContext.abiInput.type as PrimitiveInputType,
);
const isContainerBlurred = computed(() => rootContext.isContainerBlurred);
const modelValue = computed<string>(
  () => rootContext.modelValue.value as string,
);

const containerBeenBlurred = ref<boolean>(false);
whenever(isContainerBlurred, () => {
  containerBeenBlurred.value = true;
});

const isValueValid = ref<boolean>(true);
const isValid = computed(() =>
  containerBeenBlurred.value
    ? isValueValid.value && modelValue.value !== ''
    : isValueValid.value,
);

function handleInput(event: Event): void {
  isValueValid.value = true;
  const target = event.target as HTMLInputElement;
  rootContext.onModelValueUpdate(target.value);
}

function handleBlur(): void {
  isValueValid.value = isPrimitiveValid(modelValue.value, type.value);
}
</script>
