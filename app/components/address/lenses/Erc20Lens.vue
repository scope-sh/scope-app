<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel value="Symbol" />
      <AttributeItemValue>{{ symbol }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Name" />
      <AttributeItemValue>{{ name }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Decimals" />
      <AttributeItemValue> {{ decimals }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Total Supply" />
      <AttributeItemValue> {{ totalSupply }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Balance" />
      <AttributeItemValue>
        <LensQuery
          :address="address"
          :abi="ABI_ERC20"
          function-name="balanceOf"
          :formatter="
            (value) =>
              decimals ? fromWei(value, decimals, 'string') : value.toString()
          "
        />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Allowance" />
      <AttributeItemValue>
        <LensQuery
          :address="address"
          :abi="ABI_ERC20"
          function-name="allowance"
          :formatter="
            (value) =>
              decimals ? fromWei(value, decimals, 'string') : value.toString()
          "
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

import ABI_ERC20 from '@/abi/erc20';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import { fromWei } from '@/utils/conversion';

const { address } = defineProps<{
  address: Address;
}>();

const { client } = useChain();

const isLoading = ref(true);

const symbol = ref<string | null>(null);
const name = ref<string | null>(null);
const decimals = ref<number | null>(null);
const totalSupply = ref<string | null>(null);

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
        abi: ABI_ERC20,
        functionName: 'symbol',
      },
      {
        address,
        abi: ABI_ERC20,
        functionName: 'name',
      },
      {
        address,
        abi: ABI_ERC20,
        functionName: 'decimals',
      },
      {
        address,
        abi: ABI_ERC20,
        functionName: 'totalSupply',
      },
    ],
  });

  symbol.value = result[0].status === 'success' ? result[0].result : null;
  name.value = result[1].status === 'success' ? result[1].result : null;
  decimals.value = result[2].status === 'success' ? result[2].result : null;
  totalSupply.value =
    result[3].status === 'success' && decimals.value
      ? fromWei(result[3].result, decimals.value, 'string')
      : null;

  isLoading.value = false;
}
</script>
