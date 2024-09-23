<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel value="Token 0" />
      <AttributeItemValue v-if="token0">
        <LinkAddress :address="token0" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Token 1" />
      <AttributeItemValue v-if="token1">
        <LinkAddress :address="token1" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Price" />
      <AttributeItemValue v-if="price && composition">
        1 {{ composition.token0.symbol }} = {{ price }}
        {{ composition.token1.symbol }}
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Factory" />
      <AttributeItemValue v-if="factory">
        <LinkAddress :address="factory" />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel value="Composition" />
      <AttributeItemValue v-if="composition">
        {{
          fromWei(
            composition.token0.balance,
            composition.token0.decimals,
            'string',
          )
        }}
        {{ composition.token0.symbol }} +
        {{
          fromWei(
            composition.token1.balance,
            composition.token1.decimals,
            'string',
          )
        }}
        {{ composition.token1.symbol }}
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { computed, ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_ERC20 from '@/abi/erc20';
import ABI_UNISWAP_V2_POOL from '@/abi/uniswapV2Pool';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import { fromWei } from '@/utils/conversion';

interface Token {
  balance: bigint;
  decimals: number;
  symbol: string;
}

interface Composition {
  token0: Token;
  token1: Token;
}

const { address } = defineProps<{
  address: Address;
}>();

const { client } = useChain();

const isLoading = ref(true);

const token0 = ref<Address | null>(null);
const token1 = ref<Address | null>(null);
const factory = ref<Address | null>(null);
const composition = ref<Composition | null>(null);

const price = computed<number | null>(() => {
  if (!composition.value) return null;
  const precision = 10n ** 30n;
  const price =
    (precision * composition.value.token1.balance) /
    composition.value.token0.balance;
  const priceFloat =
    fromWei(price, composition.value.token1.decimals, 'number') /
    fromWei(precision, composition.value.token0.decimals, 'number');
  return priceFloat;
});

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
        abi: ABI_UNISWAP_V2_POOL,
        functionName: 'token0',
      },
      {
        address,
        abi: ABI_UNISWAP_V2_POOL,
        functionName: 'token1',
      },
      {
        address,
        abi: ABI_UNISWAP_V2_POOL,
        functionName: 'factory',
      },
    ],
  });

  token0.value =
    result[0].status === 'success'
      ? (result[0].result.toLowerCase() as Address)
      : null;
  token1.value =
    result[1].status === 'success'
      ? (result[1].result.toLowerCase() as Address)
      : null;
  factory.value =
    result[2].status === 'success'
      ? (result[2].result.toLowerCase() as Address)
      : null;

  if (token0.value && token1.value) {
    const result = await client.value.multicall({
      contracts: [
        {
          address: token0.value as Address,
          abi: ABI_ERC20,
          functionName: 'balanceOf',
          args: [address],
        },
        {
          address: token0.value as Address,
          abi: ABI_ERC20,
          functionName: 'decimals',
        },
        {
          address: token0.value as Address,
          abi: ABI_ERC20,
          functionName: 'symbol',
        },
        {
          address: token1.value as Address,
          abi: ABI_ERC20,
          functionName: 'balanceOf',
          args: [address],
        },
        {
          address: token1.value as Address,
          abi: ABI_ERC20,
          functionName: 'decimals',
        },
        {
          address: token1.value as Address,
          abi: ABI_ERC20,
          functionName: 'symbol',
        },
      ],
    });
    const balance0 = result[0].status === 'success' ? result[0].result : null;
    const decimals0 = result[1].status === 'success' ? result[1].result : null;
    const symbol0 = result[2].status === 'success' ? result[2].result : null;
    const balance1 = result[3].status === 'success' ? result[3].result : null;
    const decimals1 = result[4].status === 'success' ? result[4].result : null;
    const symbol1 = result[5].status === 'success' ? result[5].result : null;
    composition.value =
      balance0 && decimals0 && symbol0 && balance1 && decimals1 && symbol1
        ? {
            token0: {
              balance: balance0,
              decimals: decimals0,
              symbol: symbol0,
            },
            token1: {
              balance: balance1,
              decimals: decimals1,
              symbol: symbol1,
            },
          }
        : null;
  }

  isLoading.value = false;
}
</script>
