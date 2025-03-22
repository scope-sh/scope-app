<template>
  <div>
    <div class="header">
      {{ headerLabel }}
    </div>
    <ArgumentTree :args="callArgs" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { BaseArgument, Argument } from '@/components/__common/arguments';
import ArgumentTree from '@/components/__common/arguments/ArgumentTree.vue';
import type {
  Call,
  CallType,
  Execution,
  ExecutionType,
} from '@/utils/context/erc7821';

const { execution } = defineProps<{
  execution: Execution;
}>();

const headerLabel = computed(() => {
  function getCallTypeLabel(callType: CallType): string {
    switch (callType) {
      case 'single':
        return 'call';
      case 'batch':
        return 'batch';
      case 'static':
        return 'static call';
      case 'delegate':
        return 'delegate call';
    }
  }

  function getExecutionTypeLabel(executionType: ExecutionType): string {
    switch (executionType) {
      case 'revert':
        return '(revertable)';
      case 'no_revert':
        return '';
    }
  }

  const callTypeLabel = getCallTypeLabel(execution.callType);
  const executionTypeLabel = getExecutionTypeLabel(execution.executionType);

  return `${callTypeLabel} ${executionTypeLabel}`;
});

const callArgs = computed<Argument[]>(() => {
  function getCallArgs(call: Call): BaseArgument[] {
    return [
      {
        type: 'address',
        name: 'target',
        value: call.target,
      },
      {
        type: 'uint256',
        name: 'value',
        value: call.value,
      },
      {
        type: 'bytes',
        name: 'data',
        value: call.data,
      },
    ];
  }

  switch (execution.callType) {
    case 'single':
      return getCallArgs(execution.call);
    case 'batch': {
      switch (execution.mode) {
        case 'simple':
          return [
            {
              type: 'tuple[]',
              internalType: 'Call[]',
              name: 'calls',
              value: execution.calls.map(getCallArgs),
            },
          ];
        case 'op_data':
          return [
            {
              type: 'tuple[]',
              internalType: 'Call[]',
              name: 'calls',
              value: execution.calls.map(getCallArgs),
            },
            {
              type: 'bytes',
              name: 'opData',
              value: execution.opData,
            },
          ];
        case 'multi_batch':
          return [
            {
              type: 'tuple[]',
              internalType: 'batches',
              value: execution.batches.map((batch) => [
                {
                  type: 'tuple[]',
                  internalType: 'Call[]',
                  name: 'calls',
                  value: batch.calls.map(getCallArgs),
                },
                {
                  type: 'bytes',
                  name: 'opData',
                  value: batch.opData,
                },
              ]),
            },
          ];
      }
      break;
    }
    case 'static':
      return [
        {
          type: 'bytes',
          name: 'data',
          value: execution.data,
        },
      ];
    case 'delegate':
      return getCallArgs(execution.call);
  }
  return [];
});
</script>

<style scoped>
.header {
  display: flex;
  gap: var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-l);
}
</style>
