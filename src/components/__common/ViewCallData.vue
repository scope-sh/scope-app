<template>
  <div
    v-if="view === 'decoded' && decoded"
    class="decoded"
  >
    <div class="name">{{ decoded.name }}</div>
    <div class="properties">
      <ArgumentTree
        :args="decoded.args"
        initial
      />
    </div>
  </div>
  <ScopeTextView
    v-else
    size="regular"
    :value="callData"
  />
</template>

<script setup lang="ts">
import { AbiFunction, Address, Hex, decodeFunctionData, size } from 'viem';
import { computed } from 'vue';

import useAbi from '@/composables/useAbi';

import ScopeTextView from './ScopeTextView.vue';
import { ArgumentTree, Argument, getArguments } from './arguments';

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

const abi = computed<AbiFunction | null>(() => {
  if (!props.address) {
    return null;
  }
  const signature = props.callData.substring(0, 10) as Hex;
  return size(signature) === 4
    ? getFunctionAbi(props.address, signature)
    : null;
});

const decoded = computed<DecodedCallData | null>(() => {
  if (!abi.value) return null;

  const decodedCallData = decodeFunctionData({
    abi: [abi.value],
    data: props.callData,
  });

  const args = getArguments(abi.value.inputs, decodedCallData.args);

  console.log(args);

  return {
    name: decodedCallData.functionName,
    args,
  };
});
</script>

<script lang="ts">
type CallDataView = 'hex' | 'decoded';

export type { CallDataView };
</script>

<style scoped>
.decoded {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  max-height: 160px;
  padding: var(--spacing-4);
  overflow-y: auto;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  font-family: var(--font-mono);
  word-break: break-all;
}

.name {
  font-size: var(--font-size-l);
}

.properties {
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
}
</style>
