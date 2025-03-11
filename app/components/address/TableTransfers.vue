<template>
  <div class="table">
    <table>
      <thead>
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            :class="{
              block: header.column.id === 'blockNumber',
              timestamp: header.column.id === 'blockTimestamp',
              hash: header.column.id === 'transactionHash',
              address:
                header.column.id === 'asset' ||
                header.column.id === 'from' ||
                header.column.id === 'to',
              type: header.column.id === 'type',
              value: header.column.id === 'amount' || header.column.id === 'id',
            }"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
        >
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :class="{
              block: cell.column.id === 'blockNumber',
              timestamp: cell.column.id === 'blockTimestamp',
              hash: cell.column.id === 'transactionHash',
              address:
                cell.column.id === 'asset' ||
                cell.column.id === 'from' ||
                cell.column.id === 'to',
              type: cell.column.id === 'type',
              value: cell.column.id === 'amount' || cell.column.id === 'id',
            }"
          >
            <template v-if="cell.column.id === 'success'">
              <ScopeIcon
                :kind="cell.getValue() ? 'check' : 'cross'"
                class="icon"
              />
            </template>
            <ScopeTooltip
              v-else-if="cell.column.id === 'blockTimestamp'"
              delay="medium"
            >
              <template #trigger>
                <div>
                  {{ formatRelativeTime(toRelativeTime(new Date(), new Date(cell.getValue<number>()))) }}
                </div>
              </template>
              <template #default>
                {{ formatTime(new Date(cell.getValue<number>())) }}
              </template>
            </ScopeTooltip>
            <LinkBlock
              v-else-if="cell.column.id === 'blockNumber'"
              :number="toBlockNumber(cell.getValue())"
              type="minimal"
            />
            <LinkTransaction
              v-else-if="cell.column.id === 'transactionHash'"
              :hash="toHash(cell.getValue())"
              type="minimal"
            >
              {{ toHash(cell.getValue()) }}
            </LinkTransaction>
            <LinkAddress
              v-else-if="cell.column.id === 'asset'"
              :address="toAddress(cell.getValue())"
              type="minimal"
            />
            <template v-else-if="cell.column.id === 'from'">
              <LinkAddress
                v-if="cell.getValue() !== address"
                :address="toAddress(cell.getValue())"
                type="minimal"
              />
              <div
                v-else
                class="address-value"
              >
                {{ getAddress(toAddress(cell.getValue())) }}
              </div>
            </template>
            <template v-else-if="cell.column.id === 'to'">
              <LinkAddress
                v-if="cell.getValue() !== address"
                :address="toAddress(cell.getValue())"
                type="minimal"
              />
              <div
                v-else
                class="address-value"
              >
                {{ getAddress(toAddress(cell.getValue())) }}
              </div>
            </template>
            <template v-else-if="cell.column.id === 'type'">
              {{ formatType(toAssetType(cell.getValue())) }}
            </template>
            <FlexRender
              v-else
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  FlexRender,
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table';
import type { Address, Hex } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeTooltip from '@/components/__common/ScopeTooltip.vue';
import useLabels from '@/composables/useLabels.js';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime, formatTime } from '@/utils/formatting';

const { transfers, page, perPage } = defineProps<{
  transfers: Transfer[];
  address: Address;
  page: number;
  perPage: number;
}>();

const { getLabelText } = useLabels();

const columnHelper = createColumnHelper<Transfer>();

const columns = computed(() => [
  columnHelper.accessor('blockTimestamp', {
    header: 'time',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('blockNumber', {
    header: 'block',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('transactionHash', {
    header: 'transaction',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('asset', {
    header: 'asset',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('from', {
    header: 'from',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('to', {
    header: 'to',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('type', {
    header: 'type',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'amount',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('id', {
    header: 'id',
    cell: (cell) => {
      const id = cell.getValue();
      return id ? id : '—';
    },
  }),
]);

const table = useVueTable({
  get data() {
    return transfers;
  },
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
table.setPageSize(perPage);
table.setPageIndex(page);

watch(
  () => perPage,
  () => {
    table.setPageSize(perPage);
  },
);

watch(
  () => page,
  () => {
    table.setPageIndex(page);
  },
);

function getAddress(value: Address): string {
  const labelText = getLabelText(value);
  return labelText ? labelText : value;
}

function toBlockNumber(value: unknown): bigint {
  return value as bigint;
}

function toHash(value: unknown): Hex {
  return value as Hex;
}

function toAddress(value: unknown): Address {
  return value as Address;
}

function toAssetType(value: unknown): AssetType {
  return value as AssetType;
}

function formatType(value: AssetType): string {
  return value === 'erc20'
    ? 'ERC20'
    : value === 'erc721'
      ? 'ERC721'
      : 'ERC1155';
}
</script>

<script lang="ts">
type AssetType = 'erc20' | 'erc721' | 'erc1155';

interface Transfer {
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  asset: Address;
  type: AssetType;
  from: Address;
  to: Address;
  id?: string;
  amount: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { Transfer };
</script>

<style scoped>
.table {
  overflow-x: auto;
}

table {
  --border-radius: var(--border-radius-s);

  width: 100%;
  border-spacing: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius);
}

thead {
  display: flex;
  border-radius: calc(var(--border-radius) - 1px)
    calc(var(--border-radius) - 1px) 0 0;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
}

th,
td {
  overflow: hidden;
  text-align: left;
  cursor: default;
}

th {
  padding: 10px;
  font-weight: var(--font-weight-regular);
}

td {
  padding: 6px 10px;
  font-weight: var(--font-weight-light);
  line-height: 1;
  white-space: nowrap;
}

tr {
  display: flex;
  transition: opacity 0.25s ease;
  opacity: 1;

  &:first-child {
    td {
      padding: 10px 10px 6px;
    }
  }

  &:last-child {
    td {
      padding: 6px 10px 10px;
    }
  }

  &:only-child {
    td {
      padding: 10px;
    }
  }

  th {
    &:first-child {
      border-radius: calc(var(--border-radius) - 1px) 0 0 0;
    }

    &:last-child {
      border-radius: 0 calc(var(--border-radius) - 1px) 0 0;
    }

    &:only-child {
      border-radius: calc(var(--border-radius) - 1px) 0;
    }
  }
}

tbody {
  &:hover tr:not(:hover) {
    opacity: 0.5;
  }
}

.icon {
  width: 12px;
  height: 12px;
}

.type {
  width: 80px;
}

.block {
  width: 100px;
}

.timestamp {
  width: 110px;
}

.hash {
  width: 250px;
}

.address {
  width: 250px;
}

.value {
  width: 100px;
}
</style>
