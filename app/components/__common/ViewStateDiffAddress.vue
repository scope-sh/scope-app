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
        <div class="code">
          <div
            ref="codeContentEl"
            class="code-content"
            :class="{ expanded: isCodeExpanded }"
          >
            {{ diff.code.from }} → {{ diff.code.to }}
          </div>
          <button
            v-if="isCodeOverflowing || isCodeExpanded"
            class="expand-toggle"
            @click="toggleExpandCode"
          >
            <ScopeIcon
              class="icon"
              :kind="isCodeExpanded ? 'chevron-up' : 'chevron-down'"
            />
            {{ isCodeExpanded ? 'Less' : 'More' }}
          </button>
        </div>
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
import { useResizeObserver } from '@vueuse/core';
import type { Address } from 'viem';
import { ref, useTemplateRef } from 'vue';

import LinkAddress from './LinkAddress.vue';
import ScopeIcon from './ScopeIcon.vue';

import useChain from '@/composables/useChain.js';
import type { TransactionStateDiffAddress } from '@/services/evm';
import { formatEther } from '@/utils/formatting.js';

defineProps<{
  address: Address;
  diff: TransactionStateDiffAddress;
}>();

const { nativeCurrency } = useChain();

const isCodeOverflowing = ref(false);
const codeContentEl = useTemplateRef('codeContentEl');
useResizeObserver(codeContentEl, (entries) => {
  const entry = entries[0];
  if (!entry) {
    return;
  }
  isCodeOverflowing.value = entry.contentRect.width < entry.target.scrollWidth;
});
const isCodeExpanded = ref(false);
function toggleExpandCode(): void {
  isCodeExpanded.value = !isCodeExpanded.value;
}
</script>

<style scoped>
.view {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.diff {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.slots {
  overflow-wrap: break-word;
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  font-family: var(--font-mono);
  font-size: var(--font-size-l);
}

.slot {
  color: var(--color-text-secondary);
}

.code {
  overflow-wrap: break-word;
}

.code-content {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: var(--font-size-l);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-content.expanded {
  white-space: normal;
}

.expand-toggle {
  display: flex;
  gap: var(--spacing-2);
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  cursor: pointer;

  &:hover {
    color: var(--color-text-primary);
  }
}

.icon {
  width: 15px;
  height: 15px;
}
</style>
