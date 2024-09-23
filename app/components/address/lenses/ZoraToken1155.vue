<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem v-if="symbol">
      <AttributeItemLabel value="Symbol" />
      <AttributeItemValue>{{ symbol }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Name" />
      <AttributeItemValue>{{ name }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Next Token ID" />
      <AttributeItemValue>{{ nextTokenId }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Owner" />
      <AttributeItemValue v-if="owner">
        <LinkAddress :address="owner" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Funds Recipient" />
      <AttributeItemValue v-if="fundsRecipient">
        <LinkAddress :address="fundsRecipient" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Balance" />
      <AttributeItemValue>
        <LensQuery
          :address="address"
          :abi="ABI_ZORA_1155_TOKEN"
          function-name="balanceOf"
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

import ABI_ZORA_1155_TOKEN from '@/abi/zora1155Token';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';

const { address } = defineProps<{
  address: Address;
}>();

const { client } = useChain();

const isLoading = ref(true);

const symbol = ref<string | null>(null);
const name = ref<string | null>(null);
const owner = ref<Address | null>(null);
const fundsRecipient = ref<Address | null>(null);
const nextTokenId = ref<bigint | null>(null);

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
        abi: ABI_ZORA_1155_TOKEN,
        functionName: 'symbol',
      },
      {
        address,
        abi: ABI_ZORA_1155_TOKEN,
        functionName: 'name',
      },
      {
        address,
        abi: ABI_ZORA_1155_TOKEN,
        functionName: 'config',
      },
      {
        address,
        abi: ABI_ZORA_1155_TOKEN,
        functionName: 'nextTokenId',
      },
    ],
  });

  symbol.value = result[0].status === 'success' ? result[0].result : null;
  name.value = result[1].status === 'success' ? result[1].result : null;
  owner.value =
    result[2].status === 'success'
      ? (result[2].result[0].toLowerCase() as Address)
      : null;
  fundsRecipient.value =
    result[2].status === 'success'
      ? (result[2].result[2].toLowerCase() as Address)
      : null;
  nextTokenId.value = result[3].status === 'success' ? result[3].result : null;

  isLoading.value = false;
}
</script>
