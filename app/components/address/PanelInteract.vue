<template>
  <ScopePanel title="Interact">
    <NoticeDelegation
      v-if="isDelegated && delegation"
      v-model:show-as-delegatee="showAsDelegatee"
      :delegation
    />
    <NoticeProxy
      v-if="isProxy"
      v-model:show-as-proxy="showAsProxy"
      :implementation
    />
    <div class="interact">
      <div class="interact-header">
        <ScopeTabs
          v-model="activeTab"
          :options="tabs"
        />
      </div>
      <div class="group">
        <ScopeCombobox
          v-model="filterValue"
          :options="filterOptions"
        />
        <div class="list">
          <div
            v-for="fragment in activeFunctions"
            :key="toFunctionSelector(fragment)"
          >
            <AbiForm
              :fragment="fragment"
              :is-loading="isLoading(fragment)"
              :error="getResultError(fragment)"
              :result="getResultValue(fragment)"
              @submit="
                ({ args, account, amount }) =>
                  handleSubmit(fragment, args, account, amount)
              "
            />
          </div>
        </div>
      </div>
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import type { AbiFunction, Address } from 'abitype';
import { type Hex, toFunctionSelector } from 'viem';
import { readContract, simulateContract } from 'viem/actions';
import { computed, ref, watch } from 'vue';

import NoticeDelegation from './code/NoticeDelegation.vue';
import NoticeProxy from './code/NoticeProxy.vue';
import AbiForm from './interact/abi-form/AbiForm.vue';

import ScopeCombobox, {
  type Option,
} from '@/components/__common/ScopeCombobox.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import useChain from '@/composables/useChain';
import type { Contract } from '@/services/api';
import {
  isDelegating as isDelegatingEip7702,
  getDelegation as getDelegationEip7702,
} from '@/utils/context/eip7702';
import {
  getQueryError,
  getFragmentName,
  getConstants,
  getParamlessFunctions,
  getReadFunctions,
  getNonpayableFunctions,
  getPayableFunctions,
} from '@/utils/context/evm';
import type { AbiFragment, QueryError } from '@/utils/context/evm';

const { address, bytecode, contract } = defineProps<{
  address: Address;
  bytecode: Hex | null;
  contract: Contract | null;
}>();

const { client } = useChain();

const showAsProxy = ref(true);
const showAsDelegatee = ref(true);

const isDelegated = computed(() => isDelegatingEip7702(bytecode));
const delegation = computed(() => getDelegationEip7702(bytecode));

const isFunctionLoading = ref<Record<Hex, boolean>>();
const errors = ref<Record<Hex, QueryError | null>>();
const results = ref<Record<Hex, unknown>>();

const activeTab = ref<string>('read');
const tabs = [
  {
    label: 'Read',
    value: 'read',
  },
  {
    label: 'Simulate',
    value: 'simulate',
  },
];

const filterValue = ref<Option<AbiFunction> | undefined>(undefined);
const filterOptions = computed(() => {
  return activeTab.value === 'read'
    ? [
        {
          label: 'Constants',
          options: constants.value.map((f) => getOption(f)),
        },
        {
          label: 'Paramless functions',
          options: paramlessFunctions.value.map((f) => getOption(f)),
        },
        {
          label: 'Read functions',
          options: readFunctions.value.map((f) => getOption(f)),
        },
      ]
    : [
        {
          label: 'Non-payable functions',
          options: nonpayableFunctions.value.map((f) => getOption(f)),
        },
        {
          label: 'Payable functions',
          options: payableFunctions.value.map((f) => getOption(f)),
        },
      ];
});
function getOption(fragment: AbiFunction): Option<AbiFunction> {
  return {
    value: fragment,
    label: getFragmentName(fragment),
  };
}

function isLoading(fragment: AbiFunction): boolean {
  if (!isFunctionLoading.value) {
    return false;
  }
  return isFunctionLoading.value[toFunctionSelector(fragment)] || false;
}

const isProxy = computed(() => contract && contract.implementation);
const implementation = computed(() =>
  contract && contract.implementation ? contract.implementation.address : null,
);
const abi = computed(() => {
  if (!contract) {
    return null;
  }
  if (isDelegated.value) {
    if (showAsDelegatee.value) {
      return contract.delegation ? contract.delegation.abi : contract.abi;
    }
    return contract.abi;
  }
  if (showAsProxy.value) {
    return contract.implementation ? contract.implementation.abi : contract.abi;
  }
  return contract.abi;
});

