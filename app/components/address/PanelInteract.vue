<template>
  <ScopePanel title="Read">
    <NoticeProxy
      v-if="isProxy"
      v-model:show-as-proxy="showAsProxy"
      :implementation
    />
    <div class="group">
      <input
        v-model="filterQuery"
        type="text"
        placeholder="Filter"
      />
      <div class="list">
        <div
          v-for="fragment in readFunctions"
          :key="toFunctionSelector(fragment)"
          class="item"
        >
          <h3>{{ getFragmentName(fragment) }}</h3>
          <AbiForm
            :abi-inputs="getAbiInputs(fragment)"
            :abi-outputs="getAbiOutputs(fragment)"
            :is-loading="isLoading(fragment)"
            :is-errored="isErrored(fragment)"
            :result="getResultValue(fragment)"
            @submit="(args) => handleSubmit(fragment, args)"
          />
        </div>
      </div>
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import type {
  Abi,
  AbiConstructor,
  AbiFallback,
  AbiFunction,
  AbiReceive,
  Address,
} from 'abitype';
import { type Hex, toFunctionSelector } from 'viem';
import { multicall, readContract } from 'viem/actions';
import { computed, ref, watch } from 'vue';

import NoticeProxy from './code/NoticeProxy.vue';
import AbiForm from './interact/abi-form/AbiForm.vue';

import ScopePanel from '@/components/__common/ScopePanel.vue';
import useChain from '@/composables/useChain';
import type { Contract } from '@/services/api';
import type {
  Input as AbiInput,
  Output as AbiOutput,
} from '@/utils/validation/abi';

const props = defineProps<{
  address: Address;
  contract: Contract | null;
}>();

const { client } = useChain();

const filterQuery = ref('');
const showAsProxy = ref(true);
const isFunctionLoading = ref<Record<Hex, boolean>>();
const isFunctionErrored = ref<Record<Hex, boolean>>();
const results = ref<Record<Hex, unknown>>();

function isLoading(fragment: AbiFunction): boolean {
  if (!isFunctionLoading.value) {
    return false;
  }
  return isFunctionLoading.value[toFunctionSelector(fragment)] || false;
}
function isErrored(fragment: AbiFunction): boolean {
  if (!isFunctionErrored.value) {
    return false;
  }
  return isFunctionErrored.value[toFunctionSelector(fragment)] || false;
}

const isProxy = computed(() => props.contract && props.contract.implementation);
const implementation = computed(() =>
  props.contract && props.contract.implementation
    ? props.contract.implementation.address
    : null,
);
const abi = computed(() =>
  props.contract
    ? showAsProxy.value && props.contract.implementation
      ? props.contract.implementation.abi
      : props.contract.abi
    : null,
);
const readFunctions = computed(() => filter(getReadFunctions(abi.value || [])));

watch(
  () => readFunctions,
  () => {
    for (const f of readFunctions.value) {
      if (!isFunctionLoading.value) {
        isFunctionLoading.value = {};
      }
      isFunctionLoading.value[toFunctionSelector(f)] = false;
      if (!isFunctionErrored.value) {
        isFunctionErrored.value = {};
      }
      isFunctionErrored.value[toFunctionSelector(f)] = false;
      if (!results.value) {
        results.value = {};
      }
      results.value[toFunctionSelector(f)] = null;
    }
    fetchParamless();
  },
  {
    immediate: true,
  },
);

function getAbiInputs(fragment: AbiFunction): readonly AbiInput[] {
  return fragment.inputs as readonly AbiInput[];
}
function getAbiOutputs(fragment: AbiFunction): readonly AbiOutput[] {
  return fragment.outputs as readonly AbiOutput[];
}

type AbiFragment = AbiFunction | AbiConstructor | AbiFallback | AbiReceive;

function filter<T extends AbiFragment>(fragments: T[]): T[] {
  return fragments.filter((fragment) =>
    getFragmentName(fragment)
      .toLowerCase()
      .includes(filterQuery.value.toLowerCase()),
  );
}
function getFragmentName(fragment: AbiFragment): string {
  if (fragment.type === 'constructor') {
    return 'constructor';
  }
  if (fragment.type === 'fallback') {
    return 'fallback';
  }
  if (fragment.type === 'receive') {
    return 'receive';
  }
  return fragment.name;
}

