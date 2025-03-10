<template>
  <div class="wrapper">
    <div
      class="overlay"
      :class="{ active: isFocused }"
    />
    <input
      v-model="query"
      placeholder="Address, transaction, operation, or block"
      :disabled="isLoading"
      @keydown.enter="handleSubmit"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <div class="icon-wrapper">
      <ScopeIcon
        class="icon"
        kind="arrow-right"
        @click="handleClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Hex } from 'viem';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import NamingService from '@/services/naming';
import { toBigInt } from '@/utils/conversion';
import { getRouteLocation } from '@/utils/routing';
import {
  isAddress,
  isBlockNumber,
  isEnsAddress,
  isTransactionHash,
} from '@/utils/validation/pattern';

const emit = defineEmits<{
  focus: [];
  blur: [];
}>();
const { id: chainId, client } = useChain();
const { quicknodeAppName, quicknodeAppKey, indexerEndpoint } = useEnv();
const router = useRouter();

const query = ref('');

const isEnsResolving = ref(false);
const isLatestBlockResolving = ref(false);
const isTransactionOrOpResolving = ref(false);
const isLoading = computed(
  () =>
    isEnsResolving.value ||
    isLatestBlockResolving.value ||
    isTransactionOrOpResolving.value,
);

const isFocused = ref(false);

function handleSubmit(): void {
  search();
}

function handleClick(): void {
  search();
}

function search(): void {
  if (query.value === '') {
    return;
  }
  if (query.value === 'latest') {
    openLatestBlock();
  } else if (isEnsAddress(query.value)) {
    openEnsAddress(query.value);
  } else if (isAddress(query.value)) {
    router.push(getRouteLocation({ name: 'address', address: query.value }));
  } else if (isBlockNumber(query.value)) {
    const number = toBigInt(query.value);
    if (number === null) {
      return;
    }
    router.push(getRouteLocation({ name: 'block', number }));
  } else if (isTransactionHash(query.value)) {
    openTransactionOrOp(query.value);
  }
}

async function openEnsAddress(name: string): Promise<void> {
  if (!chainId.value) {
    return;
  }
  const namingService = new NamingService(
    quicknodeAppName,
    quicknodeAppKey,
    chainId.value,
  );
  isEnsResolving.value = true;
  const address = await namingService.resolveEns(name);
  isEnsResolving.value = false;
  if (address) {
    router.push(getRouteLocation({ name: 'address', address }));
  }
}

async function openLatestBlock(): Promise<void> {
  if (!client.value) {
    return;
  }
  const evmService = new EvmService(client.value);
  isLatestBlockResolving.value = true;
  const number = await evmService.getLatestBlock();
  isLatestBlockResolving.value = false;
  router.push(getRouteLocation({ name: 'block', number }));
}

async function openTransactionOrOp(hash: Hex): Promise<void> {
  if (!chainId.value || !client.value) {
    return;
  }
  const indexerService = new IndexerService(indexerEndpoint, chainId.value);
  isTransactionOrOpResolving.value = true;
  const foundOp = await indexerService.getTxHashByOpHash(hash as Hex);
  isTransactionOrOpResolving.value = false;
  if (foundOp) {
    router.push(getRouteLocation({ name: 'op', hash: foundOp }));
  } else {
    router.push(getRouteLocation({ name: 'transaction', hash: hash as Hex }));
  }
}

function handleFocus(): void {
  isFocused.value = true;
  emit('focus');
}

function handleBlur(): void {
  isFocused.value = false;
  emit('blur');
}
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
  opacity: 0.2;
}

input {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: var(--spacing-4) var(--spacing-5);
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: inset 2px 2px 2px rgb(0 0 0 / 40%);
  color: var(--color-text-primary);
  font-size: var(--font-size-l);
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
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-wrapper {
  display: flex;
  position: absolute;
  z-index: 2;
  top: 0;
  right: 0;
  align-items: center;
  height: 100%;
  padding: 0 8px;
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
</style>
