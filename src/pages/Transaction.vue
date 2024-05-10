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
      v-else-if="!isLoading && transaction === null"
      ref="txPanelEl"
      title="Transaction"
      :subtitle="hash"
    >
      <ScopeEmptyState label="Couldn't find this transaction">
        <template #actions>
          <ScopeButton @click="handleOpenAsUserOpClick">
            Open as UserOp
          </ScopeButton>
        </template>
      </ScopeEmptyState>
    </ScopePanel>
    <ScopePanel
      v-else
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
            <LinkBlock :number="transaction.blockNumber" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="block && block.timestamp">
          <AttributeItemLabel :value="'Timestamp'" />
          <AttributeItemValue :note="blockRelativeTimeLabel">
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
      v-if="!isLoading && userOps && userOps.length > 0"
      ref="txOpsEl"
      title="UserOps"
    >
      <template
        v-if="transaction && transactionReceipt"
        #default
      >
        <CardUserOp
          v-for="(op, index) in userOps"
          :key="index"
          :entry-point="entryPoint"
          :op="op"
          :transaction="transaction"
          :transaction-receipt="transactionReceipt"
        />
      </template>
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
            type="transaction"
          />
        </div>
      </template>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { Address, Hex, TransactionType } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CardLog from '@/components/__common/CardLog.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopeEmptyState from '@/components/__common/ScopeEmptyState.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
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
import CardUserOp from '@/components/transaction/CardUserOp.vue';
import TransactionStatus from '@/components/transaction/TransactionStatus.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import EvmService, { Block } from '@/services/evm';
import type { Transaction, TransactionReceipt } from '@/services/evm';
import { Command } from '@/stores/commands';
import {
  UserOp,
  getEntryPoint,
  getUserOps,
} from '@/utils/context/erc4337/entryPoint';
import { toRelativeTime } from '@/utils/conversion';
import {
  formatEther,
  formatGasPrice,
  formatRelativeTime,
  formatShare,
  formatTime,
} from '@/utils/formatting';
import { getRouteLocation } from '@/utils/routing';

const PAGE_TRANSACTION = 'page_transaction';
const SECTION_OVERVIEW = 'overview';
const SECTION_OPS = 'ops';
const SECTION_LOGS = 'logs';

const { setCommands } = useCommands(PAGE_TRANSACTION);
const { send: sendToast } = useToast();

type PanelEl = InstanceType<typeof ScopePanel>;
type PanelSection = Section & { el: PanelEl | null };

const route = useRoute();
const router = useRouter();
const { id: chainId, name: chainName, client } = useChain();
const { requestLabels } = useLabels();

const txPanelEl = ref<PanelEl | null>(null);
const txOpsEl = ref<PanelEl | null>(null);
const txLogsEl = ref<PanelEl | null>(null);
const sections = computed<PanelSection[]>(() => {
  const list: PanelSection[] = [];
  list.push({
    label: 'Overview',
    value: SECTION_OVERVIEW,
    el: txPanelEl.value,
  });
  if (userOps.value && userOps.value.length > 0) {
    list.push({
      label: 'UserOps',
      value: SECTION_OPS,
      el: txOpsEl.value,
    });
  }
  list.push({
    label: 'Logs',
    value: SECTION_LOGS,
    el: txLogsEl.value,
  });
  return list;
});
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

const hash = computed(() => route.params.hash as Address);

const commands = computed<Command[]>(() => [
  {
    icon: 'copy',
    label: 'Copy transaction hash',
    act: (): void => {
      if (!hash.value) {
        return;
      }
      navigator.clipboard.writeText(hash.value);
      sendToast({
        type: 'success',
        message: 'Transaction hash copied to clipboard',
      });
    },
  },
  {
    icon: 'arrow-left',
    label: 'Previous transaction',
    act: (): void => {
      if (transaction.value && transaction.value.transactionIndex) {
        openBlockTransaction(
          transaction.value.transactionIndex - 1,
          'No previous transaction',
        );
      }
    },
  },
  {
    icon: 'arrow-right',
    label: 'Next transaction',
    act: (): void => {
      if (transaction.value && transaction.value.transactionIndex) {
        openBlockTransaction(
          transaction.value.transactionIndex + 1,
          'No next transaction',
        );
      }
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
    label: 'Go to logs',
    act: (): void => {
      openSection(SECTION_LOGS);
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
  await Promise.all([
    fetchTransaction(hash.value),
    fetchTransactionReceipt(hash.value),
  ]);
  if (transaction.value && transaction.value.blockNumber) {
    block.value = await evmService.value.getBlock(
      transaction.value.blockNumber,
    );
  }
  isLoading.value = false;
}

async function fetchTransaction(hash: Hex): Promise<void> {
  if (!evmService.value) {
    return;
  }
  transaction.value = await evmService.value.getTransaction(hash);
}

async function fetchTransactionReceipt(hash: Hex): Promise<void> {
  if (!evmService.value) {
    return;
  }
  transactionReceipt.value = await evmService.value.getTransactionReceipt(hash);
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

const entryPoint = ref<Address | null>(null);
const userOps = ref<UserOp[] | null>(null);
watch(transaction, async () => {
  if (!transaction.value) {
    return;
  }
  entryPoint.value = getEntryPoint(transaction.value);
  userOps.value = await getUserOps(client.value, transaction.value);
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

async function openBlockTransaction(
  index: number,
  errorMessage: string,
): Promise<void> {
  if (!evmService.value || !block.value) {
    return;
  }
  const transaction = await evmService.value.getBlockTransaction(
    block.value.number,
    index,
  );
  if (!transaction) {
    sendToast({
      type: 'error',
      message: errorMessage,
    });
    return;
  }
  router.push({
    name: 'transaction',
    params: { hash: transaction.hash },
  });
}

function handleOpenAsUserOpClick(): void {
  router.push(getRouteLocation({ name: 'userop', hash: hash.value }));
}
</script>

<style scoped>
.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