function getFunctions(abi: Abi): AbiFunction[] {
  return abi.filter(
    (fragment): fragment is AbiFunction => fragment.type === 'function',
  );
}

function isReadFunction(fragment: AbiFunction): boolean {
  return ['view', 'pure'].includes(fragment.stateMutability);
}

function getReadFunctions(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const readFunctions = functions.filter((f) => isReadFunction(f));
  readFunctions.sort((a, b) => {
    // First priority: paramless non-constants
    // Second priority: constants
    // Third priority: anything else
    if (
      isParamless(a) &&
      !isConstant(a) &&
      (!isParamless(b) || isConstant(b))
    ) {
      return -1;
    }
    if (
      isParamless(b) &&
      !isConstant(b) &&
      (!isParamless(a) || isConstant(a))
    ) {
      return 1;
    }
    if (isConstant(a) && !isConstant(b)) {
      return -1;
    }
    if (isConstant(b) && !isConstant(a)) {
      return 1;
    }
    return 0;
  });
  return readFunctions;
}

function isConstant(func: AbiFunction): boolean {
  return func.name === func.name.toUpperCase() && isParamless(func);
}
function isParamless(func: AbiFunction): boolean {
  return func.inputs.length === 0;
}

function getResultValue(fragment: AbiFunction): unknown {
  if (!results.value) {
    return null;
  }
  const result = results.value[toFunctionSelector(fragment)];
  if (result === null || result === undefined) {
    return null;
  }
  return result;
}

async function fetchParamless(): Promise<void> {
  if (!results.value) {
    results.value = {};
  }
  if (!isFunctionLoading.value) {
    isFunctionLoading.value = {};
  }
  if (!isFunctionErrored.value) {
    isFunctionErrored.value = {};
  }
  const paramlessFunctions = readFunctions.value.filter(isParamless);
  for (const fragment of paramlessFunctions) {
    if (isParamless(fragment)) {
      isFunctionLoading.value[toFunctionSelector(fragment)] = true;
    }
  }
  const callResults = await multicall(client.value, {
    contracts: paramlessFunctions.map((f) => ({
      address: props.address,
      abi: [f],
      functionName: f.name,
      args: [],
    })),
  });
  for (const [i, fragment] of paramlessFunctions.entries()) {
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
    const callResult = callResults[i];
    if (!callResult) {
      isFunctionErrored.value[toFunctionSelector(fragment)] = true;
      continue;
    }
    const isError = callResult.status === 'failure';
    isFunctionErrored.value[toFunctionSelector(fragment)] = isError;
    const result = callResult.status === 'success' ? callResult.result : null;
    if (result !== null) {
      results.value[toFunctionSelector(fragment)] = result;
    }
  }
}

async function handleSubmit(
  fragment: AbiFragment,
  args: unknown[],
): Promise<void> {
  if (fragment.type !== 'function') {
    return;
  }
  if (!isFunctionLoading.value) {
    isFunctionLoading.value = {};
  }
  if (!isFunctionErrored.value) {
    isFunctionErrored.value = {};
  }
  if (!results.value) {
    results.value = {};
  }
  isFunctionLoading.value[toFunctionSelector(fragment)] = true;
  isFunctionErrored.value[toFunctionSelector(fragment)] = false;
  try {
    const result = await readContract(client.value, {
      address: props.address,
      abi: [fragment],
      functionName: fragment.name,
      args,
    });
    results.value[toFunctionSelector(fragment)] = result;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  } catch (e) {
    isFunctionErrored.value[toFunctionSelector(fragment)] = true;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  }
}
</script>

<style scoped>
.group {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
}

h2 {
  margin: 0;
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-light);
}

input {
  width: 240px;
  padding: var(--spacing-2) var(--spacing-2);
  border: 1px solid transparent;
  border-radius: var(--border-radius-s);
  outline: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:hover {
    background: var(--color-background-tertiary);
  }

  &:focus {
    border-color: var(--color-border-tertiary);
  }
}

h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-light);
}

.list {
  display: flex;
  gap: var(--spacing-8);
  flex-direction: column;
}

.item {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
}
</style>
