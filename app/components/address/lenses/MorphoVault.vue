<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel value="Asset" />
      <AttributeItemValue v-if="asset">
        <LinkAddress :address="asset" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Name" />
      <AttributeItemValue v-if="name">{{ name }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Total Supply" />
      <AttributeItemValue> {{ totalSupply }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Fee" />
      <AttributeItemValue v-if="fee">
        {{ formatShare(fee) }}
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Balance" />
      <AttributeItemValue>
        <LensQuery
          :address="address"
          :abi="ABI_MORPHO_VAULT"
          function-name="balanceOf"
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

import ABI_MORPHO_VAULT from '@/abi/morphoVault';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import { fromWei } from '@/utils/conversion';
import { formatShare } from '@/utils/formatting';

const { address } = defineProps<{
  address: Address;
}>();

const { client } = useChain();

const isLoading = ref(true);

const asset = ref<Address | null>(null);
const name = ref<string | null>(null);
const fee = ref<number | null>(null);
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
        abi: ABI_MORPHO_VAULT,
        functionName: 'asset',
      },
      {
        address,
        abi: ABI_MORPHO_VAULT,
        functionName: 'name',
      },
      {
        address,
        abi: ABI_MORPHO_VAULT,
        functionName: 'fee',
      },
      {
        address,
        abi: ABI_MORPHO_VAULT,
        functionName: 'decimals',
      },
      {
        address,
        abi: ABI_MORPHO_VAULT,
        functionName: 'totalSupply',
      },
    ],
  });

  asset.value =
    result[0].status === 'success'
      ? (result[0].result.toLowerCase() as Address)
      : null;
  name.value = result[1].status === 'success' ? result[1].result : null;
  fee.value =
    result[2].status === 'success'
      ? fromWei(result[2].result, 18, 'number')
      : null;
  decimals.value = result[3].status === 'success' ? result[3].result : null;
  totalSupply.value =
    result[4].status === 'success' && decimals.value
      ? fromWei(result[4].result, decimals.value, 'string')
      : null;

  isLoading.value = false;
}
</script>
