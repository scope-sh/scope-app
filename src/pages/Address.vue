<template>
  <ScopePage
    v-model:section="section"
    :sections="sections"
  >
    <ScopePanelLoading
      v-if="isLoadingBalance || isLoadingCode"
      title="Address"
      :subtitle="address"
    />
    <ScopePanel
      v-else
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
    <template #section>
      <template v-if="section === SECTION_OPS">
        <ScopePanelLoading
          v-if="isLoadingOps"
          title="UserOps"
        />
        <ScopePanel
          v-else-if="ops.length > 0"
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
      </template>
      <template v-else-if="section === SECTION_TRANSACTIONS">
        <ScopePanelLoading
          v-if="isLoadingTransactions"
          title="Transactions"
        />
        <ScopePanel
          v-else
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
            :address="address"
            :transactions="transactionRows"
            :per-page="TRANSACTIONS_PER_PAGE"
            :page="transactionPage - 1"
            type="address"
          />
        </ScopePanel>
      </template>
      <template v-else-if="section === SECTION_LOGS">
        <ScopePanelLoading
          v-if="isLoadingLogs"
          title="Logs"
        />
        <ScopePanel
          v-else
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
      </template>
      <template v-else-if="section === SECTION_CODE">
        <PanelCode
          v-if="isContract && bytecode"
          :bytecode
          :contract
          :address
        />
      </template>
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { Address, Hex, slice } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardLog, { Log } from '@/components/__common/CardLog.vue';
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
import PanelCode from '@/components/address/PanelCode.vue';
import TableUserOps, {
  UserOp as UserOpRow,
} from '@/components/address/TableUserOps.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import ApiService, { type Contract } from '@/services/api';
import EvmService from '@/services/evm';
import HypersyncService, {
  Log as AddressLog,
  Transaction as AddressTransaction,
} from '@/services/hypersync';
import IndexerService, { UserOp } from '@/services/indexer';
import { Command } from '@/stores/commands';

const PAGE_ADDRESS = 'page_address';
const SECTION_OPS = 'ops';
const SECTION_TRANSACTIONS = 'transactions';
const SECTION_LOGS = 'logs';
const SECTION_CODE = 'code';

const { indexerEndpoint } = useEnv();
const { setCommands } = useCommands(PAGE_ADDRESS);
const { send: sendToast } = useToast();
const route = useRoute();
const { id: chainId, name: chainName, client } = useChain();
const { getLabel, requestLabels } = useLabels();

const section = ref<string>(SECTION_TRANSACTIONS);
const sections = computed<Section[]>(() => {
  const sections: Section[] = [];
  sections.push(
    ...[
      {
        label: 'Transactions',
        value: SECTION_TRANSACTIONS,
      },
      {
        label: 'Logs',
        value: SECTION_LOGS,
      },
    ],
  );
  if (ops.value.length > 0) {
    sections.push({
      label: 'UserOps',
      value: SECTION_OPS,
    });
  }
  if (isContract.value && bytecode.value) {
    sections.push({
      label: 'Code',
      value: SECTION_CODE,
    });
  }
  return sections;
});

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
  maxTransactionPage.value = Infinity;
  maxLogPage.value = Infinity;
  // Fetch new data
  fetch();
});

useHead({
  title: () => `Address ${address.value} on ${chainName.value} | Scope`,
});

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);
const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);
const indexerService = computed(() =>
  chainId.value ? new IndexerService(indexerEndpoint, chainId.value) : null,
);
const hypersyncService = computed(() =>
  chainId.value ? new HypersyncService(chainId.value) : null,
);

const isLoadingBalance = ref(false);
const etherBalance = ref<bigint | null>(null);

const isLoadingCode = ref(false);
const isLoadingContract = ref(false);
const bytecode = ref<Hex | null>(null);
const contract = ref<Contract | null>(null);

const isLoadingTransactions = ref(false);
const transactions = ref<AddressTransaction[]>([]);

const isLoadingLogs = ref(false);
const logs = ref<AddressLog[]>([]);

const isLoadingOps = ref(false);
const ops = ref<UserOp[]>([]);

const isContract = computed<boolean>(() => !!bytecode.value);
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
    fethcContract(),
    fetchTransactions(),
    fetchLogs(),
    fetchUserOps(),
  ]);
}

async function fetchBalance(): Promise<void> {
  etherBalance.value = null;
  if (!address.value || !evmService.value) {
    return;
  }
  isLoadingBalance.value = true;
  etherBalance.value = await evmService.value.getBalance(address.value);
  isLoadingBalance.value = false;
}

async function fetchCode(): Promise<void> {
  bytecode.value = null;
  if (!address.value || !evmService.value) {
    return;
  }
  isLoadingCode.value = true;
  bytecode.value = await evmService.value.getCode(address.value);
  isLoadingCode.value = false;
}

async function fethcContract(): Promise<void> {
  contract.value = null;
  if (!address.value || !apiService.value) {
    return;
  }
  isLoadingContract.value = true;
  contract.value = await apiService.value.getContractSource(address.value);
  isLoadingContract.value = false;
}

