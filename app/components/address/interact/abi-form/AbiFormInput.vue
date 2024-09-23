<template>
  <AbiFormInputPrimitive
    v-if="isPrimitiveInput(abiInput) && abiInput.type !== 'bool'"
    v-model="model"
    :abi-input
  />
  <AbiFormInputBool
    v-else-if="abiInput.type === 'bool'"
    v-model="model"
    :abi-input
  />
  <AbiFormInputArray
    v-else-if="isArrayInput(abiInput) && isUnknownArray(model)"
    v-model="model"
    :abi-input
  />
  <AbiFormInputTuple
    v-else-if="isTupleInput(abiInput)"
    v-model="model"
    :abi-input
  />
  <AbiFormInputTupleArray
    v-else-if="isTupleArrayInput(abiInput) && isUnknownArray(model)"
    v-model="model"
    :abi-input
  />
</template>

<script setup lang="ts">
import AbiFormInputArray from './AbiFormInputArray.vue';
import AbiFormInputBool from './AbiFormInputBool.vue';
import AbiFormInputPrimitive from './AbiFormInputPrimitive.vue';
import AbiFormInputTuple from './AbiFormInputTuple.vue';
import AbiFormInputTupleArray from './AbiFormInputTupleArray.vue';

import {
  isArrayInput,
  isPrimitiveInput,
  isTupleArrayInput,
  isTupleInput,
  type Input as AbiInput,
} from '@/utils/validation/abi';

const model = defineModel<unknown>('input');

defineProps<{
  abiInput: AbiInput;
}>();

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
</script>
