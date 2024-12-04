<template>
  <ScopePanel
    title="Transactions"
    :loading="isLoading"
  >
    <template #header>
      <div class="panel-header">
        <ScopePaginator
          v-if="transactionRows.length"
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
    <ScopeLabelEmptyState
      v-if="!transactionRows.length"
      value="No transactions found"
    />
    <template v-else>
      <TableTransactions
        :address="address"
        :transactions="transactionRows"
        :per-page="perPage"
        :page="page - 1"
        type="address"
      />
      <div class="panel-footer">
        <SelectPerPage v-model="perPage" />
        <div class="footer-side">
          <ScopePaginator
            v-if="transactionRows.length"
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
  </ScopePanel>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { slice, zeroAddress, zeroHash } from 'viem';
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
import TableTransactions from '@/components/__common/TableTransactions.vue';
import type { Transaction as TransactionRow } from '@/components/__common/TableTransactions.vue';
import type { Transaction as AddressTransaction } from '@/services/hypersync';

const page = defineModel<number>('page', {
  required: true,
});

const perPage = defineModel<number>('perPage', {
  required: true,
});

const { isLoading, items } = defineProps<{
  address: Address;
  isLoading: boolean;
  items: AddressTransaction[];
  maxPage: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const transactionRows = computed<TransactionRow[]>(() => {
  return isLoading
    ? new Array<TransactionRow>(page.value * perPage.value).fill({
        success: false,
        blockNumber: 0,
        blockTimestamp: 0,
        transactionIndex: 0,
        hash: zeroHash,
        from: zeroAddress,
        to: zeroAddress,
        function: '0x',
        value: 0n,
        gasPrice: 0n,
      })
    : items.map((transaction) => {
        return {
          success: transaction.status > 0,
          blockNumber: transaction.blockNumber,
          blockTimestamp: transaction.blockTimestamp,
          transactionIndex: transaction.transactionIndex,
          hash: transaction.hash,
          from: transaction.from,
          to: transaction.to || null,
          function:
            transaction.to && transaction.input.length >= 10
              ? slice(transaction.input, 0, 4)
              : '0x',
          data: transaction.to
            ? transaction.input.length > 10
              ? slice(transaction.input, 4)
              : '0x'
            : transaction.input,
          value: transaction.value,
          gasPrice: transaction.gasPrice,
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
