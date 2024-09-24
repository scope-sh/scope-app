<template>
  <ScopePage
    v-model:section="section"
    :sections="sections"
    @update:section="handleSectionUpdate"
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
      <template
        v-if="deployment"
        #header
      >
        <CardDeployment :deployment />
      </template>
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
        <PanelOps
          v-model:page="opPage"
          v-model:per-page="opsPerPage"
          :is-loading="isLoadingOps"
          :items="ops"
          :max-page="maxOpPage"
          @refresh="refreshOps"
        />
      </template>
      <template v-else-if="section === SECTION_TRANSACTIONS">
        <PanelTransactions
          v-model:page="transactionPage"
          v-model:per-page="transactionsPerPage"
          :address
          :is-loading="isLoadingTransactions"
          :items="transactions"
          :max-page="maxTransactionPage"
          @refresh="refreshTransactions"
        />
      </template>
      <template v-else-if="section === SECTION_LOGS">
        <PanelLogs
          v-model:page="logPage"
          v-model:per-page="logsPerPage"
          :is-loading="isLoadingLogs"
          :items="logs"
          :max-page="maxLogPage"
          @refresh="refreshLogs"
        />
      </template>
      <template v-else-if="section === SECTION_CODE">
        <PanelCode
          v-if="isContract && bytecode"
          :address
          :bytecode
          :contract
        />
      </template>
      <template v-else-if="section === SECTION_INTERACT">
        <PanelInteract
          v-if="isContract"
          :contract
          :address
        />
      </template>
      <template v-else-if="section === SECTION_TRANSFERS">
        <PanelTransfers
          v-model:page="transferPage"
          v-model:per-page="transfersPerPage"
          :address
          :is-loading="isLoadingTransfers"
          :items="transfers"
          :max-page="maxTransferPage"
          @refresh="refreshTransfers"
        />
      </template>
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import type { AbiEvent, AbiFunction, Address, Hex } from 'viem';
import { toEventSelector, toFunctionSelector } from 'viem';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LabelIcon from '@/components/__common/LabelIcon.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopePopover from '@/components/__common/ScopePopover.vue';
import CardDeployment from '@/components/address/CardDeployment.vue';
import FormEther from '@/components/address/FormEther.vue';
import LensView from '@/components/address/LensView.vue';
import PanelCode from '@/components/address/PanelCode.vue';
import PanelInteract from '@/components/address/PanelInteract.vue';
import PanelLogs from '@/components/address/PanelLogs.vue';
import PanelOps from '@/components/address/PanelOps.vue';
import PanelTransactions from '@/components/address/PanelTransactions.vue';
import PanelTransfers from '@/components/address/PanelTransfers.vue';
import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import ApiService, {
  type Contract,
  type LabelType,
  type Deployment,
} from '@/services/api';
import EvmService from '@/services/evm';
import type {
  Log as AddressLog,
  Transaction as AddressTransaction,
  Transfer as AddressTransfer,
  Pagination,
  Sort,
} from '@/services/hypersync';
import HypersyncService from '@/services/hypersync';
import type { Op } from '@/services/indexer';
import IndexerService from '@/services/indexer';
import type { Command } from '@/stores/commands';

const SECTION_OPS = 'ops';
const SECTION_TRANSACTIONS = 'transactions';
const SECTION_LOGS = 'logs';
const SECTION_TRANSFERS = 'transfers';
const SECTION_CODE = 'code';
const SECTION_INTERACT = 'interact';

const { appBaseUrl, indexerEndpoint } = useEnv();
const { setCommands } = useCommands();
const { send: sendToast } = useToast();
const route = useRoute();
const { id: chainId, name: chainName, client } = useChain();
const { getLabels, requestLabel } = useLabels();
const { addAbis } = useAbi();

const address = computed(() => {
  const address = route.params.address as string;
  return address.toLowerCase() as Address;
});

