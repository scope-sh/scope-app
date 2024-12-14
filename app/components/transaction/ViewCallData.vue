<template>
  <div
    v-if="view === 'decoded' && decoded"
    class="decoded"
  >
    <div
      v-if="decoded.name"
      class="name"
    >
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
    :value="output === undefined ? callData : output"
  />
</template>

<script setup lang="ts">
import {
  type AbiFunction,
  type Address,
  type Hex,
  decodeAbiParameters,
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

const {
  address,
  callData,
  output = undefined,
} = defineProps<{
  address: Address | null;
  callData: Hex;
  view: CallDataView;
  output?: Hex;
}>();

const { getFunctionAbi } = useAbi();

interface DecodedCallData {
  name?: string;
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

const decoded = computed<DecodedCallData | null>(() => {
  if (!abi.value) return null;
  if (output && abi.value.outputs.length === 0) return null;

  const decodedCallData =
    output === undefined
      ? decodeFunctionData({
          abi: [abi.value],
          data: callData,
        })
      : {
          functionName: undefined,
          args: decodeAbiParameters(abi.value.outputs, output),
        };

  const args = getArguments(
    output === undefined ? abi.value.inputs : abi.value.outputs,
    decodedCallData.args,
  );

  return {
    name: decodedCallData.functionName,
    args,
  };
});
</script>

<script lang="ts">
type CallDataView = 'hex' | 'decoded';

// eslint-disable-next-line import/prefer-default-export
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
