<template>
  <ScopePanelLoading
    v-if="isLoading"
    title="Traces"
  />
  <ScopePanel title="Traces">
    <ScopeLabelEmptyState
      v-if="transactionReplay === null"
      value="Traces not available"
    />
    <template v-else>
      <ScopeTabs
        v-model="activeTab"
        :options="tabs"
      />
      <template v-if="activeTab === 'calls'">
        <ScopeLabelEmptyState
          v-if="transactionReplay.trace.length === 0"
          value="No traces found"
        />
        <TreeInternalCalls
          v-else
          :trace="transactionReplay.trace"
        />
      </template>
      <template v-if="activeTab === 'state'">
        <ScopeLabelEmptyState
          v-if="Object.keys(transactionReplay.stateDiff).length === 0"
          value="No state diff found"
        />
        <ViewStateDiff
          v-else
          :diff="transactionReplay.stateDiff"
        />
      </template>
    </template>
  </ScopePanel>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import TreeInternalCalls from '@/components/__common/TreeInternalCalls.vue';
import ViewStateDiff from '@/components/__common/ViewStateDiff.vue';
import type { TransactionReplay } from '@/services/evm';

defineProps<{
  isLoading: boolean;
  transactionReplay: TransactionReplay | null;
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
</script>
