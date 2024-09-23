<template>
  <div class="root">
    <form
      autocomplete="off"
      @submit.prevent="handleSubmit"
    >
      <div class="list">
        <LensFormInput
          v-for="(abiInput, index) in abiInputs"
          :key="index"
          :abi-input="abiInput"
          :input="inputs[index]"
          @update:input="(newValue) => handleInputUpdate(index, newValue)"
        />
      </div>
      <button
        type="submit"
        :disabled="isLoading || !isValid"
      >
        <ScopeIcon kind="arrow-right" />
      </button>
    </form>
    <slot name="output" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import LensFormInput from './LensFormInput.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import NamingService from '@/services/naming.js';
import {
  getInitialValue,
  isValid as isAbiValid,
  normalize,
  type Input as AbiInput,
} from '@/utils/validation/abi';

const { abiInputs } = defineProps<{
  abiInputs: readonly AbiInput[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  submit: [inputs: unknown[]];
}>();

const { id: chainId } = useChain();
const { quicknodeAppName, quicknodeAppKey } = useEnv();

const namingService = computed(() =>
  chainId.value
    ? new NamingService(quicknodeAppName, quicknodeAppKey, chainId.value)
    : null,
);

const inputs = ref<unknown[]>([]);
const isValid = computed(() => isAbiValid(inputs.value, abiInputs));

onMounted(() => {
  inputs.value = abiInputs.map((input) => getInitialValue(input));
});

function handleInputUpdate(index: number, newValue: unknown): void {
  inputs.value[index] = newValue;
}

async function handleSubmit(): Promise<void> {
  if (!namingService.value) {
    return;
  }
  const normalizedInputs = await normalize(
    inputs.value,
    abiInputs,
    namingService.value,
  );
  emit('submit', normalizedInputs);
}
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

form {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.list {
  display: flex;
  gap: var(--spacing-2);
}

button {
  display: flex;
  width: 16px;
  height: 16px;
  padding: 0;
  transition: opacity 0.5s;
  border: none;
  opacity: 0.4;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.1;
  }
}
</style>
