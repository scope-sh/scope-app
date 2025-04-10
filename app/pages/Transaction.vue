<template>
  <ScopePage
    v-model:section="section"
    :sections="sections"
  >
    <ScopePanelLoading
      v-if="isLoading"
      title="Transaction"
      :subtitle="hash"
    />
    <ScopePanel
      v-else-if="!isLoading && transaction === null"
      title="Transaction"
      :subtitle="hash"
    >
      <ScopeEmptyState label="Couldn't find this transaction">
        <template #actions>
          <ScopeButton
            kind="primary"
            @click="handleOpenAsOpClick"
          >
            Open as UserOp
          </ScopeButton>
        </template>
      </ScopeEmptyState>
    </ScopePanel>
    <ScopePanel
      v-else
      title="Transaction"
      :subtitle="hash"
    >
      <template #header>
        <ScopePaginator
          v-if="block && transaction && transaction.transactionIndex !== null"
          :total="block.transactions"
          zero-based
          :model-value="transaction.transactionIndex"
          @update:model-value="handleTransactionIndexUpdate"
        />
      </template>
      <TransactionStatus
        v-if="transactionReceipt"
        :status="transactionReceipt.status"
        :trace-frame="revertTraceFrame"
      />
      <AttributeList v-if="transaction && transactionReceipt">
        <AttributeItem v-if="transaction.blockNumber">
          <AttributeItemLabel
            value="Block"
            note="The number of the block in which the transaction was included"
          />
          <AttributeItemValue>
            <LinkBlock :number="transaction.blockNumber" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="block && block.timestamp">
          <AttributeItemLabel
            value="Timestamp"
            note="The Unix epoch time at which the transaction was mined, indicating when this transaction was confirmed on the blockchain"
          />
          <AttributeItemValue :note="blockRelativeTimeLabel">
            {{ formatTime(block.timestamp) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="From"
            note="The address of the account that initiated the transaction"
          />
          <AttributeItemValue>
            <LinkAddress :address="transaction.from" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.to">
          <AttributeItemLabel
            value="To"
            note="The address of the account or contract that is the recipient of the transaction"
          />
          <AttributeItemValue>
            <LinkAddress :address="transaction.to" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Value"
            note="The amount of natuve currency transferred from the sender to the recipient"
          />
          <AttributeItemValue>
            {{ formatEther(transaction.value, nativeCurrency, true) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Gas used"
            note="The total amount of gas consumed by the transaction execution"
          />
          <AttributeItemValue :note="formatShare(gasUsedShare)">
            {{ transactionReceipt.gasUsed }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Gas limit"
            note="The maximum amount of gas the sender is willing to pay for executing the transaction"
          />
          <AttributeItemValue>
            {{ transaction.gas }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.gasPrice">
          <AttributeItemLabel
            value="Gas price"
            note="The amount of ether the sender is willing to pay per unit of gas"
          />
          <AttributeItemValue>
            {{ formatGasPrice(transaction.gasPrice, true) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="fee">
          <AttributeItemLabel
            value="Fee"
            note="The total transaction fee paid by the sender, calculated as gas used multiplied by gas price"
          />
          <AttributeItemValue>
            {{ formatEther(fee, nativeCurrency, true) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel
            value="Type"
            note="The format or category of the transaction"
          />
          <AttributeItemValue :note="typeLabel">
            {{ typeIndexLabel }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="transaction.input !== '0x'">
          <AttributeItemLabel
            :value="isContractDeployment ? 'Init code' : 'Input'"
            :note="
              isContractDeployment
                ? 'The code used to deploy a new contract'
                : 'The additional data sent along with the transaction, often used to invoke functions on contracts.'
            "
          />
          <AttributeItemValue>
            <div class="input">
              <ScopeToggle
                v-if="!isContractDeployment"
                v-model="selectedCallDataView"
                :options="callDataViewOptions"
              />
              <ViewCallData
                :address="transaction.to"
                :call-data="transaction.input"
                :view="selectedCallDataView"
              />
            </div>
          </AttributeItemValue>
        </AttributeItem>

        <AttributeItem
          v-if="
            transaction &&
            transaction.type === 'eip7702' &&
            transaction.authorizationList.length > 0
          "
        >
          <AttributeItemLabel
            value="Authorization list"
            note="The list of EIP-7702 authorizations"
          />
          <AttributeItemValue>
            <div class="input">
              <ScopeToggle
                v-model="selectedAuthorizationListView"
                :options="authorizationListViewOptions"
              />
              <AuthorizationList
                :list="transaction.authorizationList"
                :view="selectedAuthorizationListView"
              />
            </div>
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
      <CardHighlights
        v-if="transaction && transactionReceipt"
        :transaction
        :logs="transactionReceipt?.logs"
      />
    </ScopePanel>
    <template #section>
      <template v-if="section === SECTION_OPS">
        <ScopePanelLoading
          v-if="isLoading"
          title="UserOps"
        />
        <ScopePanel
          v-else-if="ops && ops.length > 0"
          title="UserOps"
        >
          <template
            v-if="transaction && transactionReceipt"
            #default
          >
            <CardOp
              v-for="(op, index) in ops"
              :key="index"
              :entry-point="entryPoint"
              :op="op"
              :transaction="transaction"
              :transaction-receipt="transactionReceipt"
              :delegate="delegates[op.sender] ?? null"
            />
          </template>
        </ScopePanel>
      </template>
      <template v-if="section === SECTION_LOGS">
        <ScopePanelLoading
          v-if="isLoading"
          title="Logs"
        />
        <ScopePanel
          v-else-if="transactionReceipt"
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
              <ScopeToggle
                v-model="selectedLogView"
                :options="logViewOptions"
              />
              <CardLog
                v-for="(log, index) in transactionReceipt.logs"
                :key="index"
                :log="log"
                :view="selectedLogView"
                type="transaction"
              />
            </div>
          </template>
        </ScopePanel>
      </template>
      <template v-if="section === SECTION_TRACES">
        <PanelTraces
          :is-loading
          :transaction-replay
        />
      </template>
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import { size, type Address, type Hex, type TransactionType } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import type { LogView } from '@/components/__common/CardLog.vue';
import CardLog from '@/components/__common/CardLog.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopeEmptyState from '@/components/__common/ScopeEmptyState.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import type { Section } from '@/components/__common/ScopePage.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import type { Option as ToggleOption } from '@/components/__common/ScopeToggle.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import AuthorizationList, {
  type AuthorizationListView,
} from '@/components/address/AuthorizationList.vue';
import CardHighlights from '@/components/transaction/CardHighlights.vue';
import CardOp from '@/components/transaction/CardOp.vue';
import PanelTraces from '@/components/transaction/PanelTraces.vue';
import TransactionStatus from '@/components/transaction/TransactionStatus.vue';
import ViewCallData from '@/components/transaction/ViewCallData.vue';
import type { CallDataView } from '@/components/transaction/ViewCallData.vue';
import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useRoute from '@/composables/useRoute';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import EvmService from '@/services/evm';
import type {
  Transaction,
  TransactionReceipt,
  TransactionReplay,
  Block,
} from '@/services/evm';
import type { Command } from '@/stores/commands';
import { ARBITRUM, ARBITRUM_SEPOLIA } from '@/utils/chains';
import { getDelegation } from '@/utils/context/eip7702';
import type { Op } from '@/utils/context/erc4337/entryPoint';
import { getEntryPoint, getOps } from '@/utils/context/erc4337/entryPoint';
import {
  convertDebugTraceToTransactionTrace,
  convertDebugStateToTransactionStateDiff,
  getRevert as getRevertTraceFrame,
} from '@/utils/context/traces';
import { toRelativeTime } from '@/utils/conversion';
import {
  formatEther,
  formatGasPrice,
  formatRelativeTime,
  formatShare,
  formatTime,
} from '@/utils/formatting';
import {
  type TransactionRouteLocation,
  getRouteLocation,
} from '@/utils/routing';

const SECTION_OPS = 'ops';
const SECTION_LOGS = 'logs';
const SECTION_TRACES = 'internal';

const { setCommands } = useCommands();
const { send: sendToast } = useToast();

const route = useRoute<TransactionRouteLocation>();
const router = useRouter();
const { id: chainId, name: chainName, client, nativeCurrency } = useChain();
const { requestAbi } = useAbi();

const section = ref<Section['value']>(SECTION_LOGS);
const sections = computed<Section[]>(() => {
  const list: Section[] = [];
  list.push({
    label: 'Logs',
    value: SECTION_LOGS,
  });
  if (ops.value && ops.value.length > 0) {
    list.push({
      label: 'UserOps',
      value: SECTION_OPS,
    });
  }
  list.push({
    label: 'Traces',
    value: SECTION_TRACES,
  });
  return list;
});

const hash = computed(() => route.params.hash);

onMounted(() => {
  fetch();
});

watch(hash, () => {
  fetch();
});

useHead({
  title: () => `Transaction ${hash.value} on ${chainName.value} | Scope`,
});

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);
const evmService = computed(() =>
  client.value ? new EvmService(client.value) : null,
);

const isLoading = ref(false);
const block = ref<Block | null>(null);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);
const transactionReplay = ref<TransactionReplay | null>(null);
const delegates = ref<Record<Address, Address>>({});

const hasPrevTransaction = computed(() => {
  if (!transaction.value || !transaction.value.transactionIndex) {
    return false;
  }
  return transaction.value.transactionIndex > 0;
});
const hasNextTransaction = computed(() => {
  if (
    !transaction.value ||
    transaction.value.transactionIndex === null ||
    !block.value
  ) {
    return false;
  }
  return transaction.value.transactionIndex < block.value.transactions - 1;
});

const commands = computed<Command[]>(() => {
  const list: Command[] = [
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
  ];
  if (hasPrevTransaction.value) {
    list.push({
      icon: 'arrow-left',
      label: 'Previous transaction',
      act: (): void => {
        if (transaction.value && transaction.value.transactionIndex !== null) {
          openBlockTransaction(
            transaction.value.transactionIndex - 1,
            'No previous transaction',
          );
        }
      },
    });
  }
  if (hasNextTransaction.value) {
    list.push({
      icon: 'arrow-right',
      label: 'Next transaction',
      act: (): void => {
        if (transaction.value && transaction.value.transactionIndex !== null) {
          openBlockTransaction(
            transaction.value.transactionIndex + 1,
            'No next transaction',
          );
        }
      },
    });
  }
  return list;
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

async function fetch(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  isLoading.value = true;
  await Promise.all([
    fetchTransaction(hash.value),
    fetchTransactionReceipt(hash.value),
    fetchTransactionReplay(hash.value),
  ]);
  if (transaction.value && transaction.value.blockNumber) {
    block.value = await evmService.value.getBlock(
      transaction.value.blockNumber,
    );
  }
  await fetchDelegates();
  isLoading.value = false;
  await fetchAbis();
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

async function fetchTransactionReplay(hash: Hex): Promise<void> {
  if (!evmService.value) {
    return;
  }
  if (chainId.value === ARBITRUM || chainId.value === ARBITRUM_SEPOLIA) {
    const [debugTrace, debugState] = await Promise.all([
      evmService.value.getDebugTransactionTrace(hash),
      evmService.value.getDebugTransactionState(hash),
    ]);
    const trace = convertDebugTraceToTransactionTrace(debugTrace);
    const stateDiff = convertDebugStateToTransactionStateDiff(debugState);
    if (!trace || !stateDiff) {
      transactionReplay.value = null;
    } else {
      transactionReplay.value = {
        trace,
        stateDiff,
      };
    }
  } else {
    transactionReplay.value = await evmService.value.getTransactionReplay(hash);
  }
}

const revertTraceFrame = computed(() => {
  if (!transactionReplay.value) {
    return null;
  }
  const trace = transactionReplay.value.trace;
  const root = trace.find((trace) => trace.traceAddress.length === 0);
  if (!root) {
    return null;
  }
  return getRevertTraceFrame(trace, root);
});

async function fetchAbis(): Promise<void> {
  if (!apiService.value) {
    return;
  }
  if (!transaction.value) {
    return;
  }
  const address = transaction.value.to;
  if (!address) {
    return;
  }
  const input = transaction.value.input;
  requestAbi(address, {
    functions: size(input) > 0 ? [input.slice(0, 10) as Hex] : [],
    events: [],
    errors: [],
  });
  if (!transactionReceipt.value) {
    return;
  }
  const logs = transactionReceipt.value.logs;
  for (const log of logs) {
    if (!log.address) {
      continue;
    }
    if (log.topics.length === 0) {
      continue;
    }
    const topic = log.topics[0];
    if (!topic) {
      continue;
    }
    requestAbi(log.address, {
      functions: [],
      events: [topic],
      errors: [],
    });
  }
  if (!transactionReplay.value) {
    return;
  }
  for (const call of transactionReplay.value.trace) {
    if (call.type !== 'call') {
      continue;
    }
    const to = call.action.to;
    const input = call.action.input;
    requestAbi(to, {
      functions: size(input) > 0 ? [input.slice(0, 10) as Hex] : [],
      events: [],
      errors: [],
    });
    if (call.error !== null) {
      const output = call.result.output;
      if (!output) {
        continue;
      }
      requestAbi(to, {
        functions: [],
        events: [],
        errors: size(output) > 0 ? [output.slice(0, 10) as Hex] : [],
      });
    }
  }
}

async function fetchDelegates(): Promise<void> {
  delegates.value = {};
  if (!transaction.value) {
    return;
  }
  const transactonTrace = transactionReplay.value?.trace ?? null;
  const ops = await getOps(client.value, transaction.value, transactonTrace);
  const senders = ops.map((op) => op.sender);
  const codes = await Promise.all(
    senders.map((sender) => {
      if (!evmService.value) {
        return null;
      }
      if (!transaction.value) {
        return null;
      }
      const blockNumber = transaction.value.blockNumber;
      if (!blockNumber) {
        return null;
      }
      return evmService.value.getCode(sender, blockNumber);
    }),
  );
  delegates.value = senders.reduce((acc, sender, index) => {
    const code = codes[index];
    if (!code) {
      return acc;
    }
    return { ...acc, [sender]: getDelegation(code) };
  }, {});
}

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
const selectedCallDataView = ref<CallDataView>('decoded');
const callDataViewOptions = computed<ToggleOption<CallDataView>[]>(() => [
  {
    value: 'decoded',
    icon: 'text',
  },
  {
    value: 'hex',
    icon: 'hex-string',
  },
]);
const selectedAuthorizationListView = ref<AuthorizationListView>('decoded');
const authorizationListViewOptions = computed<
  ToggleOption<AuthorizationListView>[]
>(() => [
  {
    value: 'decoded',
    icon: 'text',
  },
  {
    value: 'hex',
    icon: 'hex-string',
  },
]);

const isContractDeployment = computed(() => {
  if (!transaction.value) {
    return false;
  }
  return !transaction.value.to;
});

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
    eip7702: 4,
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
    eip7702: 'EIP7702',
  };
  return map[transaction.value.type];
});

const entryPoint = ref<Address | null>(null);
const ops = ref<Op[] | null>(null);
watch(transaction, async () => {
  if (!transaction.value) {
    return;
  }
  if (!transactionReplay.value) {
    return;
  }
  const transactionTrace = transactionReplay.value.trace;
  entryPoint.value = getEntryPoint(transaction.value, transactionTrace);
  ops.value = await getOps(client.value, transaction.value, transactionTrace);
});

async function handleTransactionIndexUpdate(index: number): Promise<void> {
  openBlockTransaction(index, 'No transaction found');
}

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

function handleOpenAsOpClick(): void {
  router.push(getRouteLocation({ name: 'op', hash: hash.value }));
}
</script>

<style scoped>
.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}

.input {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  width: 100%;
}
</style>
