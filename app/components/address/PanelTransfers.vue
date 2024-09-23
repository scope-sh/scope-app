<template>
  <ScopePanel
    title="Transfers"
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
    <ScopeLabelEmptyState
      v-if="!rows.length"
      value="No transfers found"
    />
    <template v-else>
      <div class="label-unsupported">ETH transfers not supported yet</div>
      <TableTransfers
        :address="address"
        :transfers="rows"
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
  </ScopePanel>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { zeroAddress, zeroHash } from 'viem';
import { computed } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
import TableTransfers from '@/components/address/TableTransfers.vue';
import type { Transfer as TransferRow } from '@/components/address/TableTransfers.vue';
import type { Transfer as AddressTransfer } from '@/services/hypersync';

const page = defineModel<number>('page', {
  required: true,
});

const perPage = defineModel<number>('perPage', {
  required: true,
});

const { isLoading, items } = defineProps<{
  address: Address;
  isLoading: boolean;
  items: AddressTransfer[];
  maxPage: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const rows = computed<TransferRow[]>(() => {
  return isLoading
    ? new Array<TransferRow>(page.value * perPage.value).fill({
        blockNumber: 0,
        blockTimestamp: 0,
        transactionHash: zeroHash,
        asset: zeroAddress,
        from: zeroAddress,
        to: zeroAddress,
        type: 'erc20',
        amount: '0',
      })
    : items.map((transfer) => {
        return transfer.type === 'erc20'
          ? {
              blockNumber: transfer.blockNumber,
              blockTimestamp: transfer.blockTimestamp,
              transactionHash: transfer.transactionHash,
              asset: transfer.asset,
              from: transfer.from,
              type: transfer.type,
              to: transfer.to,
              amount: transfer.amount,
            }
          : transfer.type === 'erc721'
            ? {
                blockNumber: transfer.blockNumber,
                blockTimestamp: transfer.blockTimestamp,
                transactionHash: transfer.transactionHash,
                asset: transfer.asset,
                from: transfer.from,
                to: transfer.to,
                type: transfer.type,
                amount: transfer.amount,
                id: transfer.id,
              }
            : {
                blockNumber: transfer.blockNumber,
                blockTimestamp: transfer.blockTimestamp,
                transactionHash: transfer.transactionHash,
                asset: transfer.asset,
                from: transfer.from,
                to: transfer.to,
                type: transfer.type,
                amount: transfer.amounts.join(','),
                id: transfer.ids.join(','),
              };
      });
});

function refresh(): void {
  emit('refresh');
}
</script>

<style scoped>
.label-unsupported {
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  font-style: italic;
}

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
