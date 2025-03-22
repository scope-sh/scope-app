<template>
  <ViewExecution
    v-if="view === 'execution' && execution"
    class="execution"
    :execution
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

import ViewExecution from './ViewExecution.vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  ArgumentTree,
  type Argument,
  getArguments,
} from '@/components/__common/arguments';
import useAbi from '@/composables/useAbi';
import { type Execution, decodeCalldata } from '@/utils/context/erc7821';

const { address, callData } = defineProps<{
  address: Address | null;
  callData: Hex;
  view: CallDataView;
}>();

const { getFunctionAbi } = useAbi();

interface DecodedCallData {
  name: string;
  args: Argument[];
}

const signature = computed<Hex>(() => callData.substring(0, 10) as Hex);

const abi = computed<AbiFunction | null>(() => {
  if (!address) {
    return null;
  }
  return size(signature.value) === 4
    ? getFunctionAbi(address, signature.value)
    : null;
});

const execution = computed<Execution | null>(() => decodeCalldata(callData));

const decoded = computed<DecodedCallData | null>(() => {
  if (!abi.value) return null;

  const decodedCallData = decodeFunctionData({
    abi: [abi.value],
    data: callData,
  });

  const args = getArguments(abi.value.inputs, decodedCallData.args);

  return {
    name: decodedCallData.functionName,
    args,
  };
});
</script>

<script lang="ts">
type CallDataView = 'execution' | 'hex' | 'decoded';

// eslint-disable-next-line import/prefer-default-export
export type { CallDataView };
</script>

<style scoped>
.execution,
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
