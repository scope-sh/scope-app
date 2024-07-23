<template>
  <AbiFormInput
    v-for="(abiInput, index) in abiInputs"
    :key="index"
    :abi-input="abiInput"
    :input="inputs.value[index]"
    :is-container-blurred="!focused.value"
    @update:input="(newValue) => handleInputUpdate(index, newValue)"
  >
    <template
      v-if="$slots.label"
      #label="{ value }"
    >
      <slot
        name="label"
        :value="value"
      />
    </template>
    <template
      v-if="$slots.primitive"
      #primitive
    >
      <slot
        name="primitive"
        :abi-input
      />
    </template>
    <template
      v-if="$slots.bool"
      #bool
    >
      <slot name="bool" />
    </template>
  </AbiFormInput>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import AbiFormInput from './AbiFormInput.vue';
import { injectAbiFormRootContext } from './AbiFormRoot.vue';

const rootContext = injectAbiFormRootContext();

const abiInputs = computed(() => rootContext.abiInputs);
const inputs = computed(() => rootContext.inputs);
const focused = computed(() => rootContext.focused);

function handleInputUpdate(index: number, newValue: unknown): void {
  rootContext.onInputUpdate(index, newValue);
}
</script>
