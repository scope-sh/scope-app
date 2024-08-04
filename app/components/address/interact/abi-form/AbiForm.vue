<template>
  <div class="root">
    <form
      autocomplete="off"
      @submit.prevent="handleSubmit"
    >
      <div class="inputs">
        <AbiFormInput
          v-for="(abiInput, index) in abiInputs"
          :key="index"
          :abi-input="abiInput"
          :input="inputs[index]"
          @update:input="(newValue) => handleInputUpdate(index, newValue)"
        />
      </div>
      <div class="query">
        <button
          type="submit"
          :disabled="isLoading || !isValid"
        >
          <ScopeIcon :kind="result === null ? 'arrow-right' : 'reload'" />
        </button>
        <ScopeTextView
          v-if="isErrored"
          :value="'Unable to fetch'"
          :type="'error'"
          :size="'tiny'"
        />
        <AbiFormOutput
          v-else
          :abi-outputs="abiOutputs"
          :value="result"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import AbiFormInput from './AbiFormInput.vue';
import AbiFormOutput from './AbiFormOutput.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import NamingService from '@/services/naming';
import {
  type Input as AbiInput,
  type Output as AbiOutput,
  getInitialValue,
  isValid as isAbiValid,
  normalize,
} from '@/utils/validation/abi';

const props = defineProps<{
  abiInputs: readonly AbiInput[];
  abiOutputs: readonly AbiOutput[];
  isLoading: boolean;
  isErrored: boolean;
  result: unknown;
}>();

const emit = defineEmits<{
  submit: [args: unknown[]];
}>();

const { id: chainId } = useChain();
const { alchemyApiKey } = useEnv();

const namingService = computed(() =>
  chainId.value ? new NamingService(alchemyApiKey, chainId.value) : null,
);

const inputs = ref<unknown[]>([]);
const isValid = computed(() => isAbiValid(inputs.value, props.abiInputs));

onMounted(() => {
  inputs.value = props.abiInputs.map((input) => getInitialValue(input));
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
    props.abiInputs,
    namingService.value,
  );
  emit('submit', normalizedInputs);
}
</script>

<style scoped>
form {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.inputs {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.query {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
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
