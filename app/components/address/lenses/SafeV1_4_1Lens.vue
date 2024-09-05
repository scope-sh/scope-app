<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Owners'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="owner in owners"
          :key="owner"
          :address="owner"
        />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Threshold'" />
      <AttributeItemValue>{{ threshold }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem v-if="modules && modules.length > 0">
      <AttributeItemLabel :value="'Modules'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="mod in modules"
          :key="mod"
          :address="mod"
        />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Nonce'" />
      <AttributeItemValue>{{ nonce }}</AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_SAFE_1_4_1_ACCOUNT from '@/abi/safeV1_4_1Account';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';

const { client } = useChain();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const owners = ref<Address[] | null>(null);
const threshold = ref<bigint | null>(null);
const modules = ref<readonly Address[] | null>(null);
const nonce = ref<bigint | null>(null);

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
        abi: ABI_SAFE_1_4_1_ACCOUNT,
        functionName: 'getOwners',
      },
      {
        address: props.address as Address,
        abi: ABI_SAFE_1_4_1_ACCOUNT,
        functionName: 'getThreshold',
      },
      {
        address: props.address as Address,
        abi: ABI_SAFE_1_4_1_ACCOUNT,
        functionName: 'getModulesPaginated',
        args: ['0x0000000000000000000000000000000000000001', 1000n],
      },
      {
        address: props.address as Address,
        abi: ABI_SAFE_1_4_1_ACCOUNT,
        functionName: 'nonce',
      },
    ],
  });

  owners.value =
    result[0].status === 'success'
      ? result[0].result.map((owner: string) => owner.toLowerCase() as Address)
      : null;
  threshold.value =
    result[1].status === 'success' ? BigInt(result[1].result) : null;
  modules.value =
    result[2].status === 'success'
      ? result[2].result[0].map((mod) => mod.toLowerCase() as Address)
      : ([] as Address[]);
  nonce.value =
    result[3].status === 'success' ? BigInt(result[3].result) : null;

  isLoading.value = false;
}
</script>
