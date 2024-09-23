<template>
  <div
    ref="el"
    class="tree"
    :class="{ scrollable }"
  >
    <div class="scroll">
      <div
        v-for="item in visibleCalls"
        :key="item.traceAddress.join('-')"
        class="item"
        :style="{ '--level': getLevel(item) }"
      >
        <div
          class="item-content"
          @click="() => toggleSelectCall(item)"
        >
          <div class="sticky left">
            <div class="cell status">
              <ScopeTooltip
                v-if="item.success !== true"
                delay="small"
              >
                <template #trigger>
                  <ScopeIcon
                    kind="cross"
                    class="icon"
                  />
                </template>
                <template #default>
                  {{ item.success.type === 'OOG' ? 'Out of gas' : 'Reverted' }}
                </template>
              </ScopeTooltip>
            </div>
            <div class="cell call">{{ formatType(item.type) }}</div>
          </div>
          <div
            v-for="index in getLevel(item)"
            :key="index"
            class="grid"
            :style="{ '--index': index }"
          />
          <div class="main">
            <div class="cell content">
              <ScopeIcon
                v-if="hasChildren(item)"
                class="icon-marker"
                :kind="item.folded ? 'chevron-right' : 'chevron-down'"
                @click.stop="() => toggleFold(item)"
              />
              <div
                v-else
                class="icon-marker"
              />
              <div class="path">
                <LinkAddress
                  :address="item.from"
                  type="minimal"
                />
                <template v-if="item.to">
                  →
                  <LinkAddress
                    :address="item.to"
                    type="minimal"
                  />
                </template>
              </div>
              <div class="input">
                <template v-if="item.type === 'create'">
                  {{ item.input }}
                </template>
                <template v-else>
                  <template v-if="size(getFunction(item.input))">
                    {{ getFunction(item.input) }}
                    <template v-if="size(getData(item.input))">
                      ({{ getData(item.input) }})
                    </template>
                  </template>
                </template>
              </div>
            </div>
          </div>
          <div class="sticky right">
            <div class="cell value">
              <ScopeTooltip delay="medium">
                <template #trigger>
                  {{ formatEther(item.value, nativeCurrency, false) }}
                </template>
                <template #default>
                  {{ formatEther(item.value, nativeCurrency, true) }}
                </template>
              </ScopeTooltip>
            </div>
          </div>
        </div>
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
import { type Address, type Hex, size, slice } from 'viem';
import { ref, computed, watch, useTemplateRef } from 'vue';

import CallDetails from './CallDetails.vue';
import LinkAddress from './LinkAddress.vue';
import ScopeIcon from './ScopeIcon.vue';
import ScopeTooltip from './ScopeTooltip.vue';

import useChain from '@/composables/useChain';
import type { TransactionTrace } from '@/services/evm';
import { formatEther } from '@/utils/formatting';

const { trace } = defineProps<{
  trace: TransactionTrace | null;
}>();

const { nativeCurrency } = useChain();

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

function formatType(value: CallType): string {
  return value === 'create'
    ? 'CREATE'
    : value === 'call'
      ? 'CALL'
      : value === 'delegatecall'
        ? 'D•CALL'
        : 'S•CALL';
}

function getLevel(row: Call): number {
  return row.traceAddress.length;
}

function getFunction(data: Hex): Hex {
  return size(data) > 0 ? slice(data, 0, 4) : '0x';
}

function getData(data: Hex): Hex {
  return size(data) > 4 ? slice(data, 4) : '0x';
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
}

.scroll {
  flex-direction: column;
  width: max-content;
  min-width: 100%;
}

.cell {
  padding: 6px 10px;
  font-weight: var(--font-weight-light);
  line-height: 1;
}

.content {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.icon-marker {
  width: var(--marker-size);
  height: var(--marker-size);
  opacity: 0.6;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
}

.path {
  display: flex;
  gap: var(--spacing-3);
}

.sticky {
  display: flex;
  position: sticky;
  z-index: 1;
  align-items: center;
  justify-content: center;
  background: var(--color-background-primary);
}

.sticky.left {
  left: 0;
}

.sticky.right {
  right: 0;
}

.item {
  --padding: 10px;
  --status-width: 24px;
  --call-width: 80px;
  --marker-size: 15px;
  --level-margin: 20px;

  &:first-child {
    .cell {
      padding: var(--padding) var(--padding) 6px;
    }
  }

  &:last-child {
    .cell {
      padding: 6px var(--padding) var(--padding);
    }
  }

  &:only-child {
    .cell {
      padding: 10px;
    }
  }
}

.item-content {
  display: flex;
  position: relative;
  transition: opacity 0.25s ease;

  &:hover {
    background: var(--color-background-secondary);
    cursor: pointer;

    .sticky {
      background: var(--color-background-secondary);
      cursor: pointer;
    }
  }

  .cell.status {
    padding-right: 0;
  }
}

.grid {
  display: flex;
  position: absolute;
  left: calc(
    var(--status-width) + var(--call-width) + var(--padding) +
      (var(--marker-size) - 1px) / 2 + (var(--index) - 1) * var(--level-margin)
  );
  align-items: center;
  justify-content: center;
  width: 1px;
  height: 100%;
  background: var(--color-border-tertiary);
}

.main {
  display: flex;
  flex-grow: 1;
  margin-left: calc(var(--level) * var(--level-margin));
}

.icon {
  width: 12px;
  height: 12px;
}

.status {
  width: 24px;
}

.call {
  width: 80px;
}

.input {
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-light);
}
</style>
