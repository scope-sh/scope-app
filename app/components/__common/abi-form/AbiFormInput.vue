<template>
  <label
    v-if="abiInput.name && $slots.label"
    :for="id"
  >
    <slot
      name="label"
      :value="abiInput.name"
    />
  </label>
  <slot
    v-if="
      isPrimitiveInput(abiInput) && abiInput.type !== 'bool' && $slots.primitive
    "
    name="primitive"
  />
  <slot
    v-else-if="abiInput.type !== 'bool' && $slots.bool"
    name="bool"
  />
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue';

import {
  isPrimitiveInput,
  type Input as AbiInput,
} from '@/utils/validation/abi';
import { createContext } from '@/utils/vue';

const props = defineProps<{
  abiInput: AbiInput;
  isContainerBlurred: boolean;
}>();

const model = defineModel<unknown>('input');

const id = computed(
  () => `input-${Math.random().toString(36).substring(2, 15)}`,
);

provideAbiFormInputContext({
  id,
  abiInput: props.abiInput,
  modelValue: model,
  onModelValueUpdate: handleModelValueUpdate,
  isContainerBlurred: props.isContainerBlurred,
});

function handleModelValueUpdate(newValue: unknown): void {
  model.value = newValue;
}
</script>

<script lang="ts">
interface AbiFormInputContext {
  id: Ref<string>;
  abiInput: AbiInput;
  modelValue: Ref<unknown>;
  onModelValueUpdate: (newValue: unknown) => void;
  isContainerBlurred: boolean;
}

export const [injectAbiFormInputContext, provideAbiFormInputContext] =
  createContext<AbiFormInputContext>('AbiFormInput');
</script>
