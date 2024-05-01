<template>
  <ScopeCard>
    <div class="content">
      <div class="header">
        <template v-if="date">
          <span>
            {{ formatRelativeTime(toRelativeTime(new Date(), date)) }}
          </span>
          ·
        </template>
        <template v-if="log.blockNumber">
          <LinkBlock
            :number="BigInt(log.blockNumber)"
            type="minimal"
          />
          ·
        </template>
        <span>
          <LinkAddress
            v-if="type === 'transaction'"
            :address="log.address"
            type="minimal"
          />
          <LinkTransaction
            v-else-if="type === 'address' && log.transactionHash"
            :hash="log.transactionHash"
            type="minimal"
          />
        </span>
        ·
        <span class="index">#{{ log.logIndex }}</span>
      </div>
      <div class="topics">
        <div
          v-for="topic in log.topics"
          :key="topic"
          class="topic"
        >
          {{ topic }}
        </div>
      </div>
      <div
        v-if="log.data !== '0x'"
        class="data"
      >
        <ScopeTextView
          :value="log.data"
          size="tiny"
        />
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import type { Log as TransactionLog } from '@/services/evm';
import type { Log as AddressLog } from '@/services/hypersync';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime } from '@/utils/formatting';

import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';

const props = defineProps<{
  log: Log;
  type: 'address' | 'transaction';
}>();

const date = computed<Date | null>(() => {
  if ('blockTimestamp' in props.log) {
    return new Date(props.log.blockTimestamp);
  }
  return null;
});
</script>

<script lang="ts">
type Log = AddressLog | TransactionLog;

export type { Log };
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.header {
  font-size: var(--font-size-s);
}

.index {
  color: var(--color-text-secondary);
}

.topic {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
