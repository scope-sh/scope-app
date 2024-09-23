<template>
  <div
    v-if="args !== null"
    class="output"
  >
    <ArgumentTree
      type="output"
      :args="args"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import {
  ArgumentTree,
  getArguments,
  type Values,
} from '@/components/__common/arguments';
import type { Output as AbiOutput } from '@/utils/validation/abi';

const { abiOutputs, value } = defineProps<{
  abiOutputs: readonly AbiOutput[];
  value: unknown;
}>();

const args = computed(() => {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return null;
  }
  const values = abiOutputs.length > 1 ? value : [value];
  return getArguments(abiOutputs, values as Values);
});
</script>

<style scoped>
.output {
  width: 100%;
  max-height: 240px;
  padding: var(--spacing-4);
  overflow: auto;
  background: var(--color-background-secondary);
}
</style>
