<template>
  <div class="page">
    <div class="content">
      <div class="header">
        <div class="main">
          <InputSearch
            v-model="search"
            :is-loading="isEnsResolving"
            placeholder="Address or ENS"
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
import { useIntervalFn, useNow } from '@vueuse/core';
import { createPublicClient, http, isAddress } from 'viem';
import { ref, computed, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

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
  getEndpointUrl,
} from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import { isEnsAddress } from '@/utils/validation/pattern';

const { quicknodeAppName, quicknodeAppKey } = useEnv();
const router = useRouter();

interface BlockUpdate {
  timestamp: number;
  number: bigint;
}

useHead({
  title: () => 'Scope',
});

const UPDATE_INTERVALS = [1, 1, 1, 2, 2, 5, 5, 10, 10, 30, 30, 60, 120]; // in seconds
const HISTORY_SIZE = 10;

const now = useNow();
const blockHistory = ref<Partial<Record<Chain, BlockUpdate[]>>>({});
const lastUpdateTime = ref<Partial<Record<Chain, number>>>({});
const updateCount = ref<Partial<Record<Chain, number>>>({});

useIntervalFn(
  () => {
    checkAndFetchBlocks();
  },
  1000,
  {
    immediate: true,
  },
);

const search = ref('');
function handleSearchSubmit(): void {
  if (isEnsAddress(search.value)) {
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

const blocks = computed(() => {
  const result: Partial<Record<Chain, bigint>> = {};
  const currentTime = now.value.getTime();

  for (const chain of CHAINS) {
    const history = blockHistory.value[chain];
    if (!history || history.length < 2) {
      continue;
    }

    // Get last two updates to calculate the rate
    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    if (!latest || !previous) {
      continue;
    }

    const timeDiff = latest.timestamp - previous.timestamp;
    const blockDiff = latest.number - previous.number;
    const rate = Number(blockDiff) / timeDiff; // blocks per millisecond

    // Extrapolate current block
    const timeElapsed = currentTime - latest.timestamp;
    const extrapolatedDiff = BigInt(Math.floor(rate * timeElapsed));
    const newValue = latest.number + extrapolatedDiff;
    result[chain] = newValue;
  }

  return result;
});

// Watch for block changes to trigger animations
watch(blocks, (newValues, oldValues) => {
  if (!oldValues) return;

  for (const chain of CHAINS) {
    if (
      oldValues[chain] !== undefined &&
      newValues[chain] !== undefined &&
      oldValues[chain] !== newValues[chain]
    ) {
      updatedChains.value.add(chain);
      setTimeout(() => {
        updatedChains.value.delete(chain);
      }, 100);
    }
  }
});

const updatedChains = ref<Set<Chain>>(new Set());

function getCurrentInterval(chain: Chain): number {
  const count = updateCount.value[chain] || 0;
  const intervalIndex = Math.min(count, UPDATE_INTERVALS.length - 1);
  const interval = UPDATE_INTERVALS[intervalIndex];
  if (!interval) {
    return 1000;
  }
  return interval * 1000;
}

function shouldUpdate(chain: Chain): boolean {
  const lastUpdate = lastUpdateTime.value[chain] || 0;
  const currentTime = Date.now();
  return currentTime - lastUpdate >= getCurrentInterval(chain);
}

async function checkAndFetchBlocks(): Promise<void> {
  for (const chain of CHAINS) {
    if (shouldUpdate(chain)) {
      await fetchChainBlock(chain);
      lastUpdateTime.value[chain] = Date.now();
      updateCount.value[chain] = (updateCount.value[chain] || 0) + 1;
    }
  }
}

async function fetchChainBlock(chain: Chain): Promise<void> {
  const client = createPublicClient({
    chain: getChainData(chain),
    transport: http(getEndpointUrl(chain, quicknodeAppName, quicknodeAppKey)),
  });
  const service = new EvmService(client);
  const block = await service.getLatestBlock();

  // Initialize history array if it doesn't exist
  if (!blockHistory.value[chain]) {
    blockHistory.value[chain] = [];
  }

  // Add new block to history
  const update: BlockUpdate = {
    timestamp: Date.now(),
    number: block,
  };

  const chainHistory = blockHistory.value[chain];
  if (!chainHistory) {
    return;
  }
  chainHistory.push(update);

  // Keep history size limited
  if (chainHistory.length > HISTORY_SIZE) {
    chainHistory.shift();
  }
}

const isInputFocused = ref(false);

function handleInputFocus(): void {
  isInputFocused.value = true;
}

function handleInputBlur(): void {
  isInputFocused.value = false;
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
  }

  .chain-details {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    align-items: center;
    font-size: var(--font-size-s);
  }
}

.icon {
  width: 20px;
  height: 20px;
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
