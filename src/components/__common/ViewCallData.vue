<template>
  <div
    v-if="view === 'decoded' && decoded"
    class="decoded"
  >
    <div class="name">{{ decoded.name }}</div>
    <div class="properties">
      <PropertyTree
        :tree="decoded.properties"
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

import PropertyTree, { Properties } from './PropertyTree.vue';
import ScopeTextView from './ScopeTextView.vue';

const props = defineProps<{
  address: Address | null;
  callData: Hex;
  view: CallDataView;
}>();

const { getFunctionAbi } = useAbi();

interface DecodedCallData {
  name: string;
  properties: Properties;
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

  console.log(decodedCallData);

  return {
    name: decodedCallData.functionName,
    properties: decodedCallData.args[0] as Properties,
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
