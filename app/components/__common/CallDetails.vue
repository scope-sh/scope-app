<template>
  <div class="root">
    <CallStatus
      v-if="call.success !== true"
      :status="call.success"
    />
    <AttributeList>
      <AttributeItem>
        <AttributeItemLabel
          value="Type"
          note="The type of the call"
        />
        <AttributeItemValue>
          {{ formatType(call.type) }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel
          value="From"
          note="The address of the account that initiated the transaction"
        />
        <AttributeItemValue>
          <LinkAddress :address="call.from" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="call.to">
        <AttributeItemLabel
          value="To"
          note="The address of the account or contract that is the recipient of the transaction"
        />
        <AttributeItemValue>
          <LinkAddress :address="call.to" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="call.value > 0n">
        <AttributeItemLabel
          value="Value"
          note="The amount of natuve currency transferred from the sender to the recipient"
        />
        <AttributeItemValue>
          {{ formatEther(call.value, nativeCurrency, true) }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel
          value="Gas Used"
          note="The total amount of gas consumed by the transaction execution"
        />
        <AttributeItemValue :note="getGasUsedShare(call)">
          {{ call.gas.used }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel
          value="Gas Limit"
          note="The maximum amount of gas the sender is willing to pay for executing the transaction"
        />
        <AttributeItemValue>
          {{ call.gas.limit }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="size(call.input) > 0">
        <AttributeItemLabel
          :value="call.type === 'create' ? 'Init code' : 'Input'"
          :note="
            call.type === 'create'
              ? 'The code used to deploy a new contract'
              : 'The additional data sent along with the transaction, often used to invoke functions on contracts.'
          "
        />
        <AttributeItemValue>
          <ScopeTextView
            size="regular"
            :value="call.input"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="call.output && size(call.output) > 0">
        <AttributeItemLabel
          value="Output"
          note="The result of the call"
        />
        <AttributeItemValue>
          <ScopeTextView
            size="regular"
            :value="call.output"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="call.address">
        <AttributeItemLabel
          value="Address"
          note="The address of the deployed contract"
        />
        <AttributeItemValue>
          <LinkAddress :address="call.address" />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="call.code">
        <AttributeItemLabel
          value="Bytecode"
          note="The code of the deployed contract"
        />
        <AttributeItemValue>
          <ScopeTextView
            size="regular"
            :value="call.code"
          />
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </div>
</template>

<script setup lang="ts">
import { size } from 'viem';

import CallStatus from './CallStatus.vue';
import LinkAddress from './LinkAddress.vue';
import ScopeTextView from './ScopeTextView.vue';
import type { Call, CallType } from './TreeInternalCalls.vue';
import {
  AttributeList,
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from './attributes';

import useChain from '@/composables/useChain';
import { formatEther, formatShare } from '@/utils/formatting';

const { nativeCurrency } = useChain();

defineProps<{
  call: Call;
  width: string;
}>();

function getGasUsedShare(item: Call): string {
  const gasUsed = parseInt(item.gas.used.toString());
  const gasLimit = parseInt(item.gas.limit.toString());
  return formatShare(gasUsed / gasLimit);
}

function formatType(value: CallType): string {
  return value === 'create'
    ? 'Create'
    : value === 'call'
      ? 'Call'
      : value === 'delegatecall'
        ? 'Delegate Call'
        : 'Static Call';
}
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-6);
  position: sticky;
  left: 0;
  flex-direction: column;
  width: v-bind('width');
  padding: var(--spacing-8) var(--spacing-10);
  border-top: 1px solid var(--color-border-tertiary);
  border-bottom: 1px solid var(--color-border-tertiary);
}
</style>
