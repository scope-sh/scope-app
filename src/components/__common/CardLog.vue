<template>
  <ScopeCard>
    <div class="content">
      <div class="header">
        <span v-if="log.blockNumber">
          <LinkBlock :number="log.blockNumber" />
        </span>
        ·
        <span>
          <LinkAddress
            v-if="type === 'transaction'"
            :address="log.address"
          />
          <LinkTransaction
            v-else-if="type === 'address' && log.transactionHash"
            :hash="log.transactionHash"
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
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import type { Log } from '@/services/evm';

import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';

defineProps<{
  log: Log;
  type: 'address' | 'transaction';
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

.topic {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
