<template>
  <div
    v-if="trace"
    class="root"
  >
    <div
      v-if="trace.creation.length > 0"
      class="section"
    >
      <div
        class="label"
        :class="{ error: revertPhase === 'creation' }"
      >
        Creation
      </div>
      <TreeInternalCalls
        :trace="trace.creation"
        :has-error="revertPhase === 'creation'"
      />
    </div>
    <div
      v-if="trace.validation.length > 0"
      class="section"
    >
      <div
        class="label"
        :class="{ error: revertPhase === 'validation' }"
      >
        Validation
      </div>
      <TreeInternalCalls
        :trace="trace.validation"
        :has-error="revertPhase === 'validation'"
      />
    </div>
    <div
      v-if="trace.payment.length > 0"
      class="section"
    >
      <div
        class="label"
        :class="{ error: revertPhase === 'payment' }"
      >
        Payment
      </div>
      <TreeInternalCalls
        :trace="trace.payment"
        :has-error="revertPhase === 'payment'"
      />
    </div>
    <div
      v-if="trace.execution.length > 0"
      class="section"
    >
      <div
        class="label"
        :class="{ error: revertPhase === 'execution' }"
      >
        Execution
      </div>
      <TreeInternalCalls
        :trace="trace.execution"
        :has-error="revertPhase === 'execution'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TreeInternalCalls from '@/components/__common/TreeInternalCalls.vue';
import type { Phase } from '@/utils/context/erc4337/entryPoint';
import type { OpTrace } from '@/utils/context/traces';

defineProps<{
  trace: OpTrace | null;
  revertPhase?: Phase;
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

  &.error {
    color: var(--color-error);
  }
}
</style>
