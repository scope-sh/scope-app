<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Account Id'" />
      <AttributeItemValue>{{ accountId }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Module Types'" />
      <AttributeItemValue>{{ moduleTypeSupportLabel }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Execution'" />
      <AttributeItemValue>{{ executionModeSupportLabel }}</AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { computed, ref, watch } from 'vue';

import ABI_ERC7579_ACCOUNT from '@/abi/erc7579Account';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import {
  CALLTYPE_SINGLE,
  CALLTYPE_BATCH,
  CALLTYPE_STATIC,
  CALLTYPE_DELEGATECALL,
  EXECTYPE_DEFAULT,
  EXECTYPE_TRY,
  EXEC_MODE_DEFAULT,
  formatCalltype,
  formatExectype,
  formatExecMode,
} from '@/utils/context/erc7579/execution';
import {
  TYPE_VALIDATION,
  TYPE_EXECUTION,
  TYPE_FALLBACK,
  TYPE_HOOK,
  TYPE_POLICY,
  TYPE_SIGNER,
  getName,
} from '@/utils/context/erc7579/modules';

import LensBase from './common/LensBase.vue';

const { client } = useChain();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const accountId = ref<string | null>(null);

const executionModeSupportLabel = computed(() => {
  const supportedCalltypes = [
    CALLTYPE_SINGLE,
    CALLTYPE_BATCH,
    CALLTYPE_STATIC,
    CALLTYPE_DELEGATECALL,
  ];
  const supportedExectypes = [EXECTYPE_DEFAULT, EXECTYPE_TRY];
  const supportedExecModes = [EXEC_MODE_DEFAULT];
  return `Call types: ${supportedCalltypes.map(formatCalltype).join(', ')}. Execution types: ${supportedExectypes.map(formatExectype).join(', ')}. Execution modes: ${supportedExecModes.map(formatExecMode).join(', ')}.`;
});

const moduleTypeSupportLabel = computed(() => {
  const supportedTypes = [
    TYPE_VALIDATION,
    TYPE_EXECUTION,
    TYPE_FALLBACK,
    TYPE_HOOK,
    TYPE_POLICY,
    TYPE_SIGNER,
  ];
  return supportedTypes.map(getName).join(', ');
});

watch(
  () => props.address,
  () => {
    fetch();
  },
  {
    immediate: true,
  },
);

async function fetch(): Promise<void> {
  if (!client.value) return;

  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_ERC7579_ACCOUNT,
        functionName: 'accountId',
      },
    ],
  });

  accountId.value = result[0].error ? null : result[0].result;

  isLoading.value = false;
}
</script>
