<template>
  <BaseCard :items />
</template>

<script setup lang="ts">
import {
  getContractAddress,
  size,
  type Address,
  type Transaction,
  type Log,
} from 'viem';
import { computed } from 'vue';

import type { Item } from '@/components/__common/CardHighlights.vue';
import BaseCard from '@/components/__common/CardHighlights.vue';

const props = defineProps<{
  transaction: Transaction;
  logs: Log[];
}>();

const items = computed<Item[]>(() => {
  if (!props.transaction) {
    return [];
  }
  const toAddress = props.transaction.to;
  const input = props.transaction.input;
  if (!toAddress && size(input) > 0) {
    const from = props.transaction.from;
    const nonce = BigInt(props.transaction.nonce);
    // Contract deployment transaction
    const contractAddress = getContractAddress({
      from,
      nonce,
    });
    return [
      [
        {
          type: 'text',
          value: 'Contract deployed at',
        },
        {
          type: 'address',
          address: contractAddress.toLowerCase() as Address,
        },
      ],
    ];
  }
  return [];
});
</script>
