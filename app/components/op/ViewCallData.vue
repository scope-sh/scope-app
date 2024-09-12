<template>
  <ViewCalls
    v-if="view === 'calls' && calls"
    class="calls"
    :calls
  />
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

import ViewCalls from './ViewCalls.vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  ArgumentTree,
  type Argument,
  getArguments,
} from '@/components/__common/arguments';
import useAbi from '@/composables/useAbi';
import useLabels from '@/composables/useLabels';
import type { LabelTypeId } from '@/services/api';
import { decode as decodeCalls } from '@/utils/context/erc4337/callData';
import type { Call } from '@/utils/context/erc4337/callData';

const props = defineProps<{
  address: Address | null;
  callData: Hex;
  view: CallDataView;
}>();

const { getFunctionAbi } = useAbi();
const { getLabel } = useLabels();

interface DecodedCallData {
  name: string;
  args: Argument[];
}

const labelType = computed<LabelTypeId | null>(() => {
  if (!props.address) {
    return null;
  }
  const label = getLabel(props.address);
  if (!label) {
    return null;
  }
  if (!label.type) {
    return null;
  }
  return label.type.id;
});
const signature = computed<Hex>(() => props.callData.substring(0, 10) as Hex);

const abi = computed<AbiFunction | null>(() => {
  if (!props.address) {
    return null;
  }
  return size(signature.value) === 4
    ? getFunctionAbi(props.address, signature.value)
    : null;
});

const calls = computed<Call[] | null>(() =>
  decodeCalls(labelType.value, props.callData),
);

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
