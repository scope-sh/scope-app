<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <div class="icons">
          <IconBrand class="icon" />
        </div>
        <div class="main">
          <InputSearch
            v-model="search"
            :is-loading="isEnsResolving"
            placeholder="Address, ENS, or chain"
            @submit="handleSearchSubmit"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>
      </div>
      <div class="body">
        <div
          class="overlay"
          :class="{ active: isInputFocused }"
        />
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
import { useIntervalFn, useDocumentVisibility } from '@vueuse/core';
import { createPublicClient, http, isAddress } from 'viem';
import { ref, computed, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import IconBrand from '@/components/__common/IconBrand.vue';
import IconChain from '@/components/__common/IconChain.vue';
import InputSearch from '@/components/chain/InputSearch.vue';
import useEnv from '@/composables/useEnv';
import EvmService from '@/services/evm';
import NamingService from '@/services/naming';
import type { Chain } from '@/utils/chains';
import {
  CHAINS,
  ETHEREUM,
  getChainData,
  getChainName,
  getChainByName,
  getEndpointUrl,
  isChainName,
} from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import { isEnsAddress } from '@/utils/validation/pattern';

const { quicknodeAppName, quicknodeAppKey } = useEnv();
const router = useRouter();

useHead({
  title: () => 'Scope',
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

const search = ref('');
function handleSearchSubmit(): void {
  if (isChainName(search.value)) {
    const chain = getChainByName(search.value);
    if (chain) {
      router.push(getRouteLocation({ name: 'chain', chain }));
    }
  } else if (isEnsAddress(search.value)) {
    openEnsAddress(search.value);
  } else if (isAddress(search.value)) {
    router.push(
      getRouteLocation({
        name: 'global-address',
        address: search.value,
      }),
    );
  }
}

const isEnsResolving = ref(false);
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
  position: relative;
  z-index: 1;
  flex-direction: column;
  align-items: center;
  width: 820px;
  margin: 8px;
  gap: 40px;
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

.overlay {
  display: block;
  position: fixed;
  width: 100%;
  height: 100%;
  transition: opacity 0.25s ease-in-out;
  opacity: 0;
  background: var(--color-background-primary);
  pointer-events: none;
}

.overlay.active {
  opacity: 0.5;
}

.chains {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
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
  flex-direction: column;
  width: 100%;
  height: 80px;
  padding: var(--spacing-6) var(--spacing-5);
  transition: border-color 0.25s ease-in-out;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  gap: var(--spacing-4);

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
    align-items: center;
    gap: var(--spacing-4);
    font-size: var(--font-size-m);

    .icon {
      width: 20px;
      height: 20px;
    }
  }

  .chain-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
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
