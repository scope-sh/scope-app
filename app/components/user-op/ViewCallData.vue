<template>
  <div
    v-if="view === 'calls' && calls"
    class="calls"
  >
    <ArgumentTree :args="calls" />
  </div>
  <div
    v-else-if="view === 'decoded' && decoded"
    class="decoded"
  >
    <div class="name">
      {{ decoded.name }}
      <ButtonCopy
        :value="signature"
        compact
        class="copy"
      />
    </div>
    <ArgumentTree :args="decoded.args" />
  </div>
  <ScopeTextView
    v-else
    size="regular"
    :value="callData"
  />
</template>

<script setup lang="ts">
import {
  type AbiFunction,
  type Address,
  type Hex,
  decodeFunctionData,
  size,
} from 'viem';
import { computed } from 'vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  ArgumentTree,
  type Argument,
  getArguments,
} from '@/components/__common/arguments';
import useAbi from '@/composables/useAbi';
import { decodeCalls } from '@/utils/context/erc4337/entryPoint';

const props = defineProps<{
  address: Address | null;
  callData: Hex;
  view: CallDataView;
}>();

const { getFunctionAbi } = useAbi();

interface DecodedCallData {
  name: string;
  args: Argument[];
}

const signature = computed<Hex>(() => props.callData.substring(0, 10) as Hex);

const abi = computed<AbiFunction | null>(() => {
  if (!props.address) {
    return null;
  }
  return size(signature.value) === 4
    ? getFunctionAbi(props.address, signature.value)
    : null;
});

const calls = computed<Argument[] | null>(() => {
  const calls = decodeCalls(props.callData);
  if (!calls) {
    return null;
  }
  return getArguments(
    [
      {
        type: 'tuple[]',
        components: [
          {
            type: 'address',
            name: 'to',
          },
          {
            type: 'uint256',
            name: 'value',
          },
          {
            type: 'bytes',
            name: 'callData',
          },
        ],
        name: 'calls',
      },
    ],
    [calls],
  );
});

const decoded = computed<DecodedCallData | null>(() => {
  if (!abi.value) return null;

  const decodedCallData = decodeFunctionData({
    abi: [abi.value],
    data: props.callData,
  });

  const args = getArguments(abi.value.inputs, decodedCallData.args);

  return {
    name: decodedCallData.functionName,
    args,
  };
});
</script>

<script lang="ts">
type CallDataView = 'calls' | 'hex' | 'decoded';

// eslint-disable-next-line import/prefer-default-export
export type { CallDataView };
</script>

<style scoped>
.calls,
.decoded {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  max-height: 240px;
  padding: var(--spacing-4);
  overflow-y: auto;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  word-break: break-all;
}

.name {
  display: flex;
  gap: var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-l);

  .copy {
    width: 16px;
    height: 16px;
  }
}
</style>
