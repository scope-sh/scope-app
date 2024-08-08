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
            @click="handleOpenAsUserOpClick"
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
      <TransactionStatus
        v-if="transactionReceipt"
        :status="transactionReceipt.status"
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
            {{ formatEther(transaction.value) }}
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
            {{ formatGasPrice(transaction.gasPrice) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="fee">
          <AttributeItemLabel
            value="Fee"
            note="The total transaction fee paid by the sender, calculated as gas used multiplied by gas price"
          />
          <AttributeItemValue>
            {{ formatEther(fee) }}
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
            value="Input"
            note="The additional data sent along with the transaction, often used to invoke functions on contracts."
          />
          <AttributeItemValue>
            <div class="input">
              <ScopeToggle
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
      </AttributeList>
    </ScopePanel>
    <template #section>
      <template v-if="section === SECTION_OPS">
        <ScopePanelLoading
          v-if="isLoading"
          title="UserOps"
        />
        <ScopePanel
          v-else-if="userOps && userOps.length > 0"
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
      </template>
      <template v-if="section === SECTION_LOGS">
        <ScopePanelLoading
          v-if="isLoading"
          title="UserOps"
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
    </template>
  </ScopePage>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
import type { Address, Hex, TransactionType } from 'viem';
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { LogView } from '@/components/__common/CardLog.vue';
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
import type { Option as ToggleOption } from '@/components/__common/ScopeToggle.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import type { CallDataView } from '@/components/__common/ViewCallData.vue';
import ViewCallData from '@/components/__common/ViewCallData.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import CardUserOp from '@/components/transaction/CardUserOp.vue';
import TransactionStatus from '@/components/transaction/TransactionStatus.vue';
import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import EvmService from '@/services/evm';
import type { Transaction, TransactionReceipt, Block } from '@/services/evm';
import type { Command } from '@/stores/commands';
import type { UserOp } from '@/utils/context/erc4337/entryPoint';
import { getEntryPoint, getUserOps } from '@/utils/context/erc4337/entryPoint';
import { toRelativeTime } from '@/utils/conversion';
import {
  formatEther,
  formatGasPrice,
  formatRelativeTime,
  formatShare,
  formatTime,
} from '@/utils/formatting';
import { getRouteLocation } from '@/utils/routing';

const SECTION_OPS = 'ops';
const SECTION_LOGS = 'logs';

const { setCommands } = useCommands();
const { send: sendToast } = useToast();

const route = useRoute();
const router = useRouter();
const { id: chainId, name: chainName, client } = useChain();
const { addAbis } = useAbi();

const section = ref<Section['value']>(SECTION_LOGS);
const sections = computed<Section[]>(() => {
  const list: Section[] = [];
  list.push({
    label: 'Logs',
    value: SECTION_LOGS,
  });
  if (userOps.value && userOps.value.length > 0) {
    list.push({
      label: 'UserOps',
      value: SECTION_OPS,
    });
  }
  return list;
});

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
  if (!transactionReceipt.value) {
    return;
  }
  const logs = transactionReceipt.value.logs;
  const contracts: Record<
    Address,
    {
      functions: Hex[];
      events: Hex[];
    }
  > = {};
  for (const log of logs) {
    if (!log.address) {
      continue;
    }
    if (!contracts[log.address]) {
      contracts[log.address] = {
        functions: [],
        events: [],
      };
    }
    const contract = contracts[log.address];
    if (!contract) {
      continue;
    }
    if (log.topics.length === 0) {
      continue;
    }
    const topic = log.topics[0];
    if (!topic) {
      continue;
    }
    if (contract.events.includes(topic)) {
      continue;
    }
    contract.events.push(topic);
  }
  const input = transaction.value.input;
  if (!contracts[address]) {
    contracts[address] = {
      functions: [],
      events: [],
    };
  }
  const contract = contracts[address];
  if (!contract) {
    return;
  }
  contract.functions.push(input.slice(0, 10) as Hex);
  const abis = await apiService.value.getContractAbi(contracts);
  addAbis(abis);
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
const userOps = ref<UserOp[] | null>(null);
watch(transaction, async () => {
  if (!transaction.value) {
    return;
  }
  entryPoint.value = getEntryPoint(transaction.value);
  userOps.value = await getUserOps(client.value, transaction.value);
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

.input {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--spacing-2);
}
</style>
