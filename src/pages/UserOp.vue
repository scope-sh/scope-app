<template>
  <ScopePage
    :sections="sections"
    @update:section="handleSectionUpdate"
  >
    <ScopePanelLoading
      v-if="isLoading"
      ref="opPanelEl"
      title="UserOp"
      :subtitle="hash"
    />
    <ScopePanel
      v-if="!isLoading && userOp === null"
      ref="opPanelEl"
      title="UserOp"
      :subtitle="hash"
    >
      <ScopeEmptyState label="Couldn't find this UserOp">
        <template #actions>
          <ScopeButton @click="handleOpenAsTransactionClick">
            Open as transaction
          </ScopeButton>
        </template>
      </ScopeEmptyState>
    </ScopePanel>
    <ScopePanel
      v-else-if="userOpUnpacked"
      ref="opPanelEl"
      title="UserOp"
      :subtitle="hash"
    >
      <UserOpStatus :success="userOpUnpacked.success" />
      <AttributeList>
        <AttributeItem>
          <AttributeItemLabel value="Sender" />
          <AttributeItemValue>
            <LinkAddress :address="userOpUnpacked.sender" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Nonce" />
          <AttributeItemValue>
            {{ userOpUnpacked.nonce }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="userOpUnpacked.factory">
          <AttributeItemLabel value="Factory" />
          <AttributeItemValue>
            <LinkAddress :address="userOpUnpacked.factory" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="userOpUnpacked.initData">
          <AttributeItemLabel value="Init Data" />
          <AttributeItemValue>
            <ScopeTextView
              :value="userOpUnpacked.initData"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="userOpUnpacked.paymaster">
          <AttributeItemLabel value="Paymaster" />
          <AttributeItemValue>
            <LinkAddress :address="userOpUnpacked.paymaster" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="userOpUnpacked.paymasterData">
          <AttributeItemLabel value="Paymaster Data" />
          <AttributeItemValue>
            <ScopeTextView
              :value="userOpUnpacked.paymasterData"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="size(userOpUnpacked.signature) > 0">
          <AttributeItemLabel value="Signature" />
          <AttributeItemValue>
            <ScopeTextView
              :value="userOpUnpacked.signature"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
      <AttributeList>
        <template v-if="calls">
          <template
            v-for="(call, index) in calls"
            :key="index"
          >
            <AttributeItem>
              <AttributeItemLabel :value="`To ${index + 1}`" />
              <AttributeItemValue>
                <LinkAddress :address="call.to" />
              </AttributeItemValue>
            </AttributeItem>
            <AttributeItem>
              <AttributeItemLabel :value="`Value ${index + 1}`" />
              <AttributeItemValue>
                {{ formatEther(call.value) }}
              </AttributeItemValue>
            </AttributeItem>
            <AttributeItem>
              <AttributeItemLabel :value="`Data ${index + 1}`" />
              <AttributeItemValue>
                <ScopeTextView
                  :value="call.callData"
                  size="tiny"
                />
              </AttributeItemValue>
            </AttributeItem>
          </template>
        </template>
        <AttributeItem v-else>
          <AttributeItemLabel value="Call Data" />
          <AttributeItemValue>
            <ScopeTextView
              :value="userOpUnpacked.callData"
              size="tiny"
            />
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
      <AttributeList>
        <AttributeItem>
          <AttributeItemLabel value="Gas Used" />
          <AttributeItemValue>
            {{ userOpUnpacked.actualGasUsed }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem v-if="gasPrice">
          <AttributeItemLabel value="Gas Price" />
          <AttributeItemValue>
            {{ formatGasPrice(gasPrice) }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Cost" />
          <AttributeItemValue>
            {{ formatEther(userOpUnpacked.actualGasCost) }}
          </AttributeItemValue>
        </AttributeItem>
      </AttributeList>
      <CardActions
        v-if="actions.length > 0"
        :actions
      />
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
            <LinkBlock :number="transaction.blockNumber" />
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel :value="'Hash'" />
          <AttributeItemValue>
            <LinkTransaction :hash="transaction.hash" />
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
import { Address, Log, Transaction, TransactionReceipt, size } from 'viem';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import CardLog from '@/components/__common/CardLog.vue';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
import ScopeButton from '@/components/__common/ScopeButton.vue';
import ScopeEmptyState from '@/components/__common/ScopeEmptyState.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
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
import CardActions, { Action } from '@/components/user-op/CardActions.vue';
import UserOpStatus from '@/components/user-op/UserOpStatus.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useLabels from '@/composables/useLabels';
import useToast from '@/composables/useToast';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import { Command } from '@/stores/commands';
import {
  UserOp,
  getUserOpEvent,
  getUserOpHash,
  getUserOps,
  decodeCalls,
  getBeneficiary,
  getUserOpLogs,
  unpackUserOp,
} from '@/utils/context/erc4337/entryPoint';
import { decodeNonce as kernelV3DecodeNonce } from '@/utils/context/erc7579/kernelV3';
import { formatEther, formatGasPrice } from '@/utils/formatting';
import { getRouteLocation } from '@/utils/routing';

const PAGE_USEROP = 'page_userop';
const SECTION_OVERVIEW = 'overview';
const SECTION_TRANSACTION = 'transaction';
const SECTION_LOGS = 'logs';

const { setCommands } = useCommands(PAGE_USEROP);
const { send: sendToast } = useToast();

type PanelEl = InstanceType<typeof ScopePanel>;
type PanelSection = Section & { el: PanelEl | null };

const { indexerEndpoint } = useEnv();
const route = useRoute();
const router = useRouter();
const { id: chainId, name: chainName, client } = useChain();
const { requestLabels, getLabel } = useLabels();

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
  chainId.value ? new IndexerService(indexerEndpoint, chainId.value) : null,
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
const userOpUnpacked = computed(() => {
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
  return unpackUserOp(hash.value, userOp.value, event);
});
const gasPrice = computed(() => {
  if (!userOpUnpacked.value) {
    return null;
  }
  return (
    userOpUnpacked.value.actualGasCost / userOpUnpacked.value.actualGasUsed
  );
});
const calls = computed(() => {
  if (!userOpUnpacked.value) {
    return null;
  }
  return decodeCalls(userOpUnpacked.value.callData);
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

const actions = computed<Action[]>(() => {
  const opData = userOpUnpacked.value;
  if (!opData) {
    return [];
  }
  const sender = opData.sender;
  const label = getLabel(sender);
  if (!label) {
    return [];
  }
  const labelType = label.type;
  if (!labelType) {
    return [];
  }
  if (labelType.id === 'kernel-v3-account') {
    const nonce = opData.nonce;
    const decodedNonce = kernelV3DecodeNonce(nonce);
    if (!decodedNonce) {
      return [];
    }
    return [
      [
        {
          type: 'text',
          value: 'Validated by',
        },
        {
          type: 'address',
          address: decodedNonce.identifier,
        },
      ],
    ] as Action[];
  }
  return [];
});

const addresses = computed(() => {
  const list: Address[] = [];
  if (userOpUnpacked.value) {
    if (userOpUnpacked.value.factory) {
      list.push(userOpUnpacked.value.factory);
    }
    list.push(userOpUnpacked.value.sender);
    if (calls.value) {
      for (const call of calls.value) {
        list.push(call.to);
      }
    }
    if (userOpUnpacked.value.paymaster) {
      list.push(userOpUnpacked.value.paymaster);
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
  if (actions.value && actions.value.length > 0) {
    actions.value.forEach((action) => {
      action.forEach((part) => {
        if (part.type === 'address') {
          list.push(part.address);
        }
      });
    });
  }
  return list;
});

watch(addresses, async () => {
  requestLabels(addresses.value);
});

function handleOpenAsTransactionClick(): void {
  router.push(getRouteLocation({ name: 'transaction', hash: hash.value }));
}
</script>
