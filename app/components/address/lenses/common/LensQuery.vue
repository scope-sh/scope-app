<template>
  <LensForm
    :abi-inputs="abiInputs"
    :is-loading="isLoading"
    @submit="handleSubmit"
  >
    <template #output>
      <div
        v-if="isError"
        class="error"
      >
        Unable to fetch
      </div>
      <div v-else>{{ value }}</div>
    </template>
  </LensForm>
</template>

<script
  setup
  lang="ts"
  generic="const abi extends Abi | readonly unknown[],
functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,"
>
import type {
  AbiFunction,
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  ReadContractReturnType,
} from 'viem';
import { getAbiItem } from 'viem';
import { computed, onMounted, ref } from 'vue';

import LensForm from './LensForm.vue';

import useChain from '@/composables/useChain';
import {
  type Input as AbiInput,
  getInitialValue,
} from '@/utils/validation/abi';

const { address, abi, functionName, formatter } = defineProps<{
  address: Address;
  abi: abi;
  functionName: functionName;
  formatter?: (
    value: ReadContractReturnType<abi, functionName, args>,
  ) => string;
}>();

const { client } = useChain();

const abiInputs = computed<AbiInput[]>(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const abiItem = getAbiItem({
    abi: abi,
    name: functionName,
  }) as AbiFunction | undefined;
  return (abiItem?.inputs as AbiInput[]) ?? [];
});
const inputs = ref<unknown[]>([]);

const value = ref<null | unknown>(null);
const isLoading = ref(false);
const isError = ref(false);

onMounted(() => {
  inputs.value = abiInputs.value.map((input) => getInitialValue(input));
});

async function handleSubmit(inputs: unknown[]): Promise<void> {
  fetch(inputs);
}

async function fetch(inputs: unknown[]): Promise<void> {
  isLoading.value = true;
  isError.value = false;
  value.value = null;
  if (!client.value) return;

  try {
    const args = inputs as args;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await client.value.readContract({
      address,
      abi,
      functionName,
      args,
    });
    isLoading.value = false;
    value.value = formatter ? formatter(result) : result;
  } catch {
    isLoading.value = false;
    isError.value = true;
    return;
  }
}
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
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

.error {
  color: var(--color-error);
}
</style>
