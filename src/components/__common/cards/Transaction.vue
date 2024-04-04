<template>
  <ScopeCard>
    <div class="content">
      <div class="header">
        <span>
          <ScopeLinkInternal
            :route="{
              name: 'transaction',
              hash: transaction.hash,
            }"
          >
            {{ transaction.hash }}
          </ScopeLinkInternal>
        </span>
        ·
        <span class="index">#{{ transaction.transactionIndex }}</span>
      </div>
      <div class="metadata">
        <div class="direction">
          <span>
            <LinkAddress
              :address="transaction.from"
              is-short
              :with-icon="false"
            />
          </span>
          <span v-if="transaction.to">→</span>
          <span v-if="transaction.to">
            <LinkAddress
              :address="transaction.to"
              is-short
              :with-icon="false"
            />
          </span>
        </div>
        <div class="chips">
          <div
            v-if="transaction.gasPrice"
            class="chip"
            :title="transaction.gasPrice.toString()"
          >
            Gas price: {{ formatGasPrice(transaction.gasPrice) }}
          </div>
          <div
            class="chip"
            :title="transaction.gas.toString()"
          >
            Gas limit:
            {{ formatNumber(parseInt(transaction.gas.toString())) }}
          </div>
          <div
            v-if="transaction.value > 0n"
            class="chip"
            :title="transaction.value.toString()"
          >
            Value:
            {{ formatEther(transaction.value) }}
          </div>
        </div>
      </div>
      <div class="data">
        <ScopeTextView
          :value="transaction.input"
          size="tiny"
        />
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import type { Transaction } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import { formatEther, formatGasPrice, formatNumber } from '@/utils/formatting';

defineProps<{
  transaction: Transaction;
}>();
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.header {
  padding-left: 2px;
  font-size: var(--font-size-s);
}

.index {
  color: var(--color-text-secondary);
}

.metadata {
  display: flex;
  gap: var(--spacing-4);
  padding-left: 2px;
  font-size: var(--font-size-m);
}

.direction {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.chips {
  display: flex;
  gap: var(--spacing-2);
}

.chip {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-xs);
  background: var(--color-background-secondary);
  font-size: var(--font-size-xs);
}
</style>
