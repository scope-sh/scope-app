<template>
  <ScopePanelLoading
    v-if="isLoading"
    title="Traces"
  />
  <ScopePanel title="Traces">
    <ScopeLabelEmptyState
      v-if="opTrace === null"
      value="Traces not available"
    />
    <template v-else>
      <ScopeTabs
        v-model="activeTab"
        :options="tabs"
      />
      <template v-if="activeTab === 'calls'">
        <ScopeLabelEmptyState
          v-if="opTrace === null"
          value="No traces found"
        />
        <InternalCalls
          v-else
          :trace="opTrace"
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
import { ref } from 'vue';

import InternalCalls from './InternalCalls.vue';

import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import ScopeTabs from '@/components/__common/ScopeTabs.vue';
import ViewStateDiff from '@/components/__common/ViewStateDiff.vue';
import type { TransactionStateDiff } from '@/services/evm';
import type { OpTrace } from '@/utils/context/traces';

defineProps<{
  isLoading: boolean;
  opTrace: OpTrace | null;
  stateDiff: TransactionStateDiff | null;
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
