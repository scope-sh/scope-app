<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Symbol'" />
      <AttributeItemValue>{{ symbol }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Name'" />
      <AttributeItemValue>{{ name }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Decimals'" />
      <AttributeItemValue> {{ decimals }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Total Supply'" />
      <AttributeItemValue> {{ totalSupply }} </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Balance'" />
      <AttributeItemValue>
        <LensForm
          :abi-inputs="[
            {
              type: 'address',
              name: 'owner',
            },
          ]"
          :is-loading="isBalanceLoading"
          @submit="fetchBalance"
        >
          <template #output>
            <div>{{ balance }}</div>
          </template>
        </LensForm>
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Allowance'" />
      <AttributeItemValue>
        <LensForm
          :abi-inputs="[
            {
              type: 'address',
              name: 'owner',
            },
            {
              type: 'address',
              name: 'spender',
            },
          ]"
          :is-loading="isAllowanceLoading"
          @submit="fetchAllowance"
        >
          <template #output>
            <div>{{ allowance }}</div>
          </template>
        </LensForm>
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import { type Address } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';
import LensForm from './common/LensForm.vue';

import ABI_ERC20 from '@/abi/erc20';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import { fromWei } from '@/utils/conversion';

const { client } = useChain();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);
const isBalanceLoading = ref(false);
const isAllowanceLoading = ref(false);

const symbol = ref<string | null>(null);
const name = ref<string | null>(null);
const decimals = ref<number | null>(null);
const totalSupply = ref<number | null>(null);
const balance = ref<string | null>(null);
const allowance = ref<string | null>(null);

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
        abi: ABI_ERC20,
        functionName: 'symbol',
      },
      {
        address: props.address as Address,
        abi: ABI_ERC20,
        functionName: 'name',
      },
      {
        address: props.address as Address,
        abi: ABI_ERC20,
        functionName: 'decimals',
      },
      {
        address: props.address as Address,
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
      ? fromWei(result[3].result, decimals.value)
      : null;

  isLoading.value = false;
}

async function fetchBalance(inputs: unknown[]): Promise<void> {
  const [owner] = inputs as [owner: string];
  isBalanceLoading.value = true;
  balance.value = null;
  if (!client.value || !owner) return;

  const result = await client.value.readContract({
    address: props.address as Address,
    abi: ABI_ERC20,
    functionName: 'balanceOf',
    args: [owner as Address],
  });

  isBalanceLoading.value = false;
  balance.value = decimals.value
    ? fromWei(result, decimals.value).toString()
    : result.toString();
}

async function fetchAllowance(inputs: unknown[]): Promise<void> {
  const [owner, spender] = inputs as [owner: string, spender: string];
  isAllowanceLoading.value = true;
  allowance.value = null;
  if (!client.value || !owner || !spender) return;

  const result = await client.value.readContract({
    address: props.address as Address,
    abi: ABI_ERC20,
    functionName: 'allowance',
    args: [owner as Address, spender as Address],
  });

  isAllowanceLoading.value = false;
  allowance.value = decimals.value
    ? fromWei(result, decimals.value).toString()
    : result.toString();
}
</script>
