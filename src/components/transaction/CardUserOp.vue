<template>
  <ScopeCard v-if="userOpUnpacked">
    <AttributeList>
      <AttributeItem>
        <AttributeItemLabel value="Hash" />
        <AttributeItemValue>
          <LinkUserOp :hash="userOpUnpacked.hash" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Success" />
        <AttributeItemValue>
          {{ userOpUnpacked.success }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Sender" />
        <AttributeItemValue>
          <LinkAddress :address="userOpUnpacked.sender" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Nonce" />
        <AttributeItemValue>
          {{ userOpUnpacked.nonce }}
        </AttributeItemValue>
      </AttributeItem>

      <AttributeItem v-if="size(userOpUnpacked.initCode) > 0">
        <AttributeItemLabel value="Init Code" />
        <AttributeItemValue>
          <ScopeTextView
            :value="userOpUnpacked.initCode"
            :size="'tiny'"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="userOpUnpacked.callData"
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
  type UserOp,
  getUserOpHash,
  getUserOpEvent,
  unpackUserOp,
} from '@/utils/context/erc4337/entryPoint';

import LinkUserOp from '../__common/LinkUserOp.vue';
import ScopeCard from '../__common/ScopeCard.vue';

const props = defineProps<{
  entryPoint: Address | null;
  op: UserOp;
  transaction: Transaction;
  transactionReceipt: TransactionReceipt;
}>();

const { id: chainId } = useChain();

const hash = computed<Hex | null>(() => {
  if (!props.entryPoint) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  return getUserOpHash(chainId.value, props.entryPoint, props.op);
});

const userOpUnpacked = computed(() => {
  if (!hash.value) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  if (!props.entryPoint) {
    return null;
  }
  const event = getUserOpEvent(
    chainId.value,
    props.entryPoint,
    props.transactionReceipt.logs,
    props.op,
  );
  if (!event) {
    return null;
  }
  return unpackUserOp(hash.value, props.op, event);
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
