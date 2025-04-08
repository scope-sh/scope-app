<template>
  <ScopeCard v-if="opEvent && opUnpacked">
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
          {{ opEvent.success }}
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
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="opUnpacked.callData"
            size="tiny"
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
import type { TransactionReceipt } from '@/services/evm';
import {
  type Op,
  getOpHash,
  getOpEvent,
  unpackOp,
} from '@/utils/context/erc4337/entryPoint';

const { entryPoint, op, transactionReceipt, delegate } = defineProps<{
  entryPoint: Address | null;
  op: Op;
  transactionReceipt: TransactionReceipt;
  delegate: Address | null;
}>();

const { id: chainId } = useChain();

const hash = computed<Hex | null>(() => {
  if (!entryPoint) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  return getOpHash(chainId.value, entryPoint, op, delegate);
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
  return unpackOp(hash.value, op);
});

const opEvent = computed(() => {
  if (!chainId.value) {
    return null;
  }
  if (!entryPoint) {
    return null;
  }
  return getOpEvent(
    chainId.value,
    entryPoint,
    transactionReceipt.logs,
    op,
    delegate,
  );
});
</script>

<style scoped>
.data {
  display: flex;
  gap: 16px;
  flex-direction: column;
}

.row {
  display: flex;
  gap: 4px;
}
</style>
