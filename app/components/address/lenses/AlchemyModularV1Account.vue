<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Nonce'" />
      <AttributeItemValue>
        {{ nonce }}
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Plugins'" />
      <AttributeItemValue>
        <LinkAddress
          v-for="plugin in plugins"
          :key="plugin"
          :address="plugin"
        />
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_ALCHEMY_MODULAR_V1_ACCOUNT from '@/abi/alchemyModularV1Account';
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

const nonce = ref<bigint | null>(null);
const plugins = ref<Address[] | null>(null);

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
        abi: ABI_ALCHEMY_MODULAR_V1_ACCOUNT,
        functionName: 'getInstalledPlugins',
      },
      {
        address: props.address as Address,
        abi: ABI_ALCHEMY_MODULAR_V1_ACCOUNT,
        functionName: 'getNonce',
      },
    ],
  });

  plugins.value =
    result[0].status === 'success'
      ? result[0].result.map(
          (address: string) => address.toLowerCase() as Address,
        )
      : null;
  nonce.value = result[1].status === 'success' ? result[1].result : null;

  isLoading.value = false;
}
</script>
