<template>
  <div
    class="row"
    @click="handleRootClick"
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
      v-for="index in level"
      :key="index"
      class="grid"
      :style="{ '--index': index }"
    />
    <div class="main">
      <div class="cell content">
        <ScopeIcon
          v-if="isParent"
          class="icon-marker"
          :kind="item.folded ? 'chevron-right' : 'chevron-down'"
          @click.stop="handleIconClick"
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
            <template v-if="decoded">
              {{ decoded.name }}
            </template>
            <template v-else-if="func">
              {{ func }}
              <template v-if="data"> ({{ data }}) </template>
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
</template>

<script setup lang="ts">
import type { AbiFunction } from 'viem';
import { decodeFunctionData, size, slice } from 'viem';
import { computed } from 'vue';

import LinkAddress from './LinkAddress.vue';
import ScopeIcon from './ScopeIcon.vue';
import ScopeTooltip from './ScopeTooltip.vue';
import type { Call, CallType } from './TreeInternalCalls.vue';
import type { Argument } from './arguments';
import { getArguments } from './arguments';

import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import { formatEther } from '@/utils/formatting';

const {
  call: item,
  isParent,
  firstChild,
  lastChild,
} = defineProps<{
  call: Call;
  level: number;
  isParent: boolean;
  firstChild: boolean;
  lastChild: boolean;
}>();

const emit = defineEmits<{
  'toggle-fold': [];
  'toggle-expand': [];
}>();

const { getFunctionAbi } = useAbi();

interface DecodedCallData {
  name?: string;
  args: Argument[];
}

function handleRootClick(): void {
  emit('toggle-expand');
}

function handleIconClick(): void {
  emit('toggle-fold');
}

const { nativeCurrency } = useChain();

const func = computed(() =>
  size(item.input) > 0 ? slice(item.input, 0, 4) : null,
);
const data = computed(() =>
  size(item.input) > 4 ? slice(item.input, 4) : null,
);

const abi = computed<AbiFunction | null>(() => {
  if (!item.to) {
    return null;
  }
  return func.value ? getFunctionAbi(item.to, func.value) : null;
});

const decoded = computed<DecodedCallData | null>(() => {
  if (!abi.value) return null;

  const decodedCallData = decodeFunctionData({
    abi: [abi.value],
    data: item.input,
  });

  const args = getArguments(abi.value.inputs, decodedCallData.args);

  return {
    name: decodedCallData.functionName,
    args,
  };
});

function formatType(value: CallType): string {
  return value === 'create'
    ? 'CREATE'
    : value === 'call'
      ? 'CALL'
      : value === 'delegatecall'
        ? 'D•CALL'
        : 'S•CALL';
}

const padding = computed(() =>
  firstChild && lastChild
    ? '10px'
    : firstChild
      ? 'var(--padding) var(--padding) 6px'
      : lastChild
        ? '6px var(--padding) var(--padding)'
        : '6px 10px',
);
</script>

<style scoped>
.cell {
  padding: v-bind('padding');
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

.row {
  --padding: 10px;
  --status-width: 24px;
  --call-width: 80px;
  --marker-size: 15px;
  --level-margin: 20px;

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
