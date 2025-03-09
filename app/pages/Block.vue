<template>
  <ScopePage
    v-model:section="section"
    :sections="sections"
  >
    <ScopePanelLoading
      v-if="isLoading"
      title="Block"
      :subtitle="number.toString()"
    />
    <ScopePanel
      v-if="!isLoading && isFuture"
      title="Block"
      :subtitle="number.toString()"
    >
      <ScopeEmptyState
        label="Sorry, time traveler, but this block has not been produced yet"
      >
        <template #actions>
          <ScopeButton
            kind="primary"
            @click="handleOpenLatestBlockClick"
          >
            Open latest
          </ScopeButton>
        </template>
      </ScopeEmptyState>
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading && !isFuture"
      title="Block"
      :subtitle="number.toString()"
    >
      <template #header>
        <ScopePaginator
          v-if="block"
          zero-based
          :show-page="false"
          :model-value="block.number"
          @update:model-value="handleBlockNumberUpdate"
        />
      </template>
      <BlockStatus
        v-if="block"
        status="executed"
      />
      <AttributeList v-if="block">
        <AttributeItem>
          <AttributeItemLabel
            value="Timestamp"
            note="The Unix epoch time at which the block was mined, indicating when this block was added to the blockchain"
          />
          <AttributeItemValue :note="blockRelativeTimeLabel">
            {{ formatTime(block.timestamp) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Transactions"
            note="All transactions included in the block"
          />
          <AttributeItemValue>
            {{ block.transactions.length }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="block.producer !== zeroAddress">
          <AttributeItemLabel
            value="Producer"
            note="Address of the entity (miner or validator) that created the block"
          />
          <AttributeItemValue>
            <LinkAddress :address="block.producer" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Gas used"
            note="Total amount of gas that was consumed by all transactions in the block"
          />
          <AttributeItemValue :note="formatShare(gasUsedShare)">
            {{ block.gasUsed.toString() }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Gas limit"
            note="Maximum amount of gas that can be consumed by all transactions in a single block"
          />
          <AttributeItemValue>
            {{ block.gasLimit.toString() }}
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </ScopePanel>
    <template #section>
      <template v-if="section === SECTION_TRANSACTIONS && !isFuture">
        <ScopePanelLoading
          v-if="isLoading"
          title="Logs"
        />
        <ScopePanel
          v-else
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

            <template v-else>
              <TableTransactions
                :transactions
                :page="page - 1"
                :per-page="perPage"
                type="block"
              />
              <div class="panel-footer">
                <SelectPerPage v-model="perPage" />
                <ScopePaginator
                  v-model="page"
                  :total="maxPage"
                />
              </div>
            </template>
          </template>
        </ScopePanel>
      </template>
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { slice, zeroAddress } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopeEmptyState from '@/components/__common/ScopeEmptyState.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
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
import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useRoute from '@/composables/useRoute';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import EvmService from '@/services/evm';
import type { BlockWithTransactions } from '@/services/evm';
import type { Command } from '@/stores/commands';
import { toBigInt, toRelativeTime } from '@/utils/conversion';
import {
  formatRelativeTime,
  formatShare,
  formatTime,
} from '@/utils/formatting';
import { getRouteLocation, type BlockRouteLocation } from '@/utils/routing';

const SECTION_TRANSACTIONS = 'transactions';

const section = ref<string>(SECTION_TRANSACTIONS);
const sections = computed<Section[]>(() => {
  return [
    {
      label: 'Transactions',
      value: SECTION_TRANSACTIONS,
    },
  ];
});

const route = useRoute<BlockRouteLocation>();
const router = useRouter();
const { requestAbi } = useAbi();
const { id: chainId, name: chainName, client } = useChain();
const { setCommands } = useCommands();
const { send: sendToast } = useToast();

const number = computed(() => toBigInt(route.params.number) || 0n);

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

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);
const evmService = computed(() =>
  client.value ? new EvmService(client.value) : null,
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

watch(block, () => {
  if (!block.value) {
    return;
  }
  fetchAbis(block.value);
});

async function fetchAbis(block: BlockWithTransactions): Promise<void> {
  if (!apiService.value) {
    return;
  }
  for (const transaction of block.transactions) {
    if (!transaction.to) {
      continue;
    }
    const functionSignature = slice(transaction.input, 0, 4);
    requestAbi(transaction.to, {
      functionNames: [functionSignature],
    });
  }
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
        transaction.to && transaction.input.length >= 10
          ? slice(transaction.input, 0, 4)
          : '0x',
      data: transaction.to
        ? transaction.input.length > 10
          ? slice(transaction.input, 4)
          : '0x'
        : transaction.input,
      value: transaction.value,
      gasPrice: transaction.gasPrice,
    } as Transaction;
  });
});

const perPage = ref(20);
const page = ref(1);
const maxPage = computed(() => {
  if (!block.value) {
    return 1;
  }
  return Math.ceil(block.value.transactions.length / perPage.value);
});
watch(perPage, () => {
  page.value = 1;
});

async function handleBlockNumberUpdate(number: number): Promise<void> {
  router.push(getRouteLocation({ name: 'block', number: BigInt(number) }));
}

async function handleOpenLatestBlockClick(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  const block = await evmService.value.getLatestBlock();
  router.push(getRouteLocation({ name: 'block', number: block }));
}
</script>

<style scoped>
.panel-footer {
  display: flex;
  justify-content: space-between;
}
</style>
