<template>
  <div class="page">
    <div class="content">
      <div class="icons">
        <IconBrand class="icon" />
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
        <InputSearch
          v-model="search"
          :is-loading="isEnsResolving"
          @submit="handleSearchSubmit"
        />
        <div
          class="latest-block"
          :class="{ loading: isLoading }"
        >
          Latest block
          <LinkBlock
            v-if="latestBlock"
            :number="latestBlock"
          />
          <span v-else>…</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { useIntervalFn } from '@vueuse/core';
import type { Hex } from 'viem';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

import IconBrand from '@/components/__common/IconBrand.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import InputSearch from '@/components/chain/InputSearch.vue';
import PopoverChain from '@/components/chain/PopoverChain.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useToast from '@/composables/useToast';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import NamingService from '@/services/naming';
import type { Command } from '@/stores/commands';
import type { Chain } from '@/utils/chains';
import { toBigInt } from '@/utils/conversion';
import { getRouteLocation } from '@/utils/routing';
import {
  isAddress,
  isBlockNumber,
  isEnsAddress,
  isTransactionHash,
} from '@/utils/validation/pattern';

const CHAIN_PAGE = 'page_chain';

const { id: chainId, name: chainName, client } = useChain();
const { alchemyApiKey, indexerEndpoint } = useEnv();
const router = useRouter();
const { setCommands } = useCommands(CHAIN_PAGE);
const { send: sendToast } = useToast();

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
  5000,
  {
    immediate: true,
  },
);

const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);
const indexerService = computed(() =>
  chainId.value && client.value
    ? new IndexerService(indexerEndpoint, chainId.value)
    : null,
);

const nameService = new NamingService(alchemyApiKey);

const search = ref('');
function handleSearchSubmit(): void {
  if (search.value === '') {
    return;
  }
  if (search.value === 'latest') {
    openLatestBlock();
  } else if (isEnsAddress(search.value)) {
    openEnsAddress(search.value);
  } else if (isAddress(search.value)) {
    router.push(getRouteLocation({ name: 'address', address: search.value }));
  } else if (isBlockNumber(search.value)) {
    const number = toBigInt(search.value);
    if (!number) {
      return;
    }
    router.push(getRouteLocation({ name: 'block', number }));
  } else if (isTransactionHash(search.value)) {
    openTransactionOrUserOp(search.value);
  }
}

const isEnsResolving = ref(false);
async function openEnsAddress(name: string): Promise<void> {
  isEnsResolving.value = true;
  const address = await nameService.resolveEns(name);
  isEnsResolving.value = false;
  if (address) {
    router.push(getRouteLocation({ name: 'address', address }));
  }
}

const isLatestBlockResolving = ref(false);
async function openLatestBlock(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  isLatestBlockResolving.value = true;
  const number = await evmService.value.getLatestBlock();
  isLatestBlockResolving.value = false;
  router.push(getRouteLocation({ name: 'block', number }));
}

const isTransactionOrUserOpResolving = ref(false);
async function openTransactionOrUserOp(hash: Hex): Promise<void> {
  if (!indexerService.value) {
    return;
  }
  isTransactionOrUserOpResolving.value = true;
  const foundUserOp = await indexerService.value.getTxHashByUserOpHash(
    hash as Hex,
  );
  isTransactionOrUserOpResolving.value = false;
  if (foundUserOp) {
    router.push(getRouteLocation({ name: 'userop', hash: search.value }));
  } else {
    router.push(getRouteLocation({ name: 'transaction', hash: search.value }));
  }
}

const isLoading = ref(false);
const latestBlock = ref<bigint | null>(null);

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
</script>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.content {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  align-items: center;
  width: 820px;
  margin: 8px;
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

.latest-block {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  transition: all 0.25s ease-in-out;
  font-size: var(--font-size-s);
}

.latest-block.loading {
  opacity: 0.6;
}
</style>
