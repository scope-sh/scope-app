<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Active Keys'" />
      <AttributeItemValue>{{ activeKeys }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Active Slots'" />
      <AttributeItemValue>{{ activeSlots }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Key'" />
      <AttributeItemValue>
        <LensForm
          :abi-inputs="[
            {
              type: 'uint256',
              name: 'index',
            },
          ]"
          :is-loading="isKeyLoading"
          @submit="fetchKey"
        >
          <template
            v-if="key"
            #output
          >
            {{ key }}
          </template>
        </LensForm>
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import { type Address, concat } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';
import LensForm from './common/LensForm.vue';

import ABI_DAIMO_ACCOUNT from '@/abi/daimoAccount';
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
const isKeyLoading = ref(false);

const activeKeys = ref<number | null>(null);
const activeSlots = ref<string | null>(null);
const key = ref<string | null>(null);

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
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'numActiveKeys',
      },
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'getActiveSigningKeys',
      },
    ],
  });

  activeKeys.value = result[0].status === 'success' ? result[0].result : null;
  activeSlots.value =
    result[1].status === 'success' ? result[1].result[1].join(', ') : null;

  isLoading.value = false;
}

async function fetchKey(args: unknown[]): Promise<void> {
  const keyIndex = args[0] as bigint;
  isKeyLoading.value = true;
  key.value = null;
  if (!client.value || keyIndex === undefined) return;

  const index = parseInt(keyIndex.toString());
  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'keys',
        args: [index, 0n],
      },
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'keys',
        args: [index, 1n],
      },
    ],
  });

  isKeyLoading.value = false;
  const keyPartLeft = result[0].status === 'success' ? result[0].result : null;
  const keyPartRight = result[1].status === 'success' ? result[1].result : null;
  key.value =
    keyPartLeft && keyPartRight ? concat([keyPartLeft, keyPartRight]) : null;
}
</script>
