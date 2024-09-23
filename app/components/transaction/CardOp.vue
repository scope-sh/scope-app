<template>
  <ScopeCard v-if="opUnpacked">
    <AttributeList>
      <AttributeItem>
        <AttributeItemLabel value="Hash" />
        <AttributeItemValue>
          <LinkOp :hash="opUnpacked.hash" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Success" />
        <AttributeItemValue>
          {{ opUnpacked.success }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Sender" />
        <AttributeItemValue>
          <LinkAddress :address="opUnpacked.sender" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Nonce" />
        <AttributeItemValue>
          {{ opUnpacked.nonce }}
        </AttributeItemValue>
      </AttributeItem>

      <AttributeItem v-if="size(opUnpacked.initCode) > 0">
        <AttributeItemLabel value="Init Code" />
        <AttributeItemValue>
          <ScopeTextView
            :value="opUnpacked.initCode"
            :size="'tiny'"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="opUnpacked.callData"
            :size="'tiny'"
          />
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </ScopeCard>
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { size } from 'viem';
import { computed } from 'vue';

import LinkOp from '../__common/LinkOp.vue';
import ScopeCard from '../__common/ScopeCard.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import type { Transaction, TransactionReceipt } from '@/services/evm';
import {
  type Op,
  getOpHash,
  getOpEvent,
  unpackOp,
} from '@/utils/context/erc4337/entryPoint';

const { entryPoint, op, transactionReceipt } = defineProps<{
  entryPoint: Address | null;
  op: Op;
  transaction: Transaction;
  transactionReceipt: TransactionReceipt;
}>();

const { id: chainId } = useChain();

const hash = computed<Hex | null>(() => {
  if (!entryPoint) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  return getOpHash(chainId.value, entryPoint, op);
});

const opUnpacked = computed(() => {
  if (!hash.value) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  if (!entryPoint) {
    return null;
  }
  const event = getOpEvent(
    chainId.value,
    entryPoint,
    transactionReceipt.logs,
    op,
  );
  if (!event) {
    return null;
  }
  return unpackOp(hash.value, op, event);
});
</script>

<style scoped>
.data {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  gap: 4px;
}
</style>
