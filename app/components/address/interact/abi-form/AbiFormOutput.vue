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

import { ArgumentTree, getArguments } from '@/components/__common/arguments';
import { type Output as AbiOutput } from '@/utils/validation/abi';

const props = defineProps<{
  abiOutputs: readonly AbiOutput[];
  value: unknown;
}>();

const args = computed(() => {
  if (props.value === null) {
    return null;
  }
  const values = Array.isArray(props.value) ? props.value : [props.value];
  return getArguments(props.abiOutputs, values);
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
