<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Owner'" />
      <AttributeItemValue v-if="owner">
        <LinkAddress :address="owner" />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_ALCHEMY_V2_ACCOUNT from '@/abi/alchemyLightV2Account';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';

const { client } = useChain();

const { address } = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const owner = ref<Address | null>(null);

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
        abi: ABI_ALCHEMY_V2_ACCOUNT,
        functionName: 'owner',
      },
    ],
  });

  owner.value =
    result[0].status === 'success'
      ? (result[0].result.toLowerCase() as Address)
      : null;

  isLoading.value = false;
}
</script>
