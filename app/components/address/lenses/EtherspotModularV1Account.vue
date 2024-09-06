<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Validators'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="validator in validators"
          :key="validator"
          :address="validator"
        />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_ETHERSPOT_MODULAR_V1_ACCOUNT from '@/abi/etherspotModularV1Account';
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

const validators = ref<Address[] | null>(null);

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
        abi: ABI_ETHERSPOT_MODULAR_V1_ACCOUNT,
        functionName: 'getValidatorPaginated',
        args: ['0x0000000000000000000000000000000000000001', 1000n],
      },
    ],
  });

  validators.value =
    result[0].status === 'success'
      ? result[0].result[0].map(
          (owner: string) => owner.toLowerCase() as Address,
        )
      : null;

  isLoading.value = false;
}
</script>
