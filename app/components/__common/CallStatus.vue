<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{
        success: status === true,
        error: status !== true,
      }"
    >
      <ScopeIcon
        v-if="status === true"
        kind="check-circled"
        class="icon"
      />
      <ScopeIcon
        v-else
        kind="cross-circled"
        class="icon"
      />
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AbiError } from 'abitype';
import { decodeErrorResult, size, slice, type Address, type Hex } from 'viem';
import { computed } from 'vue';

import { getArguments } from './arguments';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { CallStatus } from '@/components/__common/TreeInternalCalls.vue';
import useAbi from '@/composables/useAbi';
import type { DecodedError } from '@/utils/context/errors';
import { formatError } from '@/utils/context/errors';

const { address, status, data } = defineProps<{
  address: Address | null;
  status: CallStatus;
  data: Hex | null;
}>();

const { getErrorAbi } = useAbi();

const label = computed(() => {
  if (decoded.value) {
    return formatError(decoded.value);
  }
  if (status === true) {
    return 'Success';
  } else if (status.type === 'Revert') {
    return 'Reverted';
  } else if (status.type === 'OOG') {
    return 'Out of gas';
  } else {
    return 'Unknown error';
  }
});

const signature = computed(() => {
  if (!data) {
    return null;
  }
  if (size(data) < 4) {
    return null;
  }
  return slice(data, 0, 4);
});

const abi = computed<AbiError | null>(() => {
  if (!address) {
    return null;
  }
  return signature.value ? getErrorAbi(address, signature.value) : null;
});

const decoded = computed<DecodedError | null>(() => {
  if (!abi.value) return null;
  if (!data) return null;

  const decodedError = decodeErrorResult({
    abi: [abi.value],
    data,
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
  gap: var(--spacing-2);
  align-items: center;
  padding: var(--spacing-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-s);
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
  width: 14px;
  height: 14px;
}

.address {
  display: flex;
  gap: var(--spacing-3);
}
</style>
