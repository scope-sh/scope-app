<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel value="Types" />
      <AttributeItemValue>{{ typesLabel }}</AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { computed, ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_ERC7579_MODULE from '@/abi/erc7579Module';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import {
  getName as getTypeName,
  TYPE_VALIDATION,
  TYPE_EXECUTION,
  TYPE_FALLBACK,
  TYPE_HOOK,
  TYPE_POLICY,
  TYPE_SIGNER,
  TYPE_ACTION,
} from '@/utils/context/erc7579/modules';

const { address } = defineProps<{
  address: Address;
}>();

const { client } = useChain();

const isLoading = ref(true);

const types = ref<number[]>([]);

watch(
  () => address,
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
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_VALIDATION)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_EXECUTION)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_FALLBACK)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_HOOK)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_POLICY)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_SIGNER)],
      },
      {
        address,
        abi: ABI_ERC7579_MODULE,
        functionName: 'isModuleType',
        args: [BigInt(TYPE_ACTION)],
      },
    ],
  });

  types.value = result
    .map((r, index) => (r.status === 'success' && r.result ? index + 1 : 0))
    .filter((t) => t > 0);

  isLoading.value = false;
}

const typesLabel = computed(() => {
  return types.value.map((t) => getTypeName(t)).join(', ');
});
</script>