const section = ref<string>(SECTION_TRANSACTIONS);
const sections = computed<Section[]>(() => {
  const sections: Section[] = [];
  if (ops.value.length > 0) {
    sections.push({
      label: 'UserOps',
      value: SECTION_OPS,
    });
  }
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
  sections.push({
    label: 'Transfers',
    value: SECTION_TRANSFERS,
  });
  if (isContract.value && bytecode.value) {
    sections.push({
      label: 'Code',
      value: SECTION_CODE,
    });
    sections.push({
      label: 'Interact',
      value: SECTION_INTERACT,
    });
  }
  return sections;
});

const sectionChanged = ref(false);
function handleSectionUpdate(): void {
  sectionChanged.value = true;
}

watch(address, () => {
  section.value = SECTION_TRANSACTIONS;
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
  transfers.value = [];
  transferPage.value = 1;
  transactionPagination.value = {
    cursor: null,
    height: null,
  };
  logPagination.value = {
    cursor: null,
    height: null,
  };
  transferPagination.value = {
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
  client.value ? new EvmService(client.value) : null,
);
const indexerService = computed(() =>
  chainId.value ? new IndexerService(indexerEndpoint, chainId.value) : null,
);
const hypersyncService = computed(() =>
  chainId.value ? new HypersyncService(chainId.value, appBaseUrl) : null,
);

const isLoadingBalance = ref(false);
const etherBalance = ref<bigint | null>(null);

const isLoadingCode = ref(false);
const isLoadingContract = ref(false);
const bytecode = ref<Hex | null>(null);
const contract = ref<Contract | null>(null);
const deployment = ref<Deployment | null>(null);

const isLoadingTransactions = ref(false);
const transactions = ref<AddressTransaction[]>([]);

const isLoadingLogs = ref(false);
const logs = ref<AddressLog[]>([]);

const isLoadingOps = ref(false);
const ops = ref<Op[]>([]);
watch(ops, (opsValue) => {
  if (opsValue.length > 0 && !sectionChanged.value) {
    section.value = SECTION_OPS;
  }
});

const isLoadingTransfers = ref(false);
const transfers = ref<AddressTransfer[]>([]);

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
    fetchOps(),
    fetchTransfers(),
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
  const response = await apiService.value.getContract(address.value);
  if (!response) {
    isLoadingContract.value = false;
    return;
  }
  contract.value = response.source;
  deployment.value = response.deployment;
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
      constructors: abi.filter((abi) => abi.type === 'constructor'),
      functionNames: Object.fromEntries(
        addressFunctions.map(([selector, abi]) => [selector, abi.name]),
      ),
      functions: Object.fromEntries(addressFunctions),
      events: Object.fromEntries(addressEvents),
    },
  });
});

const sort = computed<Sort | null>(() => {
  if (!hypersyncService.value) {
    return null;
  }
  return hypersyncService.value.getSort();
});