const TRANSACTIONS_PER_PAGE = 20;
const transactionPage = ref(1);
const maxTransactionPage = ref(Infinity);
watch(transactionPage, (page) => {
  if (transactionRows.value.length >= page * TRANSACTIONS_PER_PAGE) {
    return;
  }
  fetchTransactions();
});
async function fetchTransactions(): Promise<void> {
  if (!address.value || !hypersyncService.value) {
    return;
  }
  isLoadingTransactions.value = true;
  // Define the start block based on the last transaction in the list
  const lastTransaction = transactions.value.at(-1);
  const startBlock = lastTransaction ? lastTransaction.blockNumber : 0;
  const addressTransactions =
    await hypersyncService.value.getAddressTransactions(
      address.value,
      startBlock,
      TRANSACTIONS_PER_PAGE + 1,
    );
  const newTransactions = addressTransactions.transactions;
  // Append newly fetched transactions to the end of the list
  // Make sure there are no duplicates
  transactions.value = [
    ...new Map(
      transactions.value
        .concat(newTransactions)
        .map((transaction) => [transaction.hash, transaction]),
    ).values(),
  ];
  if (!addressTransactions.hasNextPage) {
    maxTransactionPage.value = Math.ceil(
      transactions.value.length / TRANSACTIONS_PER_PAGE,
    );
  }
  isLoadingTransactions.value = false;
}
const transactionRows = computed<TransactionRow[]>(() => {
  return transactions.value.map((transaction) => {
    return {
      success: transaction.status > 0,
      blockNumber: transaction.blockNumber,
      blockTimestamp: transaction.blockTimestamp,
      transactionIndex: transaction.transactionIndex,
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to || null,
      function:
        transaction.input.length >= 10 ? slice(transaction.input, 0, 4) : '0x',
      data: transaction.input.length > 10 ? slice(transaction.input, 4) : '0x',
      value: transaction.value,
      gasPrice: transaction.gasPrice,
    };
  });
});

const LOGS_PER_PAGE = 20;
const logPage = ref(1);
const maxLogPage = ref(Infinity);
watch(logPage, (page) => {
  if (logs.value.length >= page * LOGS_PER_PAGE) {
    return;
  }
  fetchLogs();
});
async function fetchLogs(): Promise<void> {
  if (!address.value || !hypersyncService.value) {
    return;
  }
  isLoadingLogs.value = true;
  // Define the start block based on the last transaction in the list
  const lastLog = logs.value.at(-1);
  const startBlock = lastLog ? lastLog.blockNumber : 0;
  const addressLogs = await hypersyncService.value.getAddressLogs(
    address.value,
    startBlock,
    LOGS_PER_PAGE + 1,
  );
  const newLogs = addressLogs.logs;
  // Append newly fetched logs to the end of the list
  // Make sure there are no duplicates
  logs.value = [
    ...new Map(
      logs.value
        .concat(newLogs)
        .map((log) => [`${log.transactionHash}-${log.logIndex}`, log]),
    ).values(),
  ];
  if (!addressLogs.hasNextPage) {
    maxLogPage.value = Math.ceil(logs.value.length / LOGS_PER_PAGE);
  }
  isLoadingLogs.value = false;
}
const logRows = computed<Log[]>(() => {
  return logs.value
    .map((log) => {
      return {
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        address: log.address,
        topics: log.topics,
        data: log.data,
      };
    })
    .slice((logPage.value - 1) * LOGS_PER_PAGE, logPage.value * LOGS_PER_PAGE);
});

const OPS_PER_PAGE = 20;
const opPage = ref(1);
const maxOpPage = computed(() => {
  return Math.ceil(ops.value.length / OPS_PER_PAGE);
});
watch(opPage, (page) => {
  if (ops.value.length >= page * OPS_PER_PAGE) {
    return;
  }
  fetchUserOps();
});
async function fetchUserOps(): Promise<void> {
  if (!address.value || !indexerService.value) {
    return;
  }
  isLoadingOps.value = true;
  const newOps = await indexerService.value.getUserOpsByAddress(
    address.value,
    (opPage.value - 1) * OPS_PER_PAGE,
    OPS_PER_PAGE + 1,
  );
  // Append newly fetched ops to the end of the list
  // Make sure there are no duplicates
  ops.value = [
    ...new Map(ops.value.concat(newOps).map((op) => [op.hash, op])).values(),
  ];
  isLoadingOps.value = false;
}
const opRows = computed<UserOpRow[]>(() => {
  return ops.value.map((op) => {
    return {
      success: op.success,
      entryPoint: op.entryPoint,
      nonce: op.nonce,
      blockNumber: op.blockNumber,
      blockTimestamp: 1000 * op.blockTimestamp,
      transactionHash: op.transactionHash,
      hash: op.hash,
      bundler: op.bundler,
      paymaster: op.paymaster,
    };
  });
});

const addresses = computed(() => {
  const addresses: Address[] = [];
  addresses.push(address.value);
  addresses.push(...transactions.value.map((transaction) => transaction.from));
  addresses.push(
    ...transactions.value
      .map((transaction) => transaction.to)
      .filter((to): to is Address => to !== null),
  );
  addresses.push(...logs.value.map((log) => log.address));
  addresses.push(...ops.value.map((op) => op.bundler));
  addresses.push(...ops.value.map((op) => op.paymaster));
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
