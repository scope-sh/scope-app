<template>
  <ScopePage
    :sections="sections"
    @update:section="handleSectionUpdate"
  >
    <ScopePanelLoading
      v-if="isLoadingBalance || isLoadingCode"
      ref="addressPanelEl"
      title="Address"
      :subtitle="address"
    />
    <ScopePanel
      v-else
      ref="addressPanelEl"
      :title="overviewPanelTitle"
      :subtitle="address"
    >
      <FormEther
        v-if="address"
        v-model:balance="etherBalance"
        :address="address"
      />
      <div
        v-if="addressLabel"
        class="label"
      >
        <div class="label-icon"></div>
        <div class="label-details">
          <div
            v-if="addressLabel.namespace"
            class="label-namespace"
          >
            {{ addressLabel.namespace.value }}
          </div>
          <div class="label-value">{{ addressLabel.value }}</div>
        </div>
      </div>
      <LensView
        v-if="address && isContract && addressLabel && addressLabel.type"
        :label-type-id="addressLabel.type.id"
        :address="address"
      />
    </ScopePanel>
    <ScopePanelLoading
      v-if="isLoadingOps"
      ref="addressOpsEl"
      title="UserOps"
    />
    <ScopePanel
      v-else-if="ops.length > 0"
      ref="addressOpsEl"
      title="UserOps"
    >
      <template #header>
        <ScopePaginator
          v-if="opRows.length"
          v-model="opPage"
          :total="maxOpPage"
        />
      </template>
      <template #default>
        <ScopeLabelEmptyState
          v-if="!opRows.length"
          value="No ops found"
        />
        <TableUserOps
          v-else
          :ops="opRows"
          :per-page="OPS_PER_PAGE"
          :page="opPage - 1"
        />
      </template>
    </ScopePanel>
    <ScopePanelLoading
      v-if="isLoadingTransactions"
      ref="addressTransactionsEl"
      title="Transactions"
    />
    <ScopePanel
      v-else
      ref="addressTransactionsEl"
      title="Transactions"
    >
      <template #header>
        <ScopePaginator
          v-if="transactionRows.length"
          v-model="transactionPage"
          :total="maxTransactionPage"
        />
      </template>
      <ScopeLabelEmptyState
        v-if="!transactionRows.length"
        value="No transactions found"
      />
      <TableTransactions
        v-else
        :transactions="transactionRows"
        :per-page="TRANSACTIONS_PER_PAGE"
        :page="transactionPage - 1"
        type="address"
      />
    </ScopePanel>
    <ScopePanelLoading
      v-if="isLoadingLogs"
      ref="addressLogsEl"
      title="Logs"
    />
    <ScopePanel
      v-else
      ref="addressLogsEl"
      title="Logs"
    >
      <template #header>
        <ScopePaginator
          v-if="logRows.length"
          v-model="logPage"
          :total="maxLogPage"
        />
      </template>
      <template #default>
        <ScopeLabelEmptyState
          v-if="!logRows.length"
          value="No logs found"
        />
        <div
          v-else
          class="logs"
        >
          <CardLog
            v-for="(log, index) in logRows"
            :key="index"
            :log="log"
            type="address"
          />
        </div>
      </template>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { Address, Hex, Log, slice } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardLog from '@/components/__common/CardLog.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import TableTransactions, {
  Transaction as TransactionRow,
} from '@/components/__common/TableTransactions.vue';
import FormEther from '@/components/address/FormEther.vue';
import LensView from '@/components/address/LensView.vue';
import TableUserOps, {
  UserOp as UserOpRow,
} from '@/components/address/TableUserOps.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import ApiService, {
  Log as AddressLog,
  Transaction as AddressTransaction,
} from '@/services/api';
import EvmService from '@/services/evm';
import IndexerService, { UserOp } from '@/services/indexer';
import { Command } from '@/stores/commands';

const PAGE_ADDRESS = 'page_address';
const SECTION_OVERVIEW = 'overview';
const SECTION_TRANSACTIONS = 'transactions';
const SECTION_LOGS = 'logs';

type PanelEl = InstanceType<typeof ScopePanel>;
type PanelSection = Section & { el: PanelEl | null };

