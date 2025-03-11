<template>
  <div class="wrapper">
    <div
      class="overlay"
      :class="{ active: isActive }"
    />
    <div
      ref="inputContainerEl"
      @keydown.up.prevent="handleUp"
      @keydown.down.prevent="handleDown"
      @keydown.enter="handleSubmit"
    >
      <div class="input-container">
        <input
          v-model="query"
          :class="{ loading: isLoading }"
          :placeholder="placeholder"
          @input="handleInput"
        />
        <div
          class="icon-wrapper"
          :class="{ disabled: results.length === 0 }"
        >
          <ScopeIcon
            class="icon"
            kind="arrow-right"
            @click="handleClick"
          />
        </div>
      </div>
      <div
        v-if="results.length > 0 && isActive"
        class="results"
      >
        <div
          v-for="(result, index) in results"
          :key="index"
          class="result"
          :class="{ selected: selectedIndex === index }"
          @click="() => handleSelect(result)"
        >
          <div class="result-value">{{ getLabel(result) }}</div>
          <div class="result-type">{{ getType(result.type) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFocusWithin, refDebounced } from '@vueuse/core';
import type { Hex } from 'viem';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useChain from '@/composables/useChain';
import type { Chain } from '@/utils/chains';
import { getChainName } from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';

const { results } = defineProps<{
  placeholder: string;
  results: Result[];
  isLoading: boolean;
}>();

const emit = defineEmits<{
  focus: [];
  blur: [];
  search: [query: string];
}>();

defineExpose({
  results,
});

const router = useRouter();
const { isAvailable: isChainAvailable } = useChain();
const inputContainerEl = useTemplateRef<HTMLDivElement>('inputContainerEl');

const { focused: isFocused } = useFocusWithin(inputContainerEl);
// Prevents race condition when clicking on the search results
const isFocusedDebounced = refDebounced(isFocused, 100);
const isActive = computed(() => isFocusedDebounced.value || isFocused.value);

watch(isFocused, (value) => {
  if (value) {
    emit('focus');
  } else {
    emit('blur');
  }
});

const query = ref('');
const selectedIndex = ref(0);

function handleSubmit(): void {
  navigate();
}

function handleClick(): void {
  navigate();
}

function handleUp(): void {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
}

function handleDown(): void {
  if (selectedIndex.value < results.length - 1) {
    selectedIndex.value++;
  }
}

function handleInput(): void {
  selectedIndex.value = 0;
  emit('search', query.value);
}

function handleSelect(result: Result): void {
  openResult(result);
}

function navigate(): void {
  const result = results[selectedIndex.value];
  if (!result) {
    return;
  }
  openResult(result);
}

function getLabel(result: Result): string {
  switch (result.type) {
    case 'transaction':
    case 'op':
      return result.hash;
    case 'address':
      return result.address;
    case 'block':
      return result.number.toString();
    case 'chain':
      return getChainName(result.chain);
    case 'label':
      return result.label;
  }
}

function getType(type: ResultType): string {
  switch (type) {
    case 'label':
      return 'address';
    default:
      return type;
  }
}

function openResult(result: Result): void {
  if (result.type === 'chain') {
    router.push(getRouteLocation({ name: 'chain', chain: result.chain }));
  } else if (result.type === 'address' || result.type === 'label') {
    if (isChainAvailable.value) {
      router.push(
        getRouteLocation({
          name: 'address',
          address: result.address,
        }),
      );
    } else {
      router.push(
        getRouteLocation({
          name: 'global-address',
          address: result.address,
        }),
      );
    }
  } else if (result.type === 'block') {
    router.push(getRouteLocation({ name: 'block', number: result.number }));
  } else if (result.type === 'transaction' || result.type === 'op') {
    router.push(
      getRouteLocation({
        name: result.type,
        chain: result.chain,
        hash: result.hash,
      }),
    );
  }
}
</script>

<script lang="ts">
type ResultType =
  | 'transaction'
  | 'op'
  | 'address'
  | 'block'
  | 'chain'
  | 'label';

interface BaseResult {
  type: ResultType;
}

interface TransactionResult extends BaseResult {
  type: 'transaction';
  chain: Chain;
  hash: Hex;
}

interface OpResult extends BaseResult {
  type: 'op';
  chain: Chain;
  hash: Hex;
}

interface AddressResult extends BaseResult {
  type: 'address';
  address: Hex;
}

interface BlockResult extends BaseResult {
  type: 'block';
  number: bigint;
}

interface ChainResult extends BaseResult {
  type: 'chain';
  chain: Chain;
}

interface LabelResult extends BaseResult {
  type: 'label';
  address: Hex;
  label: string;
}

type Result =
  | TransactionResult
  | OpResult
  | AddressResult
  | BlockResult
  | ChainResult
  | LabelResult;

// eslint-disable-next-line import/prefer-default-export
export { type Result };
</script>

<style scoped>
.wrapper {
  position: relative;
}

.overlay {
  display: block;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.25s ease-in-out;
  opacity: 0;
  background: black;
  pointer-events: none;
}

.overlay.active {
  opacity: 0.5;
}

.input-container {
  position: relative;
  z-index: 2;
}

input {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-5);
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: inset var(--elevation-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-l);

  &.loading {
    animation: pulse 1s ease-in-out alternate infinite;
  }
}

@keyframes pulse {
  0% {
    border-color: oklch(from var(--color-border-primary) l c h / 100%);
  }

  80% {
    border-color: oklch(from var(--color-border-primary) l c h / 90%);
  }

  100% {
    border-color: oklch(from var(--color-border-primary) l c h / 50%);
  }
}

@media (width >= 768px) {
  input {
    font-size: var(--font-size-s);
  }
}

input:disabled {
  opacity: 0.6;
}

input:focus {
  border-color: var(--color-border-primary);
  box-shadow: inset var(--elevation-medium);
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  height: 100%;
  padding: 0 8px;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.icon {
  width: 15px;
  height: 15px;
  transition: 0.25s ease-in-out;
  opacity: 0.8;
  cursor: pointer;
}

.icon:hover {
  opacity: 1;
}

.results {
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 8px;
  width: calc(100% - 16px);
  border: 1px solid var(--color-border-secondary);
  border-top: none;
  border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  background: var(--color-background-secondary);
  box-shadow: var(--elevation-medium);
}

.result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  cursor: pointer;

  &:last-child {
    border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  }
}

.result:hover,
.result.selected {
  background: var(--color-background-tertiary);
}

.result-type {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
}
</style>
