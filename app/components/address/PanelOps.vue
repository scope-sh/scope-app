<template>
  <ScopePanel
    title="UserOps"
    :loading="isLoading"
  >
    <template #header>
      <div class="panel-header">
        <ScopePaginator
          v-if="rows.length"
          v-model="page"
          :total="maxPage"
          :disabled="isLoading"
        />
        <ScopeIcon
          class="icon-refresh"
          kind="reload"
          @click="refresh"
        />
      </div>
    </template>
    <template #default>
      <ScopeLabelEmptyState
        v-if="!rows.length"
        value="No ops found"
      />
      <template v-else>
        <TableOps
          :ops="rows"
          :per-page="perPage"
          :page="page - 1"
        />
        <div class="panel-footer">
          <SelectPerPage v-model="perPage" />
          <div class="footer-side">
            <ScopePaginator
              v-if="rows.length"
              v-model="page"
              :total="maxPage"
              :disabled="isLoading"
            />
            <ScopeIcon
              class="icon-refresh"
              kind="reload"
              @click="refresh"
            />
          </div>
        </div>
      </template>
    </template>
  </ScopePanel>
</template>

<script setup lang="ts">
import { zeroAddress, zeroHash } from 'viem';
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
import TableOps from '@/components/address/TableOps.vue';
import type { Op as OpRow } from '@/components/address/TableOps.vue';
import type { Op } from '@/services/indexer';

const page = defineModel<number>('page', {
  required: true,
});

const perPage = defineModel<number>('perPage', {
  required: true,
});

const { isLoading, items } = defineProps<{
  isLoading: boolean;
  items: Op[];
  maxPage: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const rows = computed<OpRow[]>(() => {
  return isLoading
    ? new Array<OpRow>(page.value * perPage.value).fill({
        success: false,
        entryPoint: zeroAddress,
        nonce: 0n,
        blockNumber: 0,
        blockTimestamp: 0,
        transactionHash: zeroHash,
        hash: zeroHash,
        bundler: zeroAddress,
        paymaster: zeroAddress,
      })
    : items.map((op) => {
        return {
          success: op.success,
          entryPoint: op.entryPoint,
          nonce: op.nonce,
          blockNumber: op.blockNumber,
          blockTimestamp: 1000 * op.blockTimestamp,
          transactionHash: op.transactionHash,
          hash: op.hash,
          bundler: op.bundler,
          paymaster: op.paymaster,
        };
      });
});

function refresh(): void {
  emit('refresh');
}
</script>

<style scoped>
.panel-header {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
}

.footer-side {
  display: flex;
  gap: var(--spacing-6);
  align-items: center;
}

.icon-refresh {
  width: 14px;
  height: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--color-text-primary);
  }
}
</style>