const { setCommands } = useCommands(PAGE_ADDRESS);
const { send: sendToast } = useToast();
const route = useRoute();
const { id: chainId, name: chainName, client } = useChain();
const { getLabel, requestLabels } = useLabels();

const addressPanelEl = ref<PanelEl | null>(null);
const addressTransactionsEl = ref<PanelEl | null>(null);
const addressLogsEl = ref<PanelEl | null>(null);
const sections = computed<PanelSection[]>(() => [
  {
    label: 'Overview',
    value: SECTION_OVERVIEW,
    el: addressPanelEl.value,
  },
  {
    label: 'Transactions',
    value: SECTION_TRANSACTIONS,
    el: addressTransactionsEl.value,
  },
  {
    label: 'Logs',
    value: SECTION_LOGS,
    el: addressLogsEl.value,
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

const address = computed(() => {
  const address = route.params.address as string;
  return address.toLowerCase() as Address;
});

const commands = computed<Command[]>(() => [
  {
    icon: 'copy',
    label: 'Copy address',
    act: (): void => {
      if (!address.value) {
        return;
      }
      navigator.clipboard.writeText(address.value);
      sendToast({
        type: 'success',
        message: 'Address copied to clipboard',
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

watch(address, () => {
  // Clean up the state
  transactions.value = [];
  transactionPage.value = 1;
  logs.value = [];
  logPage.value = 1;
  ops.value = [];
  opPage.value = 1;
  // Fetch new data
  fetch();
});

watch(
  address,
  () => {
    useHead({
      title: `Address ${address.value} on ${chainName.value} | Scope`,
    });
  },
  {
    immediate: true,
  },
);

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);
const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);
const indexerService = computed(() =>
  chainId.value ? new IndexerService(chainId.value) : null,
);

const isLoadingBalance = ref(false);
const etherBalance = ref<bigint | undefined>(undefined);

const isLoadingCode = ref(false);
const code = ref<string | null>(null);

const isLoadingTransactions = ref(false);
const transactions = ref<AddressTransaction[]>([]);

const isLoadingLogs = ref(false);
const logs = ref<AddressLog[]>([]);

const isLoadingOps = ref(false);
const ops = ref<UserOp[]>([]);

const isContract = computed<boolean>(() => !!code.value);
const addressLabel = computed(() => getLabel(address.value));
const overviewPanelTitle = computed<string>(() => {
  if (!isContract.value) {
    return 'Address';
  }
  if (!addressLabel.value) {
    return 'Contract';
  }
  if (!addressLabel.value.type) {
    return 'Contract';
  }
  return `Contract — ${addressLabel.value.type.value}`;
});

async function fetch(): Promise<void> {
  if (!address.value) {
    return;
  }
  await Promise.all([
    fetchBalance(),
    fetchCode(),
    fetchTransactions(),
    fetchLogs(),
    fetchUserOps(),
  ]);
}

async function fetchBalance(): Promise<void> {
  if (!address.value || !evmService.value) {
    return;
  }
  isLoadingBalance.value = true;
  etherBalance.value = await evmService.value.getBalance(address.value);
  isLoadingBalance.value = false;
}

async function fetchCode(): Promise<void> {
  if (!address.value || !evmService.value) {
    return;
  }
  isLoadingCode.value = true;
  code.value = await evmService.value.getCode(address.value);
  isLoadingCode.value = false;
}

async function fetchTransactions(): Promise<void> {
  if (!address.value || !apiService.value) {
    return;
  }
  isLoadingTransactions.value = true;
  // Define the start block based on the last transaction in the list
  const lastTransaction = transactions.value.at(-1);
  const startBlock = lastTransaction ? lastTransaction.blockNumber : 0;
  const newTransactions = await apiService.value.getAddressTransactions(
    address.value,
    startBlock,
    TRANSACTIONS_PER_PAGE + 1,
  );
  // Append newly fetched transactions to the end of the list
  // Make sure there are no duplicates
  transactions.value = [
    ...new Map(
      transactions.value
        .concat(newTransactions)
        .map((transaction) => [transaction.hash, transaction]),
    ).values(),
  ];
  isLoadingTransactions.value = false;
}

async function fetchLogs(): Promise<void> {
  if (!address.value || !apiService.value) {
    return;
  }
  isLoadingLogs.value = true;
  // Define the start block based on the last transaction in the list
  const lastLog = logs.value.at(-1);
  const startBlock = lastLog ? lastLog.blockNumber : 0;
  const newLogs = await apiService.value.getAddressLogs(
    address.value,
    startBlock,
    LOGS_PER_PAGE + 1,
  );
  // Append newly fetched logs to the end of the list
  // Make sure there are no duplicates
  logs.value = [
    ...new Map(
      logs.value
        .concat(newLogs)
        .map((log) => [`${log.transactionHash}-${log.logIndex}`, log]),
    ).values(),
  ];
  isLoadingLogs.value = false;
}

async function fetchUserOps(): Promise<void> {
  if (!address.value || !indexerService.value) {
    return;
  }
  ops.value = await indexerService.value.getUserOpsByAddress(
    address.value,
    0,
    OPS_PER_PAGE,
  );
}

const TRANSACTIONS_PER_PAGE = 20;
const transactionPage = ref(1);
const transactionRows = computed<TransactionRow[]>(() => {
  return transactions.value.map((transaction) => {
    return {
      success: transaction.status > 0,
      blockNumber: transaction.blockNumber,
      transactionIndex: transaction.transactionIndex,
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to || null,
      function:
        transaction.input.length >= 10 ? slice(transaction.input, 0, 4) : '0x',
      data: transaction.input.length > 10 ? slice(transaction.input, 4) : '0x',
      value: BigInt(transaction.value),
      gasPrice: BigInt(transaction.gasPrice),
    };
  });
});
const maxTransactionPage = computed(() => {
  return Math.ceil(transactions.value.length / TRANSACTIONS_PER_PAGE);
});

watch(transactionPage, (page) => {
  if (transactionRows.value.length >= page * TRANSACTIONS_PER_PAGE) {
    return;
  }
  fetchTransactions();
});

const LOGS_PER_PAGE = 20;
const logPage = ref(1);
const logRows = computed<Log[]>(() => {
  return logs.value
    .map((log) => {
      return {
        blockHash: null,
        blockNumber: BigInt(log.blockNumber),
        transactionHash: log.transactionHash,
        transactionIndex: null,
        logIndex: log.logIndex,
        address: log.address,
        topics: log.topics as [Hex, ...Hex[]],
        data: log.data,
        removed: false,
      };
    })
    .slice((logPage.value - 1) * LOGS_PER_PAGE, logPage.value * LOGS_PER_PAGE);
});
const maxLogPage = computed(() => {
  return Math.ceil(logs.value.length / LOGS_PER_PAGE);
});

watch(logPage, (page) => {
  if (logs.value.length >= page * LOGS_PER_PAGE) {
    return;
  }
  fetchLogs();
});

const OPS_PER_PAGE = 20;
const opPage = ref(1);
const opRows = computed<UserOpRow[]>(() => {
  return ops.value
    .map((op) => {
      return {
        success: op.success,
        entryPoint: op.entryPoint,
        hash: op.hash,
        paymaster: op.paymaster,
        blockNumber: op.blockNumber,
        transactionHash: op.transactionHash,
      };
    })
    .slice((opPage.value - 1) * OPS_PER_PAGE, opPage.value * OPS_PER_PAGE);
});
const maxOpPage = computed(() => {
  return Math.ceil(ops.value.length / OPS_PER_PAGE);
});

watch(opPage, (page) => {
  if (ops.value.length >= page * OPS_PER_PAGE) {
    return;
  }
  fetchUserOps();
});

const addresses = computed(() => {
  const addresses: Address[] = [];
  addresses.push(address.value);
  addresses.push(
    ...transactionRows.value.map((transaction) => transaction.from),
  );
  addresses.push(
    ...transactionRows.value
      .map((transaction) => transaction.to)
      .filter((to): to is Address => to !== null),
  );
  addresses.push(...logRows.value.map((log) => log.address));
  return addresses;
});

watch(
  addresses,
  async () => {
    requestLabels(addresses.value);
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.label {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.label-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-background-secondary);
}

.label-details {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
}

.label-namespace {
  display: flex;
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}

.label-value {
  display: flex;
  font-size: var(--font-size-l);
}

.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