const transactionsPerPage = ref(20);
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
    transactionsPerPage.value,
  ),
);
watch(transactionsPerPage, () => {
  transactionPage.value = 1;
  fetchTransactions();
});
watch(transactionPage, (page) => {
  if (transactions.value.length >= page * transactionsPerPage.value) {
    return;
  }
  fetchTransactions();
});
async function fetchTransactions(): Promise<void> {
  if (!address.value || !hypersyncService.value || !sort.value) {
    return;
  }
  if (
    sort.value === 'desc' &&
    transactionPagination.value.cursor &&
    transactionPagination.value.cursor < 0
  ) {
    return;
  }
  isLoadingTransactions.value = true;
  const addressTransactions =
    await hypersyncService.value.getAddressTransactions(
      address.value,
      transactionPagination.value.cursor,
      transactionsPerPage.value + 1,
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
async function refreshTransactions(): Promise<void> {
  transactionPage.value = 1;
  transactionPagination.value = {
    cursor: null,
    height: null,
  };
  transactions.value = [];
  await fetchTransactions();
}

const logsPerPage = ref(20);
const logPage = ref(1);
const logPagination = ref<Pagination>({
  cursor: null,
  height: null,
});
const maxLogPage = computed(() =>
  getMaxPage(
    sort.value,
    logPagination.value,
    logs.value.length,
    logsPerPage.value,
  ),
);
watch(logsPerPage, () => {
  logPage.value = 1;
  fetchLogs();
});
watch(logPage, (page) => {
  if (logs.value.length >= page * logsPerPage.value) {
    return;
  }
  fetchLogs();
});
async function fetchLogs(): Promise<void> {
  if (!address.value || !hypersyncService.value || !sort.value) {
    return;
  }
  if (
    sort.value === 'desc' &&
    logPagination.value.cursor &&
    logPagination.value.cursor < 0
  ) {
    return;
  }
  isLoadingLogs.value = true;
  const addressLogs = await hypersyncService.value.getAddressLogs(
    address.value,
    logPagination.value.cursor,
    logsPerPage.value + 1,
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
async function refreshLogs(): Promise<void> {
  logPage.value = 1;
  logPagination.value = {
    cursor: null,
    height: null,
  };
  logs.value = [];
  await fetchLogs();
}

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
    : pagination.cursor >= 0
      ? Infinity
      : maxPage;
}

const opsPerPage = ref(20);
const opPage = ref(1);
const maxOpPage = computed(() => {
  return Math.ceil(ops.value.length / opsPerPage.value);
});
watch(opsPerPage, () => {
  opPage.value = 1;
  fetchOps();
});
watch(opPage, (page) => {
  if (ops.value.length >= page * opsPerPage.value) {
    return;
  }
  fetchOps();
});
async function fetchOps(): Promise<void> {
  if (!address.value || !indexerService.value) {
    return;
  }
  isLoadingOps.value = true;
  const newOps = await indexerService.value.getOpsByAddress(
    address.value,
    (opPage.value - 1) * opsPerPage.value,
    opsPerPage.value + 1,
  );
  // Append newly fetched ops to the end of the list
  // Make sure there are no duplicates
  ops.value = [
    ...new Map(ops.value.concat(newOps).map((op) => [op.hash, op])).values(),
  ];
  isLoadingOps.value = false;
}
async function refreshOps(): Promise<void> {
  opPage.value = 1;
  ops.value = [];
  await fetchOps();
}

const transfersPerPage = ref(20);
const transferPage = ref(1);
const transferPagination = ref<Pagination>({
  cursor: null,
  height: null,
});
const maxTransferPage = computed(() =>
  getMaxPage(
    sort.value,
    transferPagination.value,
    transfers.value.length,
    transfersPerPage.value,
  ),
);
watch(transfersPerPage, () => {
  transferPage.value = 1;
  fetchTransfers();
});
watch(transferPage, (page) => {
  if (transfers.value.length >= page * transfersPerPage.value) {
    return;
  }
  fetchTransfers();
});
async function fetchTransfers(): Promise<void> {
  if (!address.value || !hypersyncService.value || !sort.value) {
    return;
  }
  if (
    sort.value === 'desc' &&
    transferPagination.value.cursor &&
    transferPagination.value.cursor < 0
  ) {
    return;
  }
  isLoadingTransfers.value = true;
  const addressTransfers = await hypersyncService.value.getAddressTransfers(
    address.value,
    transferPagination.value.cursor,
    transfersPerPage.value + 1,
    sort.value,
  );
  const newTransfers = addressTransfers.transfers;
  // Append newly fetched transfers to the end of the list
  transfers.value = transfers.value.concat(newTransfers);
  transferPagination.value = addressTransfers.pagination;
  isLoadingTransfers.value = false;
}
async function refreshTransfers(): Promise<void> {
  transferPage.value = 1;
  transferPagination.value = {
    cursor: null,
    height: null,
  };
  transfers.value = [];
  await fetchTransfers();
}

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
</style>
