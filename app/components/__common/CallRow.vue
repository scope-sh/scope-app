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
            {{
              item.success.type === 'OOG'
                ? 'Out of gas'
                : errorDecoded
                  ? formatError(errorDecoded)
                  : 'Reverted'
            }}
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
            <template v-if="callDataDecoded">
              {{ callDataDecoded.name }}
              <template v-if="callDataDecoded.args.length > 0">
                ({{ formatArguments(callDataDecoded.args) }})
              </template>
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
import type { AbiError } from 'abitype';
import type { AbiFunction } from 'viem';
import { decodeErrorResult, decodeFunctionData, size, slice } from 'viem';
import { computed } from 'vue';

import LinkAddress from './LinkAddress.vue';
import ScopeIcon from './ScopeIcon.vue';
import ScopeTooltip from './ScopeTooltip.vue';
import type { Call, CallType } from './TreeInternalCalls.vue';
import type { Argument } from './arguments';
import { getArguments } from './arguments';
import type {
  ArrayArgument,
  BaseArgument,
  TupleArgument,
  TupleArrayArgument,
} from './arguments/common';
import { isPrimitiveType } from './arguments/common';

import useAbi from '@/composables/useAbi';
import useChain from '@/composables/useChain';
import type { DecodedError } from '@/utils/context/errors';
import {
  STANDARD_ERROR,
  STANDARD_ERROR_SIGNATURE,
  formatError,
} from '@/utils/context/errors';
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

const { getFunctionAbi, getErrorAbi } = useAbi();

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

const functionAbi = computed<AbiFunction | null>(() => {
  if (!item.to) {
    return null;
  }
  return func.value ? getFunctionAbi(item.to, func.value) : null;
});

const callDataDecoded = computed<DecodedCallData | null>(() => {
  if (!functionAbi.value) return null;

  const decodedCallData = decodeFunctionData({
    abi: [functionAbi.value],
    data: item.input,
  });

  const args = getArguments(functionAbi.value.inputs, decodedCallData.args);

  return {
    name: decodedCallData.functionName,
    args,
  };
});

const error = computed(() => (item.success === true ? null : item.output));
const errorSignature = computed(() => {
  if (!error.value) {
    return null;
  }
  if (size(error.value) < 4) {
    return null;
  }
  return slice(error.value, 0, 4);
});

const errorAbi = computed<AbiError | null>(() => {
  if (!item.to) {
    return null;
  }
  if (!errorSignature.value) {
    return null;
  }
  if (errorSignature.value === STANDARD_ERROR_SIGNATURE) {
    return STANDARD_ERROR;
  }
  return errorSignature.value
    ? getErrorAbi(item.to, errorSignature.value)
    : null;
});

const errorDecoded = computed<DecodedError | null>(() => {
  if (!errorAbi.value) return null;
  if (!error.value) return null;

  const decodedError = decodeErrorResult({
    abi: [errorAbi.value],
    data: error.value,
  });

  const args = getArguments(errorAbi.value.inputs, decodedError.args);

  return {
    name: decodedError.errorName,
    args,
  };
});

function formatArguments(args: BaseArgument[]): string {
  function formatName(arg: BaseArgument): string {
    if (!arg.name) {
      return '';
    }
    return `${arg.name} = `;
  }
  function formatArgument(arg: BaseArgument): string {
    if (isPrimitiveType(arg.type)) {
      return `${formatName(arg)}${arg.value}`;
    }
    if (arg.type === 'tuple') {
      return `${formatName(arg)}(${formatArguments((arg as TupleArgument).value)})`;
    }
    if (arg.type === 'tuple[]') {
      return `${formatName(arg)}[${(arg as TupleArrayArgument).value.map(formatArguments).join(', ')}]`;
    }
    return `${formatName(arg)}[${(arg as ArrayArgument).value.map((argItem) => argItem.value).join(', ')}]`;
  }

  if (args.length === 0) {
    return '';
  }
  return args.map(formatArgument).join(', ');
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
  gap: var(--spacing-6);
  align-items: center;
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
