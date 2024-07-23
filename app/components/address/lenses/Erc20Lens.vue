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
          :loading="isBalanceLoading"
          @query="fetchBalance"
        >
          <template #input>
            <LensInput
              v-model="balanceOwner"
              :disabled="isBalanceLoading"
              placeholder="Owner"
            />
          </template>
          <template
            v-if="balance"
            #output
          >
            {{ balance }}
          </template>
        </LensForm>
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Allowance'" />
      <AttributeItemValue>
        <LensForm
          :loading="isAllowanceLoading"
          @query="fetchAllowance"
        >
          <template #input>
            <LensInput
              v-model="allowanceOwner"
              :disabled="isAllowanceLoading"
              placeholder="Owner"
            />
            <LensInput
              v-model="allowanceSpender"
              :disabled="isAllowanceLoading"
              placeholder="Spender"
            />
          </template>
          <template
            v-if="allowance"
            #output
          >
            {{ allowance }}
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
import LensInput from './common/LensInput.vue';

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

const balanceOwner = ref<string>('');
const allowanceOwner = ref<string>('');
const allowanceSpender = ref<string>('');

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

async function fetchBalance(): Promise<void> {
  isBalanceLoading.value = true;
  balance.value = null;
  if (!client.value || !balanceOwner.value) return;

  const result = await client.value.readContractWithNames({
    address: props.address as Address,
    abi: ABI_ERC20,
    functionName: 'balanceOf',
    args: [balanceOwner.value as Address],
  });

  isBalanceLoading.value = false;
  balance.value = decimals.value
    ? fromWei(result, decimals.value).toString()
    : result.toString();
}

async function fetchAllowance(): Promise<void> {
  isAllowanceLoading.value = true;
  allowance.value = null;
  if (!client.value || !allowanceOwner.value || !allowanceSpender.value) return;

  const result = await client.value.readContractWithNames({
    address: props.address as Address,
    abi: ABI_ERC20,
    functionName: 'allowance',
    args: [allowanceOwner.value as Address, allowanceSpender.value as Address],
  });

  isAllowanceLoading.value = false;
  allowance.value = decimals.value
    ? fromWei(result, decimals.value).toString()
    : result.toString();
}
</script>
