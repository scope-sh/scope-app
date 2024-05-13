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
      <ScopeEmptyState
        label="Sorry, time traveler, but this block has not been produced yet"
      >
        <template #actions>
          <ScopeButton @click="handleOpenLatestBlockClick">
            Open latest
          </ScopeButton>
        </template>
      </ScopeEmptyState>
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
          <AttributeItemValue :note="blockRelativeTimeLabel">
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
          type="block"
        />
      </template>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { Address, slice, zeroAddress } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopeEmptyState from '@/components/__common/ScopeEmptyState.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import TableTransactions, {
  type Transaction,
} from '@/components/__common/TableTransactions.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import BlockStatus from '@/components/block/BlockStatus.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import EvmService from '@/services/evm';
import type { BlockWithTransactions } from '@/services/evm';
import { Command } from '@/stores/commands';
import { toBigInt, toRelativeTime } from '@/utils/conversion';
import {
  formatRelativeTime,
  formatShare,
  formatTime,
} from '@/utils/formatting';
import { getRouteLocation } from '@/utils/routing';

const PAGE_BLOCK = 'page_block';
const SECTION_OVERVIEW = 'overview';
const SECTION_TRANSACTIONS = 'transactions';
const TRANSACTIONS_PER_PAGE = 20;

const route = useRoute();
const router = useRouter();
const { id: chainId, name: chainName, client } = useChain();
const { requestLabels } = useLabels();
const { setCommands } = useCommands(PAGE_BLOCK);
const { send: sendToast } = useToast();

type PanelEl = InstanceType<typeof ScopePanel>;
type PanelSection = Section & { el: PanelEl | null };

const blockPanelEl = ref<PanelEl | null>(null);
const blockTransactionsEl = ref<PanelEl | null>(null);
const sections = computed<PanelSection[]>(() => [
  {
    label: 'Overview',
    value: SECTION_OVERVIEW,
    el: blockPanelEl.value,
  },
  {
    label: 'Transactions',
    value: SECTION_TRANSACTIONS,
    el: blockTransactionsEl.value,
  },
]);
function handleSectionUpdate(value: Section['value']): void {
  openSection(value);
}
function openSection(value: Section['value']): void {
  const panelSection = sections.value.find(
    (section) => section.value === value,
  );
  if (!panelSection) {
    return;
  }
  const el = panelSection.el;
  if (!el || !el.rootEl) {
    return;
  }
  el.rootEl.scrollIntoView({ behavior: 'smooth' });
}

const number = computed(() => toBigInt(route.params.number as string) || 0n);

const commands = computed<Command[]>(() => [
  {
    icon: 'copy',
    label: 'Copy block number',
    act: (): void => {
      navigator.clipboard.writeText(number.value.toString());
      sendToast({
        type: 'success',
        message: 'Block number copied to clipboard',
      });
    },
  },
  {
    icon: 'arrow-right',
    label: 'Go to overview',
    act: (): void => {
      openSection(SECTION_OVERVIEW);
    },
  },
  {
    icon: 'arrow-right',
    label: 'Go to transactions',
    act: (): void => {
      openSection(SECTION_TRANSACTIONS);
    },
  },
  {
    icon: 'arrow-left',
    label: 'Previous block',
    act: (): void => {
      router.push(
        getRouteLocation({ name: 'block', number: number.value - 1n }),
      );
    },
  },
  {
    icon: 'arrow-right',
    label: 'Next block',
    act: (): void => {
      router.push(
        getRouteLocation({ name: 'block', number: number.value + 1n }),
      );
    },
  },
]);

watch(
  commands,
  () => {
    setCommands(commands.value);
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  fetch();
});

watch(number, () => {
  page.value = 1;
  fetch();
});

useHead({
  title: () => `Block ${number.value} on ${chainName.value} | Scope`,
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

const blockRelativeTime = computed(() => {
  if (!block.value) {
    return null;
  }
  return toRelativeTime(new Date(), block.value.timestamp);
});

const blockRelativeTimeLabel = computed(() => {
  if (!blockRelativeTime.value) {
    return undefined;
  }
  return formatRelativeTime(blockRelativeTime.value);
});

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

async function handleOpenLatestBlockClick(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  const block = await evmService.value.getLatestBlock();
  router.push(getRouteLocation({ name: 'block', number: block }));
}

const addresses = computed(() => {
  if (!block.value) {
    return [];
  }
  const blockProducer = block.value.producer;
  const fromAddresses = block.value.transactions.map(
    (transaction) => transaction.from,
  );
  const toAddresses = block.value.transactions
    .map((transaction) => transaction.to)
    .filter((to): to is Address => to !== null);
  return [blockProducer, ...fromAddresses, ...toAddresses];
});

watch(addresses, async () => {
  requestLabels(addresses.value);
});
</script>
