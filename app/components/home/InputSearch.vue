<template>
  <div class="wrapper">
    <input
      v-model="query"
      placeholder="Address, transaction, operation, or chain"
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
import { createPublicClient, http, isAddress } from 'viem';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useEnv from '@/composables/useEnv';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import NamingService from '@/services/naming';
import {
  CHAINS,
  ETHEREUM,
  getChainData,
  getChainByName,
  getEndpointUrl,
  isChainName,
} from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import { isEnsAddress, isTransactionHash } from '@/utils/validation/pattern';

const emit = defineEmits<{
  focus: [];
  blur: [];
}>();

const { indexerEndpoint, quicknodeAppName, quicknodeAppKey } = useEnv();
const router = useRouter();

function handleSubmit(): void {
  search();
}

function handleClick(): void {
  search();
}

function handleFocus(): void {
  emit('focus');
}

function handleBlur(): void {
  emit('blur');
}

const query = ref('');
function search(): void {
  if (isChainName(query.value)) {
    const chain = getChainByName(query.value);
    if (chain) {
      router.push(getRouteLocation({ name: 'chain', chain }));
    }
  } else if (isEnsAddress(query.value)) {
    openEnsAddress(query.value);
  } else if (isAddress(query.value)) {
    router.push(
      getRouteLocation({
        name: 'global-address',
        address: query.value,
      }),
    );
  } else if (isTransactionHash(query.value)) {
    openTransactionOrOp(query.value);
  }
}

const isEnsResolving = ref(false);
const isTransactionOrOpResolving = ref(false);
const isLoading = computed(
  () => isEnsResolving.value || isTransactionOrOpResolving.value,
);

async function openEnsAddress(name: string): Promise<void> {
  const namingService = new NamingService(
    quicknodeAppName,
    quicknodeAppKey,
    ETHEREUM,
  );
  isEnsResolving.value = true;
  const address = await namingService.resolveEns(name);
  isEnsResolving.value = false;
  if (address) {
    router.push(getRouteLocation({ name: 'global-address', address }));
  }
}

async function chunkArray<T>(array: T[], size: number): Promise<T[][]> {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function openTransactionOrOp(hash: Hex): Promise<void> {
  const maxRequests = 10;

  isTransactionOrOpResolving.value = true;

  // Search for a transaction on each chain
  const transactionPromises = CHAINS.map(async (chain) => {
    const client = createPublicClient({
      chain: getChainData(chain),
      transport: http(getEndpointUrl(chain, quicknodeAppName, quicknodeAppKey)),
    });
    const service = new EvmService(client);
    try {
      const transaction = await service.getTransaction(hash);
      if (transaction) {
        return { chain, transaction };
      }
    } catch {
      // Ignore
    }
    return null;
  });

  // Process in chunks of 10
  const chunks = await chunkArray(transactionPromises, maxRequests);
  for (const chunk of chunks) {
    const results = await Promise.all(chunk);
    const found = results.find((result) => result !== null);
    if (found) {
      router.push(
        getRouteLocation({
          name: 'transaction',
          chain: found.chain,
          hash: found.transaction.hash,
        }),
      );
      isTransactionOrOpResolving.value = false;
      return;
    }
  }

  // Search for an op on each chain
  const opPromises = CHAINS.map(async (chain) => {
    const indexerService = new IndexerService(indexerEndpoint, chain);
    const foundOp = await indexerService.getTxHashByOpHash(hash as Hex);
    if (foundOp) {
      return chain;
    }
    return null;
  });

  // Process in chunks of 10
  const opChunks = await chunkArray(opPromises, maxRequests);
  for (const chunk of opChunks) {
    const results = await Promise.all(chunk);
    const foundChain = results.find((result) => result !== null);
    if (foundChain) {
      router.push(getRouteLocation({ name: 'op', chain: foundChain, hash }));
      isTransactionOrOpResolving.value = false;
      return;
    }
  }

  isTransactionOrOpResolving.value = false;
}
</script>

<style scoped>
.wrapper {
  position: relative;
}

input {
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