const constants = computed(() => getConstants(abi.value || []));
const paramlessFunctions = computed(() =>
  getParamlessFunctions(abi.value || []),
);
const readFunctions = computed(() => getReadFunctions(abi.value || []));
const nonpayableFunctions = computed(() =>
  getNonpayableFunctions(abi.value || []),
);
const payableFunctions = computed(() => getPayableFunctions(abi.value || []));
const functions = computed(() => {
  return [
    ...constants.value,
    ...paramlessFunctions.value,
    ...readFunctions.value,
    ...nonpayableFunctions.value,
    ...payableFunctions.value,
  ];
});
const tabFunctions = computed(() => {
  return activeTab.value === 'read'
    ? [...constants.value, ...paramlessFunctions.value, ...readFunctions.value]
    : [...nonpayableFunctions.value, ...payableFunctions.value];
});
const activeFunctions = computed(() => {
  const filter = filterValue.value;
  if (!filter) {
    return tabFunctions.value;
  }
  return tabFunctions.value.filter((f) => filter.value === f);
});

watch(
  () => functions,
  () => {
    for (const f of functions.value) {
      if (!isFunctionLoading.value) {
        isFunctionLoading.value = {};
      }
      isFunctionLoading.value[toFunctionSelector(f)] = false;
      if (!errors.value) {
        errors.value = {};
      }
      errors.value[toFunctionSelector(f)] = null;
      if (!results.value) {
        results.value = {};
      }
      results.value[toFunctionSelector(f)] = null;
    }
    fetchParamless();
  },
  {
    immediate: true,
  },
);

function getResultError(fragment: AbiFunction): QueryError | null {
  if (!errors.value) {
    return null;
  }
  return errors.value[toFunctionSelector(fragment)] || null;
}

function getResultValue(fragment: AbiFunction): unknown {
  if (!results.value) {
    return null;
  }
  const result = results.value[toFunctionSelector(fragment)];
  if (result === null || result === undefined) {
    return null;
  }
  return result;
}

async function fetchParamless(): Promise<void> {
  if (!isFunctionLoading.value) {
    isFunctionLoading.value = {};
  }
  if (!errors.value) {
    errors.value = {};
  }
  const queryableFunctions = [...constants.value, ...paramlessFunctions.value];
  for (const fragment of queryableFunctions) {
    isFunctionLoading.value[toFunctionSelector(fragment)] = true;
    errors.value[toFunctionSelector(fragment)] = null;
  }
  for (const fragment of queryableFunctions) {
    fetchParamlessFragment(fragment);
  }
}

async function fetchParamlessFragment(fragment: AbiFunction): Promise<void> {
  if (!results.value) {
    results.value = {};
  }
  if (!isFunctionLoading.value) {
    isFunctionLoading.value = {};
  }
  if (!errors.value) {
    errors.value = {};
  }
  try {
    const result = await readContract(client.value, {
      address: address,
      abi: abi.value || [],
      functionName: fragment.name,
      args: [],
    });
    results.value[toFunctionSelector(fragment)] = result;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  } catch (e) {
    const error = getQueryError(e);
    errors.value[toFunctionSelector(fragment)] = error;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  }
}

async function handleSubmit(
  fragment: AbiFragment,
  args: unknown[],
  account?: Address,
  amount?: bigint,
): Promise<void> {
  if (fragment.type !== 'function') {
    return;
  }
  if (!isFunctionLoading.value) {
    isFunctionLoading.value = {};
  }
  if (!errors.value) {
    errors.value = {};
  }
  if (!results.value) {
    results.value = {};
  }
  isFunctionLoading.value[toFunctionSelector(fragment)] = true;
  errors.value[toFunctionSelector(fragment)] = null;
  try {
    const { result } = await simulateContract(client.value, {
      address: address,
      abi: abi.value || [],
      functionName: fragment.name,
      args,
      account: account || undefined,
      value: amount || 0n,
    });
    results.value[toFunctionSelector(fragment)] = result;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  } catch (e) {
    const error = getQueryError(e);
    errors.value[toFunctionSelector(fragment)] = error;
    isFunctionLoading.value[toFunctionSelector(fragment)] = false;
  }
}
</script>

<style scoped>
.interact {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
}

.interact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
}

.list {
  display: flex;
  gap: var(--spacing-8);
  flex-direction: column;
}
</style>
