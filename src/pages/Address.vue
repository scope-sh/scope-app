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
        v-if="primaryLabel"
        class="label"
      >
        <LabelIcon
          :uri="primaryLabel.iconUrl || null"
          class="label-icon"
        />
        <div class="label-details">
          <div
            v-if="primaryLabel.namespace"
            class="label-namespace"
          >
            {{ primaryLabel.namespace.value }}
          </div>
          <div class="label-value">{{ primaryLabel.value }}</div>
        </div>
        <ScopePopover v-if="addressLabels.length > 1">
          <template #trigger>
            <ScopeIcon
              class="icon"
              kind="chevron-down"
            />
          </template>
          <template #default>
            <div class="panel-known-labels">
              <h3 class="panel-known-labels header">All known names</h3>
              <ul class="panel-known-labels list">
                <li
                  v-for="(label, index) in addressLabels"
                  :key="index"
                  class="panel-known-labels item"
                >
                  <template v-if="label.namespace">
                    {{ label.namespace.value }}:
                  </template>
                  {{ label.value }}
                </li>
              </ul>
            </div>
          </template>
        </ScopePopover>
      </div>
      <LensView
        v-if="address && isContract && primaryLabel && primaryLabel.type"
        :label-types
        :address
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
              <ScopeToggle
                v-model="selectedLogView"
                :options="logViewOptions"
              />
              <CardLog
                v-for="(log, index) in logRows"
                :key="index"
                :log="log"
                :view="selectedLogView"
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
import {
  AbiEvent,
  AbiFunction,
  Address,
  Hex,
  slice,
  toEventSelector,
  toFunctionSelector,
} from 'viem';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardLog, { Log, LogView } from '@/components/__common/CardLog.vue';
import LabelIcon from '@/components/__common/LabelIcon.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopePopover from '@/components/__common/ScopePopover.vue';
import ScopeToggle, {
  Option as ToggleOption,
} from '@/components/__common/ScopeToggle.vue';
import TableTransactions, {
  Transaction as TransactionRow,
} from '@/components/__common/TableTransactions.vue';
import FormEther from '@/components/address/FormEther.vue';
import LensView from '@/components/address/LensView.vue';
import PanelCode from '@/components/address/PanelCode.vue';
import TableUserOps, {
  UserOp as UserOpRow,
} from '@/components/address/TableUserOps.vue';
import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import ApiService, { type Contract, LabelType } from '@/services/api';
import EvmService from '@/services/evm';
import HypersyncService, {
  Log as AddressLog,
  Transaction as AddressTransaction,
  Pagination,
  Sort,
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
const { getLabels, requestLabel } = useLabels();
const { addAbis } = useAbi();

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

onMounted(() => {
  fetch();
  requestLabel(address.value, 'all');
});

watch(address, () => {
  // Clean up the state
  transactions.value = [];
  transactionPage.value = 1;
  logs.value = [];
  logPage.value = 1;
  ops.value = [];
  opPage.value = 1;
  transactionPagination.value = {
    cursor: null,
    height: null,
  };
  logPagination.value = {
    cursor: null,
    height: null,
  };
  // Fetch new data
  fetch();
  requestLabel(address.value, 'all');
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
const addressLabels = computed(() => getLabels(address.value));
const primaryLabel = computed(() => addressLabels.value[0] || null);
const labelTypes = computed(() =>
  addressLabels.value
    .map((label) => label.type)
    .filter((type): type is LabelType => !!type)
    .map((type) => type.id),
);
const overviewPanelTitle = computed<string>(() => {
  if (!isContract.value) {
    return 'Address';
  }
  if (!primaryLabel.value) {
    return 'Contract';
  }
  if (!primaryLabel.value.type) {
    return 'Contract';
  }
  return `Contract — ${primaryLabel.value.type.value}`;
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
watch(contract, (contract) => {
  if (!contract) {
    return;
  }
  const abi = contract.implementation?.abi || contract.abi;
  if (!abi) {
    return;
  }
  const addressFunctions: [Hex, AbiFunction][] = abi
    .filter((abi): abi is AbiFunction => abi.type === 'function')
    .map((abi) => [toFunctionSelector(abi), abi]);
  const addressEvents: [Hex, AbiEvent][] = abi
    .filter((abi): abi is AbiEvent => abi.type === 'event')
    .map((abi) => [toEventSelector(abi), abi]);
  addAbis({
    [address.value]: {
      functions: Object.fromEntries(addressFunctions),
      events: Object.fromEntries(addressEvents),
    },
  });
});
const selectedLogView = ref<LogView>('decoded');
const logViewOptions = computed<ToggleOption<LogView>[]>(() => [
  {
    value: 'decoded',
    icon: 'text',
  },
  {
    value: 'hex',
    icon: 'hex-string',
  },
]);

const sort = computed<Sort | null>(() => {
  if (!hypersyncService.value) {
    return null;
  }
  return hypersyncService.value.getSort();
});

const TRANSACTIONS_PER_PAGE = 20;
const transactionPage = ref(1);
const transactionPagination = ref<Pagination>({
  cursor: null,
  height: null,
});
const maxTransactionPage = computed(() =>
  getMaxPage(
    sort.value,
    transactionPagination.value,
    transactions.value.length,
    TRANSACTIONS_PER_PAGE,
  ),
);
watch(transactionPage, (page) => {
  if (transactionRows.value.length >= page * TRANSACTIONS_PER_PAGE) {
    return;
  }
  fetchTransactions();
});
async function fetchTransactions(): Promise<void> {
  if (!address.value || !hypersyncService.value || !sort.value) {
    return;
  }
  isLoadingTransactions.value = true;
  const addressTransactions =
    await hypersyncService.value.getAddressTransactions(
      address.value,
      transactionPagination.value.cursor,
      TRANSACTIONS_PER_PAGE + 1,
      sort.value,
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
  transactionPagination.value = addressTransactions.pagination;
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
const logPagination = ref<Pagination>({
  cursor: null,
  height: null,
});
const maxLogPage = computed(() =>
  getMaxPage(sort.value, logPagination.value, logs.value.length, LOGS_PER_PAGE),
);
watch(logPage, (page) => {
  if (logs.value.length >= page * LOGS_PER_PAGE) {
    return;
  }
  fetchLogs();
});
async function fetchLogs(): Promise<void> {
  if (!address.value || !hypersyncService.value || !sort.value) {
    return;
  }
  isLoadingLogs.value = true;
  const addressLogs = await hypersyncService.value.getAddressLogs(
    address.value,
    logPagination.value.cursor,
    LOGS_PER_PAGE + 1,
    sort.value,
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
  logPagination.value = addressLogs.pagination;
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

function getMaxPage(
  sort: Sort | null,
  pagination: Pagination,
  count: number,
  perPage: number,
): number {
  if (!pagination.height) {
    return Infinity;
  }
  if (!pagination.cursor) {
    return Infinity;
  }
  const maxPage = Math.ceil(count / perPage);
  return sort === 'asc'
    ? pagination.cursor < pagination.height
      ? Infinity
      : maxPage
    : pagination.cursor > 0
      ? Infinity
      : maxPage;
}

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

const commands = computed<Command[]>(() => {
  const commands: Command[] = [
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
  ];
  const contractAbi =
    contract.value?.implementation?.abi || contract.value?.abi;
  if (contractAbi) {
    commands.push({
      icon: 'copy',
      label: 'Copy ABI',
      act: () => {
        navigator.clipboard.writeText(JSON.stringify(contractAbi, null, 2));
        sendToast({
          type: 'success',
          message: 'ABI copied to clipboard',
        });
      },
    });
  }
  return commands;
});

watch(
  commands,
  () => {
    setCommands(commands.value);
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

.icon {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  color: var(--color-text-primary);

  &:hover {
    opacity: 1;
  }
}

.panel-known-labels {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;

  & .header {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-s);
    font-weight: var(--font-weight-regular);
  }

  & .list {
    gap: var(--spacing-2);
    margin: 0;
    padding-left: 0;
    list-style-type: none;
  }
}

.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
