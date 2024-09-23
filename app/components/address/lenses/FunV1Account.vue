<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Validations'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="validation in validations"
          :key="validation"
          :address="validation"
        />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_FUN_V1_ACCOUNT from '@/abi/funV1Account';
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

const validations = ref<Address[] | null>(null);

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
        abi: ABI_FUN_V1_ACCOUNT,
        functionName: 'getValidations',
      },
    ],
  });

  validations.value =
    result[0].status === 'success'
      ? result[0].result.map((owner: string) => owner.toLowerCase() as Address)
      : null;

  isLoading.value = false;
}
</script>
