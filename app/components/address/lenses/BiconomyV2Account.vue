<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Modules'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="module in modules"
          :key="module"
          :address="module"
        />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_BICONOMY_V2_ACCOUNT from '@/abi/biconomyV2Account';
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

const modules = ref<readonly Address[] | null>(null);

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
        abi: ABI_BICONOMY_V2_ACCOUNT,
        functionName: 'getModulesPaginated',
        args: ['0x0000000000000000000000000000000000000001', 100n],
      },
    ],
  });

  modules.value = result[0].error
    ? null
    : result[0].result[0].map((x: string) => x.toLowerCase() as Address);

  isLoading.value = false;
}
</script>

<style scoped>
.soon {
  font-style: italic;
}
</style>
