<template>
  <div class="view">
    <LinkAddress
      :address
      type="copyable"
    />
    <div class="diff">
      <div v-if="diff.nonce">
        <div class="title">Nonce</div>
        <div>{{ diff.nonce.from }} → {{ diff.nonce.to }}</div>
      </div>
      <div v-if="diff.balance">
        <div class="title">Balance</div>
        <div>
          {{ formatEther(diff.balance.from, nativeCurrency, true) }} →
          {{ formatEther(diff.balance.to, nativeCurrency, true) }}
        </div>
      </div>
      <div v-if="diff.code">
        <div class="title">Code</div>
        <div>{{ diff.code.from }} → {{ diff.code.to }}</div>
      </div>
      <div v-if="diff.storage && Object.keys(diff.storage).length > 0">
        <div class="title">Storage</div>
        <div class="slots">
          <div
            v-for="(value, slot) in diff.storage"
            :key="slot"
          >
            <div class="slot">{{ slot }}</div>
            <div>{{ value.from }} → {{ value.to }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import LinkAddress from './LinkAddress.vue';

import useChain from '@/composables/useChain.js';
import type { TransactionStateDiffAddress } from '@/services/evm';
import { formatEther } from '@/utils/formatting.js';

const { nativeCurrency } = useChain();

defineProps<{
  address: Address;
  diff: TransactionStateDiffAddress;
}>();
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.diff {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.slots {
  overflow-wrap: break-word;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-l);
}

.slot {
  color: var(--color-text-secondary);
}
</style>
