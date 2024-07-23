<template>
  <input
    :id="id"
    :value="modelValue"
    type="checkbox"
    @update:modelValue="handleModelValueUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { injectAbiFormInputContext } from './AbiFormInput.vue';

const rootContext = injectAbiFormInputContext();
const id = computed(() => rootContext.id.value);
const modelValue = computed<boolean>(
  () => rootContext.modelValue.value as boolean,
);

function handleModelValueUpdate(newValue: boolean): void {
  rootContext.onModelValueUpdate(newValue);
}
</script>
