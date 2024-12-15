<template>
  <div
    ref="el"
    class="tree"
    :class="{ scrollable, error: hasError }"
  >
    <div class="scroll">
      <div
        v-for="(item, callIndex) in visibleCalls"
        :key="item.traceAddress.join('-')"
        class="item"
        :style="{ '--level': getLevel(item) }"
      >
        <CallRow
          :call="item"
          :level="getLevel(item)"
          :is-parent="hasChildren(item)"
          :first-child="callIndex === 0"
          :last-child="callIndex === visibleCalls.length - 1"
          @toggle-fold="() => toggleFold(item)"
          @toggle-expand="() => toggleSelectCall(item)"
        />
        <CallDetails
          v-if="item === selectedCall"
          :call="item"
          :width
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import type { Address, Hex } from 'viem';
import { ref, computed, watch, useTemplateRef } from 'vue';

import CallDetails from './CallDetails.vue';
import CallRow from './CallRow.vue';

import type { TransactionTrace } from '@/services/evm';

const { trace, hasError = false } = defineProps<{
  trace: TransactionTrace | null;
  hasError?: boolean;
}>();

type CallStatus = true | { type: 'OOG' } | { type: 'Revert'; reason: string };
type CallType = 'call' | 'delegatecall' | 'staticcall' | 'create';

interface Call {
  success: CallStatus;
  type: CallType;
  from: Address;
  to: Address | null;
  input: Hex;
  output: Hex | null;
  code: Hex | null;
  address: Address | null;
  value: bigint;
  gas: {
    used: bigint;
    limit: bigint;
  };
  traceAddress: number[];
  folded: boolean;
}

const width = ref('0px');
const el = useTemplateRef('el');
const scrollable = computed(() => {
  if (!el.value) {
    return false;
  }
  const element = el.value as HTMLElement;
  return element.scrollWidth > element.clientWidth;
});
useResizeObserver(el, (entries) => {
  const entry = entries[0];
  if (!entry) {
    return;
  }
  width.value = `${entry.contentRect.width}px`;
});

const calls = ref<Call[]>([]);
watch(
  () => trace,
  (trace) => {
    if (!trace) {
      calls.value = [];
      return;
    }
    calls.value = trace.map((transaction) => {
      return {
        success:
          transaction.error === null
            ? true
            : transaction.error === 'OOG'
              ? {
                  type: 'OOG',
                }
              : {
                  type: 'Revert',
                  reason: '',
                },
        type:
          transaction.type === 'create'
            ? 'create'
            : transaction.action.callType,
        from: transaction.action.from,
        to: transaction.type === 'call' ? transaction.action.to : null,
        input:
          transaction.type === 'call'
            ? transaction.action.input
            : transaction.action.init,
        output: transaction.type === 'call' ? transaction.result.output : null,
        code: transaction.type === 'create' ? transaction.result.code : null,
        address:
          transaction.type === 'create' ? transaction.result.address : null,
        value: transaction.action.value,
        gas: {
          used: transaction.result.gasUsed,
          limit: transaction.action.gas,
        },
        traceAddress: transaction.traceAddress,
        folded: false,
      };
    });
  },
  {
    immediate: true,
  },
);

const selectedCall = ref<Call | null>(null);

function toggleSelectCall(item: Call): void {
  selectedCall.value = selectedCall.value === item ? null : item;
}

function toggleFold(item: Call): void {
  item.folded = !item.folded;
}

function isDescendant(parent: Call, child: Call): boolean {
  if (parent.traceAddress.length >= child.traceAddress.length) {
    return false;
  }
  return parent.traceAddress.every((value, index) => {
    return value === child.traceAddress[index];
  });
}

const visibleCalls = computed<Call[]>(() => {
  // Only show the calls for which all the parents are unfolded
  return calls.value.filter((call) => {
    return calls.value.every((parent) => {
      return !isDescendant(parent, call) || !parent.folded;
    });
  });
});

function hasChildren(item: Call): boolean {
  return calls.value.some((call) => {
    return isDescendant(item, call);
  });
}

function getLevel(row: Call): number {
  return row.traceAddress.length;
}

export type { Call, CallType, CallStatus };
</script>

<style scoped>
.tree {
  --border-radius: var(--border-radius-s);

  width: 100%;
  overflow: auto hidden;
  border-spacing: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius);

  &.scrollable {
    padding-bottom: var(--spacing-4);
  }

  &.error {
    border-color: var(--color-error);
  }
}

.scroll {
  flex-direction: column;
  width: max-content;
  min-width: 100%;
}
</style>
