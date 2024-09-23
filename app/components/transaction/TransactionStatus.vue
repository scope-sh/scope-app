<template>
  <div class="wrapper">
    <div
      class="status"
      :class="{
        success: status === 'success' || status === null,
        error: status === 'reverted',
      }"
    >
      <ScopeIcon
        v-if="status === 'success' || status === null"
        kind="check-circled"
        class="icon"
      />
      <ScopeIcon
        v-else-if="status === 'reverted'"
        kind="cross-circled"
        class="icon"
      />
      <template v-if="traceFrame === null">
        {{
          status === null
            ? 'Executed'
            : status === 'success'
              ? 'Success'
              : 'Reverted'
        }}
      </template>
      <template v-else>
        <template
          v-if="traceFrame.error === null || traceFrame.error === 'Reverted'"
        >
          <div
            v-if="traceFrame.type === 'call'"
            class="address"
          >
            Reverted in
            <LinkAddress
              :address="traceFrame.action.to"
              type="copyable"
            />
          </div>
          <template v-else> Reverted </template>
        </template>
        <div v-else-if="traceFrame.error === 'OOG'">Out of gas</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import type { TransactionStatus, TransactionTraceFrame } from '@/services/evm';

defineProps<{
  status: TransactionStatus | null;
  traceFrame: TransactionTraceFrame | null;
}>();
</script>

<style scoped>
.wrapper {
  display: flex;
}

.status {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-m);
}

.status.success {
  border-color: var(--color-success);
  color: var(--color-success);
}

.status.error {
  border-color: var(--color-error);
  color: var(--color-error);
}

.icon {
  width: 16px;
  height: 16px;
}

.address {
  display: flex;
  gap: var(--spacing-3);
}
</style>
