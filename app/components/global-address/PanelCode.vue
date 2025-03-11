<template>
  <ScopePanel title="Code">
    <div class="list">
      <RouterLink
        v-for="chainStatus in status"
        :key="chainStatus.chain"
        :to="
          getRouteLocation({
            name: 'address',
            chain: chainStatus.chain,
            address: address,
          })
        "
      >
        <div
          class="item"
          :class="{
            'no-code': chainStatus.type === 'no-code',
          }"
        >
          <div class="header">
            <div>
              <IconChain
                class="icon"
                :chain="chainStatus.chain"
                kind="mono"
              />
            </div>
            <div>{{ getChainName(chainStatus.chain) }}</div>
          </div>
          <div
            v-if="chainStatus.type === 'delegation'"
            class="details"
          >
            Delegating to
            <LinkAddress
              :chain="chainStatus.chain"
              :address="chainStatus.target"
              type="minimal"
            />
          </div>
          <template v-if="chainStatus.type === 'contract'">
            <div
              v-if="chainStatus.implementation"
              class="details"
            >
              Proxy for
              <LinkAddress
                :chain="chainStatus.chain"
                :address="chainStatus.implementation"
                type="minimal"
              />
            </div>
            <div
              v-else
              class="details"
            >
              Deployed
            </div>
          </template>
        </div>
      </RouterLink>
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { RouterLink } from 'vue-router';

import IconChain from '@/components/__common/IconChain.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import { type Chain, getChainName } from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';

const { address, status } = defineProps<{
  address: Address;
  status: ChainStatus[];
}>();
</script>

<script lang="ts">
type ChainStatus =
  | {
      chain: Chain;
      type: 'no-code';
    }
  | {
      chain: Chain;
      type: 'contract';
      code: Hex;
      implementation: Address | null;
    }
  | {
      chain: Chain;
      type: 'delegation';
      target: Address;
    };

// eslint-disable-next-line import/prefer-default-export
export type { ChainStatus };
</script>

<style scoped>
.list {
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

.item {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  width: 100%;
  height: 90px;
  padding: var(--spacing-6) var(--spacing-5);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);

  &:hover {
    border-color: var(--color-border-quaternary);
    background: var(--color-background-secondary);
  }

  &.no-code {
    color: oklch(from var(--color-text-secondary) l c h / 60%);
  }

  .header {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
    font-size: var(--font-size-m);
  }

  .details {
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
</style>
