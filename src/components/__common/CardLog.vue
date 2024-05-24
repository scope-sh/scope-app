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
      <div
        v-if="view === 'decoded' && decoded"
        class="decoded"
      >
        <div class="name">{{ decoded.name }}</div>
        <div class="properties">
          <PropertyTree
            :tree="decoded.properties"
            initial
          />
        </div>
      </div>
      <div
        v-else
        class="raw"
      >
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
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import { AbiEvent, Hex, decodeEventLog } from 'viem';
import { computed } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import PropertyTree, {
  Properties,
} from '@/components/__common/PropertyTree.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import useAbi from '@/composables/useAbi';
import type { Log as TransactionLog } from '@/services/evm';
import type { Log as AddressLog } from '@/services/hypersync';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime } from '@/utils/formatting';

import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';

const props = defineProps<{
  log: Log;
  type: 'address' | 'transaction';
  view: LogView;
}>();

const { getEventAbi } = useAbi();

interface DecodedLog {
  name: string;
  properties: Properties;
}

const date = computed<Date | null>(() => {
  if ('blockTimestamp' in props.log) {
    return new Date(props.log.blockTimestamp);
  }
  return null;
});

const abi = computed<AbiEvent | null>(() => {
  const signature = props.log.topics[0];
  return signature ? getEventAbi(props.log.address, signature) : null;
});

const decoded = computed<DecodedLog | null>(() => {
  if (!abi.value) return null;

  const decodedLog = decodeEventLog({
    abi: [abi.value],
    data: props.log.data,
    topics: props.log.topics as [Hex, ...Hex[]],
  });

  return {
    name: decodedLog.eventName,
    properties: decodedLog.args as Properties,
  };
});
</script>

<script lang="ts">
type Log = AddressLog | TransactionLog;
type LogView = 'hex' | 'decoded';

export type { Log, LogView };
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
}

.header {
  font-size: var(--font-size-s);
}

.index {
  color: var(--color-text-secondary);
}

.raw {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.topic {
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.decoded {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  font-family: var(--font-mono);
}

.name {
  font-size: var(--font-size-l);
}

.properties {
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}
</style>
