<template>
  <ScopePage
    :sections="sections"
    @update:section="handleSectionUpdate"
  >
    <ScopePanelLoading
      v-if="isLoading"
      ref="txPanelEl"
      title="Transaction"
      :subtitle="hash"
    />
    <ScopePanel
      v-if="!isLoading && transaction === null"
      ref="txPanelEl"
      title="Transaction"
      :subtitle="hash"
    >
      <ScopeLabelEmptyState value="Couldn't find this transaction" />
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading"
      ref="txPanelEl"
      title="Transaction"
      :subtitle="hash"
    >
      <TransactionStatus
        v-if="transactionReceipt"
        :status="transactionReceipt.status"
      />
      <AttributeList v-if="transaction && transactionReceipt">
        <AttributeItem v-if="transaction.blockNumber">
          <AttributeItemLabel :value="'Block'" />
          <AttributeItemValue>
            <ScopeLinkInternal
              :route="{
                name: 'block',
                number: transaction.blockNumber,
              }"
            >
              {{ transaction.blockNumber }}
            </ScopeLinkInternal>
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="block && block.timestamp">
          <AttributeItemLabel :value="'Timestamp'" />
          <AttributeItemValue>
            {{ formatTime(block.timestamp) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'From'" />
          <AttributeItemValue>
            <LinkAddress :address="transaction.from" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.to">
          <AttributeItemLabel :value="'To'" />
          <AttributeItemValue>
            <LinkAddress :address="transaction.to" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Value'" />
          <AttributeItemValue>
            {{ formatEther(transaction.value) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Gas used'" />
          <AttributeItemValue :note="formatShare(gasUsedShare)">
            {{ transactionReceipt.gasUsed }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Gas limit'" />
          <AttributeItemValue>
            {{ transaction.gas }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.gasPrice">
          <AttributeItemLabel :value="'Gas price'" />
          <AttributeItemValue>
            {{ formatGasPrice(transaction.gasPrice) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="fee">
          <AttributeItemLabel :value="'Fee'" />
          <AttributeItemValue>
            {{ formatEther(fee) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Type'" />
          <AttributeItemValue :note="typeLabel">
            {{ typeIndexLabel }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.input !== '0x'">
          <AttributeItemLabel :value="'Input'" />
          <AttributeItemValue>
            <ScopeTextView
              size="regular"
              :value="transaction.input"
            />
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading && transactionReceipt"
      ref="txLogsEl"
      title="Logs"
    >
      <template #default>
        <ScopeLabelEmptyState
          v-if="!transactionReceipt.logs.length"
          value="No logs found"
        />
        <div
          v-else
          class="logs"
        >
          <CardLog
            v-for="(log, index) in transactionReceipt.logs"
            :key="index"
            :log="log"
          />
        </div>
      </template>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from 'unhead';
import { Address, TransactionType } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardLog from '@/components/__common/CardLog.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import TransactionStatus from '@/components/transaction/TransactionStatus.vue';
import useChain from '@/composables/useChain';
import useLabels from '@/composables/useLabels';
import EvmService, { Block } from '@/services/evm';
import type { Transaction, TransactionReceipt } from '@/services/evm';
import {
  formatEther,
  formatGasPrice,
  formatShare,
  formatTime,
} from '@/utils/formatting.js';

const route = useRoute();
const { id: chainId, name: chainName, client } = useChain();
const { requestLabels } = useLabels();

const sections = [
  {
    label: 'Overview',
    value: 'overview',
  },
  {
    label: 'Logs',
    value: 'logs',
  },
] as Section[];
function handleSectionUpdate(value: Section['value']): void {
  if (value === 'overview') {
    if (!txPanelEl.value) {
      return;
    }
    const el = txPanelEl.value.rootEl;
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }
  if (value === 'logs') {
    if (!txLogsEl.value) {
      return;
    }
    const el = txLogsEl.value.rootEl;
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

const txPanelEl = ref<InstanceType<typeof ScopePanel> | null>(null);
const txLogsEl = ref<InstanceType<typeof ScopePanel> | null>(null);

const hash = computed(() => route.params.hash as Address);

onMounted(() => {
  fetch();
});

watch(hash, () => {
  fetch();
});

watch(
  hash,
  () => {
    useHead({
      title: `Transaction ${hash.value} on ${chainName.value} | Scope`,
    });
  },
  {
    immediate: true,
  },
);

const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);

const isLoading = ref(false);
const block = ref<Block | null>(null);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);

async function fetch(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  isLoading.value = true;
  transaction.value = await evmService.value.getTransaction(hash.value);
  transactionReceipt.value = await evmService.value.getTransactionReceipt(
    hash.value,
  );
  if (transaction.value && transaction.value.blockNumber) {
    block.value = await evmService.value.getBlock(
      transaction.value.blockNumber,
    );
  }
  isLoading.value = false;
}

const gasUsedShare = computed(() => {
  if (!transaction.value || !transactionReceipt.value) {
    return 0;
  }
  const gasUsed = parseInt(transactionReceipt.value.gasUsed.toString());
  const gasLimit = parseInt(transaction.value.gas.toString());
  return gasUsed / gasLimit;
});

const fee = computed(() => {
  if (
    !transaction.value ||
    !transaction.value.gasPrice ||
    !transactionReceipt.value
  ) {
    return 0n;
  }
  return transaction.value.gasPrice * transactionReceipt.value.gasUsed;
});

const typeIndexLabel = computed(() => {
  if (!transaction.value) {
    return '';
  }
  const map: Record<TransactionType, number> = {
    legacy: 0,
    eip2930: 1,
    eip1559: 2,
    eip4844: 3,
  };
  return map[transaction.value.type];
});

const typeLabel = computed(() => {
  if (!transaction.value) {
    return '';
  }
  const map: Record<TransactionType, string> = {
    legacy: 'Legacy',
    eip2930: 'EIP2930',
    eip1559: 'EIP1559',
    eip4844: 'EIP4844',
  };
  return map[transaction.value.type];
});

const addresses = computed(() => {
  if (!transaction.value || !transactionReceipt.value) {
    return [];
  }
  const fromAddress = transaction.value.from;
  const toAddress = transaction.value.to;
  const logAddresses = transactionReceipt.value.logs.map((log) => log.address);
  const addresses = [fromAddress];
  if (toAddress) {
    addresses.push(toAddress);
  }
  addresses.push(...logAddresses);
  return addresses;
});

watch(addresses, async () => {
  requestLabels(addresses.value);
});
</script>

<style scoped>
.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
