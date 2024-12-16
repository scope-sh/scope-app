<template>
  <ScopePanelLoading
    v-if="isLoading"
    title="Traces"
  />
  <ScopePanel title="Traces">
    <ScopeLabelEmptyState
      v-if="!hasTraces"
      value="Traces not available"
    />
    <template v-else>
      <ScopeTabs
        v-model="activeTab"
        :options="tabs"
      />
      <template v-if="activeTab === 'calls'">
        <ScopeLabelEmptyState
          v-if="!hasTraces"
          value="No traces found"
        />
        <InternalCalls
          v-else
          :trace="opTrace"
          :revert-phase
        />
      </template>
      <template v-if="activeTab === 'state'">
        <ScopeLabelEmptyState
          v-if="stateDiff === null"
          value="No state diff found"
        />
        <ViewStateDiff
          v-else
          :diff="stateDiff"
        />
      </template>
    </template>
  </ScopePanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import InternalCalls from './InternalCalls.vue';

import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import ViewStateDiff from '@/components/__common/ViewStateDiff.vue';
import type { TransactionStateDiff } from '@/services/evm';
import type { Phase } from '@/utils/context/erc4337/entryPoint';
import type { OpTrace } from '@/utils/context/traces';

const { opTrace } = defineProps<{
  isLoading: boolean;
  opTrace: OpTrace | null;
  stateDiff: TransactionStateDiff | null;
  revertPhase?: Phase;
}>();

const activeTab = ref<string>('calls');
const tabs = [
  {
    label: 'Calls',
    value: 'calls',
  },
  {
    label: 'State',
    value: 'state',
  },
];

const hasTraces = computed(() => {
  if (opTrace === null) {
    return false;
  }
  return (
    opTrace.creation.length > 0 ||
    opTrace.validation.length > 0 ||
    opTrace.payment.length > 0 ||
    opTrace.execution.length > 0
  );
});
</script>
