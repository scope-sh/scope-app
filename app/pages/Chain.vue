<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <div class="icons">
          <RouterLink :to="getRouteLocation({ name: 'home' })">
            <IconBrand class="icon" />
          </RouterLink>
          <ScopeIcon
            class="icon-x"
            kind="cross"
          />
          <PopoverChain
            :model-value="chainId"
            @update:model-value="handleChainUpdate"
          />
        </div>
        <div class="main">
          <SearchBar
            placeholder="Address, transaction, operation, or block"
            :results="searchResults"
            :is-loading="isSearching"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @search="handleSearch"
          />
          <div class="blocks">
            <div
              class="latest-block"
              :class="{ loading: isLoading }"
            >
              Latest block
              <LinkBlock
                v-if="latestBlock"
                :number="latestBlock"
                type="minimal"
              />
              <span v-else>…</span>
            </div>
            <RouterLink
              :to="getRouteLocation({ name: 'blocks' })"
              class="blocks-link"
            >
              All blocks →
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useDebounceFn, useIntervalFn } from '@vueuse/core';
import type { Address, Hex } from 'viem';
import { ref, onMounted, watch, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { toBigInt } from '#imports';
import IconBrand from '@/components/__common/IconBrand.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import SearchBar, { type Result } from '@/components/__common/SearchBar.vue';
import PopoverChain from '@/components/chain/PopoverChain.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import NamingService from '@/services/naming';
import type { Command } from '@/stores/commands';
import type { Chain } from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import {
  isAddress,
  isBlockNumber,
  isEnsAddress,
  isTransactionHash,
} from '@/utils/validation/pattern';

const { id: chainId, name: chainName, client } = useChain();
const router = useRouter();
const { setCommands } = useCommands();
const { send: sendToast } = useToast();
const { quicknodeAppName, quicknodeAppKey, indexerEndpoint } = useEnv();

useHead({
  title: () => `${chainName.value} | Scope`,
});

const commands = computed<Command[]>(() => [
  {
    icon: 'copy',
    label: 'Copy chain ID',
    act: (): void => {
      navigator.clipboard.writeText(chainId.value.toString());
      sendToast({
        type: 'success',
        message: 'Chain ID copied to clipboard',
      });
    },
  },
]);

watch(
  commands,
  () => {
    setCommands(commands.value);
  },
  {
    immediate: true,
  },
);

useIntervalFn(
  () => {
    fetch();
  },
  1000,
  {
    immediate: true,
  },
);

const evmService = computed(() =>
  client.value ? new EvmService(client.value) : null,
);

const isLoading = ref(false);
const latestBlock = ref<bigint | null>(null);
const isInputFocused = ref(false);

onMounted(() => {
  fetch();
});

watch(chainId, (_newChain, oldChain) => {
  if (oldChain === null) {
    return;
  }
  fetch();
});

async function fetch(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  isLoading.value = true;
  latestBlock.value = await evmService.value.getLatestBlock();
  isLoading.value = false;
}

function handleChainUpdate(value: Chain): void {
  router.push(getRouteLocation({ name: 'chain', chain: value }));
}

function handleInputFocus(): void {
  isInputFocused.value = true;
}

function handleInputBlur(): void {
  isInputFocused.value = false;
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
    } else if (isBlockNumber(query)) {
      const number = toBigInt(query);
      if (number !== null) {
        searchResults.value = [
          {
            type: 'block',
            number,
          },
        ];
      }
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
  if (query === 'latest') {
    const number = await getLatestBlock();
    if (number !== null) {
      searchResults.value = [
        {
          type: 'block',
          number,
        },
      ];
    }
  } else if (isEnsAddress(query)) {
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
    const result = await searchTransactionOrOp(query as Hex);
    if (result) {
      searchResults.value = [
        {
          type: result.type,
          chain: chainId.value,
          hash: result.hash,
        },
      ];
    }
  } else if (query.length >= 3) {
    const apiService = new ApiService(chainId.value);
    // Label search
    const labels = await apiService.searchLabels(query);
    searchResults.value = labels.slice(0, 10).map((label) => ({
      type: 'label',
      address: label.address,
      label: label.namespace
        ? `${label.namespace.value}: ${label.value}`
        : label.value,
    }));
  }
  isSearching.value = false;
}, 200);

async function getLatestBlock(): Promise<bigint | null> {
  if (!client.value) {
    return null;
  }
  const evmService = new EvmService(client.value);
  return evmService.getLatestBlock();
}

async function resolveEns(name: string): Promise<Address | null> {
  if (!chainId.value) {
    return null;
  }
  const namingService = new NamingService(
    quicknodeAppName,
    quicknodeAppKey,
    chainId.value,
  );
  return namingService.resolveEns(name);
}

async function searchTransactionOrOp(hash: Hex): Promise<{
  type: 'transaction' | 'op';
  hash: Hex;
} | null> {
  if (!chainId.value) {
    return null;
  }
  const indexerService = new IndexerService(indexerEndpoint, chainId.value);
  const foundOp = await indexerService.getTxHashByOpHash(hash);
  if (foundOp) {
    return {
      type: 'op',
      hash: foundOp,
    };
  }
  return {
    type: 'transaction',
    hash,
  };
}
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15vh;
}

.content {
  display: flex;
  gap: 200px;
  flex-direction: column;
  align-items: center;
  width: 820px;
  margin: 8px;
}

@media (width >= 768px) {
  .content {
    gap: 320px;
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
}

.icon {
  width: 32px;
  height: 32px;

  &:hover {
    color: var(--color-text-primary);
  }
}

.icon-x {
  width: 15px;
  height: 15px;
}

.main {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
  width: 100%;
}

.blocks {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-s);

  .latest-block {
    display: flex;
    gap: var(--spacing-3);
    align-items: center;
    transition: all 0.25s ease-in-out;

    &.loading {
      opacity: 0.6;
    }

    & span {
      padding: 2px 0;
    }
  }

  .blocks-link {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text-primary);
    }
  }
}
</style>
