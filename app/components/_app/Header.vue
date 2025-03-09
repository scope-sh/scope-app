<template>
  <header :class="{ minimal: isMinimal }">
    <div
      v-if="!isMinimal"
      class="start"
    >
      <RouterLink
        v-if="isChainAvailable"
        :to="chainRoute"
      >
        <IconBrand class="icon" />
      </RouterLink>
      <RouterLink
        v-else
        :to="getRouteLocation({ name: 'home' })"
      >
        <IconBrand class="icon" />
      </RouterLink>
      <CommandPaletteTrigger />
    </div>
    <div class="center">
      <div class="modes">
        <RouterLink
          class="mode"
          :to="getRouteLocation({ name: 'home' })"
          :class="{ active: isExplorerRoute(route.name) }"
        >
          Explore
        </RouterLink>
        <RouterLink
          class="mode"
          :to="getRouteLocation({ name: 'simulate' })"
          :class="{ active: isSimulatorRoute(route.name) }"
        >
          Simulate
        </RouterLink>
      </div>
    </div>
    <div
      v-if="!isMinimal"
      class="end"
    >
      <ChainSelector
        v-if="isChainAvailable"
        :model-value="chainId"
        :options="CHAINS"
        @update:model-value="handleChainUpdate"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter, useRoute } from 'vue-router';

import CommandPaletteTrigger from './header/CommandPaletteTrigger.vue';
import ChainSelector from './header/SelectChain.vue';

import IconBrand from '@/components/__common/IconBrand.vue';
import useChain from '@/composables/useChain';
import type { Chain } from '@/utils/chains';
import { CHAINS } from '@/utils/chains';
import {
  getRouteLocation,
  isExplorerRoute,
  isSimulatorRoute,
} from '@/utils/routing';

const { isAvailable: isChainAvailable, id: chainId } = useChain();
const router = useRouter();
const route = useRoute();

const isMinimal = computed(() => {
  const minimalRoutes = ['home', 'chain', 'simulate'];
  return minimalRoutes.includes(route.name as string);
});

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
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: var(--spacing-5) 8px;
  border-bottom: 1px solid var(--color-border-tertiary);

  &.minimal {
    border-bottom-color: transparent;
  }

  @media (width >= 992px) {
    padding: var(--spacing-5) 96px;
  }
}

.start,
.center,
.end {
  display: flex;
  gap: var(--spacing-7);
  flex: 1;
  align-items: center;
}

.start {
  justify-content: flex-start;
}

.center {
  justify-content: center;
}

.end {
  justify-content: flex-end;
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

.modes {
  display: flex;
  gap: var(--spacing-4);
}

.mode {
  transition: 0.2s ease-in-out;
  border-radius: var(--border-radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;

  &.active {
    color: var(--color-text-primary);
  }

  &:hover {
    color: var(--color-text-primary);
  }
}
</style>
