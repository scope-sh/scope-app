<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Nonce'" />
      <AttributeItemValue>{{ nonce }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem v-if="defaultValidator">
      <AttributeItemLabel :value="'Default Validator'" />
      <AttributeItemValue>
        <LinkAddress :address="defaultValidator" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Execution'" />
      <AttributeItemValue>
        <LensQuery
          :address="address"
          :abi="ABI_KERNEL_V2_ACCOUNT"
          :function-name="'getExecution'"
          :formatter="formatExecution"
        />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';
import LensQuery from './common/LensQuery.vue';

import ABI_KERNEL_V2_ACCOUNT from '@/abi/kernelV2Account';
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

interface ExecutionData {
  validAfter: number;
  validUntil: number;
  executor: Address;
  validator: Address;
}

const isLoading = ref(true);

const nonce = ref<bigint | null>(null);
const defaultValidator = ref<Address | null>(null);

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
        abi: ABI_KERNEL_V2_ACCOUNT,
        functionName: 'getNonce',
      },
      {
        address: props.address as Address,
        abi: ABI_KERNEL_V2_ACCOUNT,
        functionName: 'getDefaultValidator',
      },
    ],
  });

  nonce.value = result[0].error ? null : result[0].result;
  defaultValidator.value = result[1].error
    ? null
    : (result[1].result.toLowerCase() as Address);

  isLoading.value = false;
}

function formatExecution(data: ExecutionData): string {
  if (data.validAfter === 0 && data.validUntil === 0) {
    return 'No execution';
  }
  return `Valid after ${data.validAfter}, valid until ${data.validUntil}, executor ${data.executor}, validator ${data.validator}`;
}
</script>

<style scoped>
.soon {
  font-style: italic;
}
</style>
