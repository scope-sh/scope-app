<template>
  <ScopeCard>
    <div class="content">
      <div class="header">
        <template v-if="date">
          <ScopeTooltip delay="medium">
            <template #trigger>
              <div>
                {{ formatRelativeTime(toRelativeTime(new Date(), date)) }}
              </div>
            </template>
            <template #default>
              {{ formatTime(date) }}
            </template>
          </ScopeTooltip>
          ·
        </template>
        <template v-if="log.blockNumber">
          <LinkBlock
            :number="BigInt(log.blockNumber)"
            type="minimal"
          />
          ·
        </template>
        <div class="header-link">
          <LinkAddress
            v-if="type === 'transaction'"
            :address="log.address"
            type="copyable"
          />
          <LinkTransaction
            v-else-if="type === 'address' && log.transactionHash"
            :hash="log.transactionHash"
            type="minimal"
          />
        </div>
        ·
        <div class="index">#{{ log.logIndex }}</div>
      </div>
      <div
        v-if="view === 'decoded' && decoded"
        class="decoded"
      >
        <div class="name">
          {{ decoded.name }}
          <ButtonCopy
            v-if="log.topics[0]"
            :value="log.topics[0]"
            compact
            class="copy"
          />
        </div>
        <ArgumentTree :args="decoded.args" />
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
import { type AbiEvent, type Hex, decodeEventLog } from 'viem';
import { computed } from 'vue';

import ButtonCopy from './ButtonCopy.vue';
import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';
import ScopeTooltip from './ScopeTooltip.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  ArgumentTree,
  type Argument,
  getArguments,
} from '@/components/__common/arguments';
import useAbi from '@/composables/useAbi';
import type { Log as TransactionLog } from '@/services/evm';
import type { Log as AddressLog } from '@/services/hypersync';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime, formatTime } from '@/utils/formatting';

const { log } = defineProps<{
  log: Log;
  type: 'address' | 'transaction';
  view: LogView;
}>();

const { getEventAbi } = useAbi();

interface DecodedLog {
  name: string;
  args: Argument[];
}

const date = computed<Date | null>(() => {
  if ('blockTimestamp' in log) {
    const timestamp =
      typeof log.blockTimestamp === 'string'
        ? parseInt(log.blockTimestamp, 16) * 1000
        : log.blockTimestamp;
    return new Date(timestamp);
  }
  return null;
});

const abi = computed<AbiEvent | null>(() => {
  const signature = log.topics[0];
  return signature ? getEventAbi(log.address, signature) : null;
});

const decoded = computed<DecodedLog | null>(() => {
  if (!abi.value) return null;

  const decodedLog = decodeEventLog({
    abi: [abi.value],
    data: log.data,
    topics: log.topics as [Hex, ...Hex[]],
    strict: false,
  });

  const args = getArguments(
    abi.value.inputs,
    decodedLog.args as Record<string, unknown>,
  );

  return {
    name: decodedLog.eventName,
    args,
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
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
  font-size: var(--font-size-s);
}

.header-link {
  max-width: 100%;
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
  word-break: break-all;
}

.name {
  display: flex;
  gap: var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-l);

  .copy {
    width: 16px;
    height: 16px;
  }
}
</style>
