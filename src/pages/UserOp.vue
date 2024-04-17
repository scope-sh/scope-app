<template>
  <ScopePage
    :sections="sections"
    @update:section="handleSectionUpdate"
  >
    <ScopePanelLoading
      v-if="isLoading"
      ref="opPanelEl"
      title="Transaction"
      :subtitle="hash"
    />
    <ScopePanel
      v-if="!isLoading && userOp === null"
      ref="opPanelEl"
      title="Transaction"
      :subtitle="hash"
    >
      <ScopeLabelEmptyState value="Couldn't find this UserOp" />
    </ScopePanel>
    <ScopePanel
      v-else-if="data"
      ref="opPanelEl"
      title="UserOp"
      :subtitle="hash"
    >
      <UserOpStatus :success="data.success" />
      <AttributeList>
        <AttributeItem>
          <AttributeItemLabel value="Sender" />
          <AttributeItemValue>
            <LinkAddress :address="data.sender" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Nonce" />
          <AttributeItemValue>
            {{ data.nonce }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Init Code" />
          <AttributeItemValue>
            <ScopeTextView
              :value="data.initCode"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <template v-if="decodedCallData">
          <AttributeItem>
            <AttributeItemLabel value="To" />
            <AttributeItemValue>
              <LinkAddress :address="decodedCallData.to" />
            </AttributeItemValue>
          </AttributeItem>
          <AttributeItem>
            <AttributeItemLabel value="Value" />
            <AttributeItemValue>
              {{ formatEther(decodedCallData.value) }}
            </AttributeItemValue>
          </AttributeItem>
          <AttributeItem>
            <AttributeItemLabel value="Data" />
            <AttributeItemValue>
              <ScopeTextView
                :value="decodedCallData.data"
                size="tiny"
              />
            </AttributeItemValue>
          </AttributeItem>
        </template>
        <AttributeItem v-else>
          <AttributeItemLabel value="Call Data" />
          <AttributeItemValue>
            <ScopeTextView
              :value="data.callData"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="data.paymaster">
          <AttributeItemLabel value="Paymaster" />
          <AttributeItemValue>
            <LinkAddress :address="data.paymaster" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="data.paymasterData">
          <AttributeItemLabel value="Paymaster Data" />
          <AttributeItemValue>
            <ScopeTextView
              :value="data.paymasterData"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Signature" />
          <AttributeItemValue>
            <ScopeTextView
              :value="data.signature"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Pre-verification Gas" />
          <AttributeItemValue>
            {{ data.preVerificationGas }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Verification Gas Limit" />
          <AttributeItemValue>
            {{ data.verificationGasLimit }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Actual Gas Used" />
          <AttributeItemValue>
            {{ data.actualGasUsed }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Call Gas Limit" />
          <AttributeItemValue>
            {{ data.callGasLimit }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Max Fee per Gas" />
          <AttributeItemValue>
            {{ data.maxFeePerGas }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Max Priority Fee per Gas" />
          <AttributeItemValue>
            {{ data.maxPriorityFeePerGas }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Actual Gas Cost" />
          <AttributeItemValue>
            {{ data.actualGasCost }}
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading && transaction !== null"
      ref="txPanelEl"
      title="Transaction"
    >
      <AttributeList>
        <AttributeItem v-if="transaction.blockNumber">
          <AttributeItemLabel :value="'Block'" />
          <AttributeItemValue>
            <ScopeLinkInternal
              :route="{
                name: 'block',
                number: transaction.blockNumber,
              }"
            >
              {{ transaction.blockNumber }}
            </ScopeLinkInternal>
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Hash'" />
          <AttributeItemValue>
            <ScopeLinkInternal
              :route="{
                name: 'transaction',
                hash: transaction.hash,
              }"
            >
              {{ transaction.hash }}
            </ScopeLinkInternal>
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
        <AttributeItem v-if="beneficiary">
          <AttributeItemLabel :value="'Beneficiary'" />
          <AttributeItemValue>
            <LinkAddress :address="beneficiary" />
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </ScopePanel>
    <ScopePanel
      v-if="!isLoading"
      ref="logsPanelEl"
      title="Logs"
    >
      <template #default>
        <ScopeLabelEmptyState
          v-if="!logs.length"
          value="No logs found"
        />
        <div
          v-else
          class="logs"
        >
          <CardLog
            v-for="(log, index) in logs"
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
import { Address, Log, Transaction, TransactionReceipt } from 'viem';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import CardLog from '@/components/__common/CardLog.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import ScopePage, { Section } from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import UserOpStatus from '@/components/user-op/UserOpStatus.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import { Command } from '@/stores/commands';
import {
  UserOp,
  getUserOpData,
  getUserOpEvent,
  getUserOpHash,
  getUserOps,
  decodeCallData,
  getBeneficiary,
  getUserOpLogs,
} from '@/utils/context/erc4337/entryPoint';
import { formatEther } from '@/utils/formatting';

const PAGE_USEROP = 'page_userop';
const SECTION_OVERVIEW = 'overview';
const SECTION_TRANSACTION = 'transaction';
const SECTION_LOGS = 'logs';

const { setCommands } = useCommands(PAGE_USEROP);
const { send: sendToast } = useToast();

type PanelEl = InstanceType<typeof ScopePanel>;
type PanelSection = Section & { el: PanelEl | null };

const route = useRoute();
const { id: chainId, name: chainName, client } = useChain();
const { requestLabels } = useLabels();

const opPanelEl = ref<PanelEl | null>(null);
const txPanelEl = ref<PanelEl | null>(null);
const logsPanelEl = ref<PanelEl | null>(null);
const sections = computed<PanelSection[]>(() => [
  {
    label: 'Overview',
    value: SECTION_OVERVIEW,
    el: opPanelEl.value,
  },
  {
    label: 'Transaction',
    value: SECTION_TRANSACTION,
    el: txPanelEl.value,
  },
  {
    label: 'Logs',
    value: SECTION_LOGS,
    el: logsPanelEl.value,
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

const hash = computed(() => route.params.hash as Address);

const commands = computed<Command[]>(() => [
  {
    icon: 'copy',
    label: 'Copy UserOp hash',
    act: (): void => {
      if (!hash.value) {
        return;
      }
      navigator.clipboard.writeText(hash.value);
      sendToast({
        type: 'success',
        message: 'UserOp hash copied to clipboard',
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
    label: 'Go to transaction',
    act: (): void => {
      openSection(SECTION_TRANSACTION);
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
      title: `UserOp ${hash.value} on ${chainName.value} | Scope`,
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
const indexerService = computed(() =>
  chainId.value ? new IndexerService(chainId.value) : null,
);

const isLoading = ref(false);
const transaction = ref<Transaction | null>(null);
const transactionReceipt = ref<TransactionReceipt | null>(null);

const entryPoint = computed<Address | null>(() =>
  transaction.value ? transaction.value.to : null,
);
const userOp = computed<UserOp | null>(() => {
  if (!transaction.value) {
    return null;
  }
  const to = transaction.value.to;
  if (!to) {
    return null;
  }
  const chain = chainId.value;
  if (!chain) {
    return null;
  }
  const userOps = getUserOps(transaction.value);
  const userOp = userOps.find(
    (op) => getUserOpHash(chain, to, op) === hash.value,
  );
  return userOp || null;
});
const data = computed(() => {
  if (!chainId.value) {
    return null;
  }
  if (!entryPoint.value) {
    return null;
  }
  if (!transactionReceipt.value) {
    return null;
  }
  if (!userOp.value) {
    return null;
  }
  const event = getUserOpEvent(
    chainId.value,
    entryPoint.value,
    transactionReceipt.value.logs,
    userOp.value,
  );
  if (!hash.value) {
    return null;
  }
  if (!userOp.value) {
    return null;
  }
  if (!event) {
    return null;
  }
  return getUserOpData(hash.value, userOp.value, event);
});
const decodedCallData = computed(() => {
  if (!data.value) {
    return null;
  }
  return decodeCallData(data.value.callData);
});
const beneficiary = computed<Address | null>(() => {
  if (!transaction.value) {
    return null;
  }
  return getBeneficiary(transaction.value);
});
const logs = computed<Log[]>(() => {
  if (!transactionReceipt.value) {
    return [];
  }
  if (!hash.value) {
    return [];
  }
  return getUserOpLogs(transactionReceipt.value.logs, hash.value);
});

async function fetch(): Promise<void> {
  if (!evmService.value || !indexerService.value) {
    return;
  }
  isLoading.value = true;
  const txHash = await indexerService.value.getTxHashByUserOpHash(hash.value);
  if (!txHash) {
    isLoading.value = false;
    return;
  }
  transaction.value = await evmService.value.getTransaction(txHash);
  transactionReceipt.value =
    await evmService.value.getTransactionReceipt(txHash);
  isLoading.value = false;
}

const addresses = computed(() => {
  const list: Address[] = [];
  if (data.value) {
    list.push(data.value.sender);
    if (decodedCallData.value) {
      list.push(decodedCallData.value.to);
    }
    if (data.value.paymaster) {
      list.push(data.value.paymaster);
    }
  }
  if (transaction.value) {
    list.push(transaction.value.from);
    if (transaction.value.to) {
      list.push(transaction.value.to);
    }
  }
  if (beneficiary.value) {
    list.push(beneficiary.value);
  }
  if (logs.value) {
    logs.value.forEach((log) => {
      list.push(log.address);
    });
  }
  return list;
});

watch(addresses, async () => {
  requestLabels(addresses.value);
});
</script>
