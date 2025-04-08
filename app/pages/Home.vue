<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <div class="icons">
          <IconBrand class="icon" />
        </div>
        <div class="main">
          <SearchBar
            placeholder="Address, transaction, operation, or chain"
            :results="searchResults"
            :is-loading="isSearching"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @search="handleSearch"
          />
        </div>
      </div>
      <div class="body">
        <div class="chains">
          <RouterLink
            v-for="chain in CHAINS"
            :key="chain"
            :to="getRouteLocation({ name: 'chain', chain: chain })"
            class="chain"
            :class="{ updated: updatedChains.has(chain) }"
          >
            <div class="chain-header">
              <div>
                <IconChain
                  class="icon"
                  :chain="chain"
                  kind="mono"
                />
              </div>
              <div>{{ getChainName(chain) }}</div>
            </div>
            <div class="chain-details">{{ blocks[chain] }}</div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import {
  useIntervalFn,
  useDocumentVisibility,
  useDebounceFn,
} from '@vueuse/core';
import type { Address, Hex } from 'viem';
import { createPublicClient, http } from 'viem';
import { ref, computed, watch, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import IconBrand from '@/components/__common/IconBrand.vue';
import IconChain from '@/components/__common/IconChain.vue';
import SearchBar, { type Result } from '@/components/__common/SearchBar.vue';
import useEnv from '@/composables/useEnv';
import EvmService from '@/services/evm';
import NamingService from '@/services/naming';
import type { Chain } from '@/utils/chains';
import {
  CHAINS,
  ETHEREUM,
  getChainData,
  getChainName,
  getChainNames,
  getEndpointUrl,
} from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import { searchTransactionOrOp } from '@/utils/search';
import {
  isAddress,
  isEnsAddress,
  isTransactionHash,
} from '@/utils/validation/pattern';

const { indexerEndpoint, quicknodeAppName, quicknodeAppKey } = useEnv();

useHead({
  title: () => 'Scope',
});

const router = useRouter();

onMounted(() => {
  if (CHAINS.length === 1) {
    router.push(getRouteLocation({ name: 'chain', chain: CHAINS[0] }));
  }
});

const isInputFocused = ref(false);

function handleInputFocus(): void {
  isInputFocused.value = true;
}

function handleInputBlur(): void {
  isInputFocused.value = false;
}

const isVisible = useDocumentVisibility();
const shouldPauseFetching = computed(
  () => isInputFocused.value || isVisible.value === 'hidden',
);

const { pause, resume } = useIntervalFn(
  () => {
    fetchBlocks();
  },
  1000,
  {
    immediate: true,
  },
);

// Watch for changes in shouldPauseFetching
watch(
  shouldPauseFetching,
  (shouldPause) => {
    if (shouldPause) {
      pause();
    } else {
      resume();
    }
  },
  { immediate: true },
);

const blocks = ref<Partial<Record<Chain, bigint>>>({});
const updatedChains = ref<Set<Chain>>(new Set());

async function fetchBlocks(): Promise<void> {
  for (const chain of CHAINS) {
    fetchChainBlock(chain);
  }
}
async function fetchChainBlock(chain: Chain): Promise<void> {
  const client = createPublicClient({
    chain: getChainData(chain),
    transport: http(getEndpointUrl(chain, quicknodeAppName, quicknodeAppKey)),
  });
  const service = new EvmService(client);
  const block = await service.getLatestBlock();

  if (blocks.value[chain] !== block) {
    blocks.value[chain] = block;
    updatedChains.value.add(chain);
    setTimeout(() => {
      updatedChains.value.delete(chain);
    }, 200);
  }
}

const isSearching = ref(false);
const searchResults = ref<Result[]>([]);
function handleSearch(query: string): void {
  searchResults.value = [];
  if (query !== '') {
    // Handle synchronous searches immediately
    if (isAddress(query)) {
      searchResults.value = [
        {
          type: 'address',
          address: query,
        },
      ];
    } else if (query.length >= 3) {
      // Fallback: chain search
      const matchingChains = CHAINS.filter((chain) =>
        getChainNames(chain).some((name) =>
          name.toLowerCase().includes(query.toLowerCase()),
        ),
      );
      searchResults.value = matchingChains.map((chain) => ({
        type: 'chain',
        chain,
      }));
    }

    if (searchResults.value.length === 0) {
      searchAsync(query);
    }
  }
}

const searchAsync = useDebounceFn(async (query: string) => {
  if (!query) {
    return;
  }

  isSearching.value = true;
  if (isEnsAddress(query)) {
    const address = await resolveEns(query);
    if (address) {
      searchResults.value = [
        {
          type: 'address',
          address,
        },
      ];
    }
  } else if (isTransactionHash(query)) {
    const result = await searchTransactionOrOp(
      query as Hex,
      quicknodeAppName,
      quicknodeAppKey,
      indexerEndpoint,
    );
    if (result) {
      searchResults.value = [
        {
          type: result.type,
          chain: result.chain,
          hash: result.hash,
        },
      ];
    }
  }
  isSearching.value = false;
}, 200);

async function resolveEns(name: string): Promise<Address | null> {
  const namingService = new NamingService(
    quicknodeAppName,
    quicknodeAppKey,
    ETHEREUM,
  );
  return namingService.resolveEns(name);
}
</script>

<style scoped>
.page {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding-top: 15vh;
}

.content {
  display: flex;
  gap: 40px;
  position: relative;
  z-index: 1;
  flex-direction: column;
  align-items: center;
  width: 820px;
  margin: 8px;
  margin-bottom: 32px;
}

@media (width >= 768px) {
  .content {
    gap: 80px;
  }
}

.header {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.icons {
  display: flex;
  gap: var(--spacing-5);
  align-items: center;
  color: var(--color-text-secondary);

  .icon {
    width: 32px;
    height: 32px;
  }
}

.main {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
  width: 100%;
}

.body {
  width: 100%;
}

.chains {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: repeat(4, 1fr);
  width: 100%;

  @media (width <= 1600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (width <= 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }
}

.chain {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  width: 100%;
  height: 80px;
  padding: var(--spacing-6) var(--spacing-5);
  transition: border-color 0.25s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);

  &:hover {
    border-color: var(--color-border-quaternary);
    background: var(--color-background-secondary);
  }

  &.updated {
    animation: highlight 0.25s ease-in-out;
  }

  &.no-code {
    color: oklch(from var(--color-text-secondary) l c h / 60%);
  }

  .chain-header {
    display: flex;
    gap: var(--spacing-4);
    align-items: center;
    font-size: var(--font-size-m);

    .icon {
      width: 20px;
      height: 20px;
    }
  }

  .chain-details {
    display: flex;
    gap: var(--spacing-2);
    flex-wrap: wrap;
    align-items: center;
    font-size: var(--font-size-s);
  }
}

@keyframes highlight {
  0% {
    border-color: var(--color-border-quaternary);
  }

  100% {
    border-color: var(--color-border-tertiary);
  }
}
</style>
