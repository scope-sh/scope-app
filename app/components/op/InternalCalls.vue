<template>
  <div
    v-if="trace"
    class="root"
  >
    <div
      v-if="trace.creation.length > 0"
      class="section"
    >
      <div class="label">Creation</div>
      <TreeInternalCalls :trace="trace.creation" />
    </div>
    <div class="section">
      <div class="label">Validation</div>
      <TreeInternalCalls :trace="trace.validation" />
    </div>
    <div class="section">
      <div class="label">Execution</div>
      <TreeInternalCalls :trace="trace.execution" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TreeInternalCalls from '@/components/__common/TreeInternalCalls.vue';
import type { OpTrace } from '@/utils/context/traces';

defineProps<{
  trace: OpTrace | null;
}>();
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
