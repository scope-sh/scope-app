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
          <ScopeLinkInternal
            v-if="latestBlock"
            :route="{
              name: 'block',
              number: latestBlock,
            }"
          >
            {{ latestBlock }}
          </ScopeLinkInternal>
          <span v-else>…</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

import IconBrand from '@/components/__common/IconBrand.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import InputSearch from '@/components/chain/InputSearch.vue';
import PopoverChain from '@/components/chain/PopoverChain.vue';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import EvmService from '@/services/evm';
import NamingService from '@/services/naming';
import type { Chain } from '@/utils/chains';
import { toBigInt } from '@/utils/conversion';
import { getRouteLocation } from '@/utils/routing';
import {
  isAddress,
  isBlockNumber,
  isEnsAddress,
  isTransactionHash,
} from '@/utils/validation/pattern';

const { id: chainId, client } = useChain();
const { alchemyApiKey } = useEnv();
const router = useRouter();

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

const nameService = new NamingService(alchemyApiKey);

const search = ref('');
function handleSearchSubmit(): void {
  if (search.value === '') {
    return;
  }
  if (isEnsAddress(search.value)) {
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
    router.push(getRouteLocation({ name: 'transaction', hash: search.value }));
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
