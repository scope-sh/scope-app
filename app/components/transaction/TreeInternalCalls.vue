<template>
  <div class="tree">
    <div class="scroll">
      <div
        v-for="item in calls"
        :key="item.traceAddress.join('-')"
        class="item"
        :style="{ '--level': getLevel(item) }"
      >
        <div class="sticky left">
          <div class="cell tiny">
            <ScopeIcon
              :kind="item.success === true ? 'check' : 'cross'"
              class="icon"
            />
          </div>
          <div class="cell call">{{ formatType(item.type) }}</div>
        </div>
        <div class="main">
          <div class="cell content">
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
            {{ formatEther(item.value, nativeCurrency) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Address, type Hex, size, slice } from 'viem';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useChain from '@/composables/useChain';
import { formatEther } from '@/utils/formatting';

const { nativeCurrency } = useChain();

defineProps<{
  calls: Call[];
}>();

function formatType(
  value: 'call' | 'delegatecall' | 'staticcall' | 'create',
): string {
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
</script>

<script lang="ts">
interface Call {
  success:
    | true
    | {
        type: 'OOG';
      }
    | {
        type: 'Revert';
        reason: string;
      };
  type: 'call' | 'delegatecall' | 'staticcall' | 'create';
  from: Address;
  to: Address | null;
  input: Hex;
  value: bigint;
  gas: {
    used: bigint;
    limit: bigint;
  };
  traceAddress: number[];
}

function getFunction(data: Hex): Hex {
  return size(data) > 0 ? slice(data, 0, 4) : '0x';
}

function getData(data: Hex): Hex {
  return size(data) > 4 ? slice(data, 4) : '0x';
}

// eslint-disable-next-line import/prefer-default-export
export type { Call };
</script>

<style scoped>
.tree {
  --border-radius: var(--border-radius-s);

  width: 100%;
  padding-bottom: var(--spacing-4);
  overflow: auto hidden;
  border-spacing: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius);
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
  cursor: default;
}

.content {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.path {
  display: flex;
  gap: var(--spacing-3);
}

.item {
  display: flex;
  transition: opacity 0.25s ease;
  opacity: 1;

  &:first-child {
    .cell {
      padding: 10px 10px 6px;
    }
  }

  &:last-child {
    .cell {
      padding: 6px 10px 10px;
    }
  }
}

.tree:hover {
  .item:not(:hover) {
    opacity: 0.5;
  }
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

.main {
  --level-margin: 20px;

  display: flex;
  flex-grow: 1;
  margin-left: calc(var(--level) * var(--level-margin));
}

.icon {
  width: 12px;
  height: 12px;
}

.tiny {
  width: 40px;
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

.value {
  width: 100px;
  text-align: end;
}
</style>
