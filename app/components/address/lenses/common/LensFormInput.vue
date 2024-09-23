<template>
  <div class="root">
    <LensFormInputPrimitive
      v-if="isPrimitiveInput(abiInput) && abiInput.type !== 'bool'"
      :id="id"
      v-model="model"
      :abi-input="abiInput"
    />
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';

import LensFormInputPrimitive from './LensFormInputPrimitive.vue';

import {
  isPrimitiveInput,
  type Input as AbiInput,
} from '@/utils/validation/abi';

const model = defineModel<unknown>('input');

defineProps<{
  abiInput: AbiInput;
}>();

const id = useId();
</script>
