<template>
  <header>
    <div class="side">
      <router-link :to="chainRoute">
        <IconBrand class="icon" />
      </router-link>
      <CommandPaletteTrigger />
    </div>
    <div class="side">
      <ChainSelector
        :model-value="chainId"
        :options="CHAINS"
        @update:model-value="handleChainUpdate"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import CommandPaletteTrigger from './header/CommandPaletteTrigger.vue';
import ChainSelector from './header/SelectChain.vue';

import IconBrand from '@/components/__common/IconBrand.vue';
import useChain from '@/composables/useChain';
import type { Chain } from '@/utils/chains';
import { CHAINS } from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';

const { id: chainId } = useChain();
const router = useRouter();

const chainRoute = computed(() =>
  getRouteLocation({ name: 'chain', chain: chainId.value }),
);

function handleChainUpdate(value: Chain): void {
  router.push(getRouteLocation({ name: 'chain', chain: value }));
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-5) 8px;
  border-bottom: 1px solid var(--color-border-tertiary);

  @media (width >= 992px) {
    padding: var(--spacing-5) 96px;
  }
}

.side {
  display: flex;
  gap: var(--spacing-7);
  align-items: center;
}

.icon {
  width: 24px;
  height: 24px;
  transition: 0.2s ease-in-out;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.icon:hover {
  color: var(--color-text-primary);
}
</style>
