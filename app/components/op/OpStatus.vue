<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{ success: success, error: !success }"
    >
      <ScopeIcon
        v-if="success"
        kind="check-circled"
        class="icon"
      />
      <ScopeIcon
        v-else
        kind="cross-circled"
        class="icon"
      />
      <template v-if="frame === null">
        {{ success ? 'Success' : 'Failed' }}
      </template>
      <template v-else>
        <template v-if="frame.error === null || frame.error === 'Reverted'">
          <div
            v-if="frame.type === 'call'"
            class="address"
          >
            Failed in
            <div class="source">
              <LinkAddress
                :address="frame.action.to"
                type="minimal"
              />
              <template v-if="decoded">: {{ formatError(decoded) }}</template>
            </div>
          </div>
          <template v-else> Failed </template>
        </template>
        <div v-else-if="frame.error === 'OOG'">Out of gas</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AbiError } from 'abitype';
import { decodeErrorResult, size, slice } from 'viem';
import { computed } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import { getArguments } from '@/components/__common/arguments';
import useAbi from '@/composables/useAbi';
import type { TransactionTraceFrame } from '@/services/evm';
import type { DecodedError } from '@/utils/context/errors';
import { formatError } from '@/utils/context/errors';

const { traceFrame: frame } = defineProps<{
  success: boolean;
  traceFrame: TransactionTraceFrame | null;
}>();

const { getErrorAbi } = useAbi();

const address = computed(() =>
  frame ? (frame.type === 'call' ? frame.action.to : null) : null,
);
const data = computed(() =>
  frame ? (frame.type === 'call' ? frame.result.output : null) : null,
);

const signature = computed(() => {
  if (!data.value) {
    return null;
  }
  if (size(data.value) < 4) {
    return null;
  }
  return slice(data.value, 0, 4);
});

const abi = computed<AbiError | null>(() => {
  if (!address.value) {
    return null;
  }
  return signature.value ? getErrorAbi(address.value, signature.value) : null;
});

const decoded = computed<DecodedError | null>(() => {
  if (!abi.value) return null;
  if (!data.value) return null;

  const decodedError = decodeErrorResult({
    abi: [abi.value],
    data: data.value,
  });

  const args = getArguments(abi.value.inputs, decodedError.args);

  return {
    name: decodedError.errorName,
    args,
  };
});
</script>

<style scoped>
.wrapper {
  display: flex;
}

.status {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-m);
}

.status.success {
  border-color: rgb(from var(--color-success) r g b / 60%);
  background: rgb(from var(--color-success) r g b / 10%);
  color: var(--color-success);
}

.status.error {
  border-color: rgb(from var(--color-error) r g b / 60%);
  background: rgb(from var(--color-error) r g b / 10%);
  color: var(--color-error);
}

.icon {
  width: 16px;
  height: 16px;
}

.address {
  display: flex;
  gap: var(--spacing-3);
}

.source {
  display: flex;
}
</style>
