<template>
  <form @submit.prevent="handleSubmit">
    <slot name="inputs" />
    <div role="submit">
      <slot
        name="submit"
        :disabled="isLoading || !isValid"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { useFocusWithin } from '@vueuse/core';
import { computed, onMounted, ref, type Ref } from 'vue';

import useChain from '@/composables/useChain';
import {
  getInitialValue,
  isValid as isAbiValid,
  normalize,
  type Input as AbiInput,
} from '@/utils/validation/abi';
import { createContext } from '@/utils/vue';

const props = defineProps<{
  abiInputs: readonly AbiInput[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  submit: [unknown[]];
}>();

const { client } = useChain();

const inputs = ref<unknown[]>([]);
const isValid = computed(() => isAbiValid(inputs.value, props.abiInputs));

onMounted(() => {
  inputs.value = props.abiInputs.map((input) => getInitialValue(input));
});

const el = ref();
const { focused } = useFocusWithin(el);

function handleInputUpdate(index: number, newValue: unknown): void {
  inputs.value[index] = newValue;
}

async function handleSubmit(): Promise<void> {
  const normalizedInputs = await normalize(
    inputs.value,
    props.abiInputs,
    client.value,
  );
  emit('submit', normalizedInputs);
}

provideAbiFormRootContext({
  abiInputs: props.abiInputs,
  inputs,
  focused,
  onInputUpdate: handleInputUpdate,
});
</script>

<script lang="ts">
interface AbiFormRootContext {
  abiInputs: readonly AbiInput[];
  inputs: Ref<unknown[]>;
  focused: Ref<boolean>;
  onInputUpdate: (index: number, newValue: unknown) => void;
}

export const [injectAbiFormRootContext, provideAbiFormRootContext] =
  createContext<AbiFormRootContext>('AbiFormRoot');
</script>

<style scoped>
button {
  all: unset;
}
</style>
