<template>
  <ScopePage
    :sections="sections"
    @update:section="handleSectionUpdate"
  >
    <ScopePanelLoading
      v-if="isLoading"
      ref="blockPanelEl"
      title="Block"
      :subtitle="number.toString()"
    />
    <ScopePanel
      v-if="!isLoading && isFuture"
      ref="blockPanelEl"
      title="Block"
      :subtitle="number.toString()"
    >
      <ScopeLabelEmptyState
        value="Sorry, time traveler, but this block has not been produced yet"
      />
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading && !isFuture"
      ref="blockPanelEl"
      title="Block"
      :subtitle="number.toString()"
    >
      <BlockStatus
        v-if="block"
        :status="'executed'"
      />
      <AttributeList v-if="block">
        <AttributeItem>
          <AttributeItemLabel :value="'Timestamp'" />
          <AttributeItemValue>
            {{ formatTime(block.timestamp) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Transactions'" />
          <AttributeItemValue>
            {{ block.transactions.length }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="block.producer !== zeroAddress">
          <AttributeItemLabel :value="'Producer'" />
          <AttributeItemValue>
            <LinkAddress :address="block.producer" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Gas used'" />
          <AttributeItemValue :note="formatShare(gasUsedShare)">
            {{ block.gasUsed.toString() }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Gas limit'" />
          <AttributeItemValue>
            {{ block.gasLimit.toString() }}
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading && !isFuture"
      ref="blockTransactionsEl"
      title="Transactions"
    >
      <template #header>
        <ScopePaginator
          v-model="page"
          :total="maxPage"
        />
      </template>
      <template #default>
        <ScopeLabelEmptyState
          v-if="!block?.transactions.length"
          value="No transactions found"
        />
        <TableTransactions
          v-else
          :transactions
          :page="page - 1"
          :per-page="TRANSACTIONS_PER_PAGE"
        />
      </template>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import { slice, zeroAddress } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import BlockStatus from '@/components/block/BlockStatus.vue';
import TableTransactions, {
  type Transaction,
} from '@/components/block/TableTransactions.vue';
import useChain from '@/composables/useChain';
import EvmService from '@/services/evm';
import type { BlockWithTransactions } from '@/services/evm';
import { toBigInt } from '@/utils/conversion';
import { formatShare, formatTime } from '@/utils/formatting';

const route = useRoute();
const { id: chainId, client } = useChain();

const TRANSACTIONS_PER_PAGE = 20;

const sections = [
  {
    label: 'Overview',
    value: 'overview',
  },
  {
    label: 'Transactions',
    value: 'transactions',
  },
] as Section[];
function handleSectionUpdate(value: Section['value']): void {
  if (value === 'overview') {
    if (!blockPanelEl.value) {
      return;
    }
    const el = blockPanelEl.value.rootEl;
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }
  if (value === 'transactions') {
    if (!blockTransactionsEl.value) {
      return;
    }
    const el = blockTransactionsEl.value.rootEl;
    if (!el) {
      return;
    }
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

const blockPanelEl = ref<InstanceType<typeof ScopePanel> | null>(null);
const blockTransactionsEl = ref<InstanceType<typeof ScopePanel> | null>(null);

const number = computed(() => toBigInt(route.params.number as string) || 0n);

onMounted(() => {
  fetch();
});

watch(number, () => {
  fetch();
});

const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);

const isLoading = ref(false);
const isFuture = ref(false);
const block = ref<BlockWithTransactions | null>(null);

async function fetch(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  isLoading.value = true;
  const latestBlock = await evmService.value.getLatestBlock();
  if (number.value > latestBlock) {
    isFuture.value = true;
    isLoading.value = false;
    return;
  }
  block.value = await evmService.value.getBlockWithTransactions(number.value);
  isLoading.value = false;
}

const gasUsedShare = computed(() => {
  if (!block.value) {
    return 0;
  }
  const gasUsed = parseInt(block.value.gasUsed.toString());
  const gasLimit = parseInt(block.value.gasLimit.toString());
  return gasUsed / gasLimit;
});

const transactions = computed<Transaction[]>(() => {
  const blockData = block.value;
  if (!blockData) {
    return [];
  }
  return blockData.transactions.map((transaction) => {
    return {
      blockPosition: transaction.transactionIndex,
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      function:
        transaction.input.length >= 10 ? slice(transaction.input, 0, 4) : '0x',
      data: transaction.input.length > 10 ? slice(transaction.input, 4) : '0x',
      value: transaction.value,
      gasPrice: transaction.gasPrice,
    } as Transaction;
  });
});

const page = ref(1);
const maxPage = computed(() => {
  if (!block.value) {
    return 1;
  }
  return Math.ceil(block.value.transactions.length / TRANSACTIONS_PER_PAGE);
});
</script>

<style scoped>
.list {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
