<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Underlying'" />
      <AttributeItemValue v-if="underlying">
        <LinkAddress :address="underlying" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Pool'" />
      <AttributeItemValue v-if="pool">
        <LinkAddress :address="pool" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Total Supply'" />
      <AttributeItemValue> {{ totalSupply }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Balance'" />
      <AttributeItemValue>
        <LensQuery
          :address
          :abi="ABI_AAVE_V3_TOKEN"
          :function-name="'balanceOf'"
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

import ABI_AAVE_V3_TOKEN from '@/abi/aaveV3Token';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import { fromWei } from '@/utils/conversion';

const { client } = useChain();

const { address } = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const underlying = ref<Address | null>(null);
const pool = ref<Address | null>(null);
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
        abi: ABI_AAVE_V3_TOKEN,
        functionName: 'UNDERLYING_ASSET_ADDRESS',
      },
      {
        address,
        abi: ABI_AAVE_V3_TOKEN,
        functionName: 'POOL',
      },
      {
        address,
        abi: ABI_AAVE_V3_TOKEN,
        functionName: 'decimals',
      },
      {
        address,
        abi: ABI_AAVE_V3_TOKEN,
        functionName: 'totalSupply',
      },
    ],
  });

  underlying.value =
    result[0].status === 'success'
      ? (result[0].result.toLowerCase() as Address)
      : null;
  pool.value =
    result[1].status === 'success'
      ? (result[1].result.toLowerCase() as Address)
      : null;
  decimals.value = result[2].status === 'success' ? result[2].result : null;
  totalSupply.value =
    result[3].status === 'success' && decimals.value
      ? fromWei(result[3].result, decimals.value, 'string')
      : null;

  isLoading.value = false;
}
</script>
