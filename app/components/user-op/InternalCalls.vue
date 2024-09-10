<template>
  <div class="root">
    <div
      v-if="creationInternalCallRows.length > 0"
      class="section"
    >
      <div class="label">Creation</div>
      <TreeInternalCalls :calls="creationInternalCallRows" />
    </div>
    <div class="section">
      <div class="label">Validation</div>
      <TreeInternalCalls :calls="validationInternalCallRows" />
    </div>
    <div class="section">
      <div class="label">Execution</div>
      <TreeInternalCalls :calls="executionInternalCallRows" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import TreeInternalCalls from '@/components/__common/TreeInternalCalls.vue';
import type { Call as InternalCallRow } from '@/components/__common/TreeInternalCalls.vue';
import {
  convertTransactionTraceToRows,
  type UserOpTrace,
} from '@/utils/context/traces';

const props = defineProps<{
  trace: UserOpTrace | null;
}>();

const creationInternalCallRows = computed<InternalCallRow[]>(() =>
  props.trace ? convertTransactionTraceToRows(props.trace.creation) : [],
);
const validationInternalCallRows = computed<InternalCallRow[]>(() =>
  props.trace ? convertTransactionTraceToRows(props.trace.validation) : [],
);
const executionInternalCallRows = computed<InternalCallRow[]>(() =>
  props.trace ? convertTransactionTraceToRows(props.trace.execution) : [],
);
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}

.section {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}
</style>
