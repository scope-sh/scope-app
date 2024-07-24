<template>
  <div class="root">
    <LensFormInputPrimitive
      v-if="isPrimitiveInput(abiInput) && abiInput.type !== 'bool'"
      :id="id"
      v-model="model"
      :is-container-blurred="isContainerBlurred"
      :abi-input="abiInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LensFormInputPrimitive from './LensFormInputPrimitive.vue';

import {
  isPrimitiveInput,
  type Input as AbiInput,
} from '@/utils/validation/abi';

defineProps<{
  abiInput: AbiInput;
  isContainerBlurred: boolean;
}>();

const model = defineModel<unknown>('input');

const id = computed(
  () => `input-${Math.random().toString(36).substring(2, 15)}`,
);
</script>
