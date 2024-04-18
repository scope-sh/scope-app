<template>
  <ScopeCard v-if="data">
    <AttributeList>
      <AttributeItem>
        <AttributeItemLabel value="Hash" />
        <AttributeItemValue>
          <ScopeLinkInternal
            :route="{
              name: 'userop',
              hash: data.hash,
            }"
          >
            {{ data.hash }}
          </ScopeLinkInternal>
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Success" />
        <AttributeItemValue>
          {{ data.success }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Sender" />
        <AttributeItemValue>
          <LinkAddress :address="data.sender" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Nonce" />
        <AttributeItemValue>
          {{ data.nonce }}
        </AttributeItemValue>
      </AttributeItem>

      <AttributeItem v-if="size(data.initCode) > 0">
        <AttributeItemLabel value="Init Code" />
        <AttributeItemValue>
          <ScopeTextView
            :value="data.initCode"
            :size="'tiny'"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="data.callData"
            :size="'tiny'"
          />
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </ScopeCard>
</template>

<script setup lang="ts">
import type { Hex } from 'viem';
import { size } from 'viem';
import { computed } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
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
  getUserOpData,
} from '@/utils/context/erc4337/entryPoint';

import ScopeCard from '../__common/ScopeCard.vue';

const props = defineProps<{
  op: UserOp;
  transaction: Transaction;
  transactionReceipt: TransactionReceipt;
}>();

const { id: chainId } = useChain();

const entrypoint = computed(() => props.transaction.to);

const hash = computed<Hex | null>(() => {
  if (!entrypoint.value) {
    return null;
  }
  if (!chainId.value) {
    return null;
  }
  return getUserOpHash(chainId.value, entrypoint.value, props.op);
});

const event = computed(() => {
  if (!chainId.value) {
    return null;
  }
  if (!entrypoint.value) {
    return null;
  }
  return getUserOpEvent(
    chainId.value,
    entrypoint.value,
    props.transactionReceipt.logs,
    props.op,
  );
});

const data = computed(() => {
  if (!hash.value) {
    return null;
  }
  if (!event.value) {
    return null;
  }
  return getUserOpData(hash.value, props.op, event.value);
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
