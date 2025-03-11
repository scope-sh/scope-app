<template>
  <div
    v-if="results.length > 0"
    class="results"
  >
    <div
      v-for="(result, index) in results"
      :key="index"
      class="result"
      :class="{ selected: selectedIndex === index }"
      @click="() => $emit('select', result)"
    >
      <div class="result-value">{{ getLabel(result) }}</div>
      <div class="result-type">{{ result.type }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hex } from 'viem';

import { getChainName, type Chain } from '@/utils/chains';

defineProps<{
  results: Result[];
  selectedIndex?: number;
}>();

defineEmits<{
  select: [result: Result];
}>();

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
  }
}
</script>

<script lang="ts">
interface BaseResult {
  type: string;
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

type Result =
  | TransactionResult
  | OpResult
  | AddressResult
  | BlockResult
  | ChainResult;

// eslint-disable-next-line import/prefer-default-export
export type { Result };
</script>

<style scoped>
.results {
  position: absolute;
  z-index: 10;
  top: 100%;
  left: 8px;
  width: calc(100% - 16px);
  border: 1px solid var(--color-border-secondary);
  border-top: none;
  border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  background: var(--color-background-primary);
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

.result:hover {
  background: var(--color-background-secondary);
}

.result-type {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
}

.result.selected {
  background: var(--color-background-secondary);
}
</style>
