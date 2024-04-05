<template>
  <div class="p-2">
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
          >
            <FlexRender
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
import { Address, Hex, size, slice } from 'viem';
import { watch } from 'vue';

import { toRelativeTime } from '@/utils/conversion';
import {
  formatAddress,
  formatEther,
  formatGasPrice,
  formatRelativeTime,
} from '@/utils/formatting';

const props = defineProps<{
  transactions: Transaction[];
  page: number;
  perPage: number;
}>();

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor('index', {
    header: 'index',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('timestamp', {
    header: 'date',
    cell: (cell) => formatTimestamp(cell.getValue()),
  }),
  columnHelper.accessor('block', {
    header: 'block',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('blockPosition', {
    header: 'pos.',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('from', {
    header: 'from',
    cell: (cell) => formatAddress(cell.getValue(), 12),
  }),
  columnHelper.accessor('to', {
    header: 'to',
    cell: (cell) => formatAddress(cell.getValue(), 12),
  }),
  columnHelper.accessor('function', {
    header: 'function',
    cell: (cell) => formatFunction(cell.getValue()),
  }),
  columnHelper.accessor('data', {
    header: 'data',
    cell: (cell) => formatData(cell.getValue()),
  }),
  columnHelper.accessor('value', {
    header: 'value',
    cell: (cell) => formatEther(cell.getValue()),
  }),
  columnHelper.accessor('gasPrice', {
    header: 'gas price',
    cell: (cell) => formatGasPrice(cell.getValue()),
  }),
];

const table = useVueTable({
  get data() {
    return props.transactions;
  },
  columns: columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
table.setPageSize(props.perPage);
table.setPageIndex(props.page);

watch(
  () => props.perPage,
  () => {
    table.setPageSize(props.perPage);
  },
);

watch(
  () => props.page,
  () => {
    table.setPageIndex(props.page);
  },
);

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  return formatRelativeTime(toRelativeTime(now, date));
}

function formatFunction(value: Hex): string {
  return size(value) === 0 ? '—' : value;
}

function formatData(value: Hex): string {
  if (size(value) === 0) {
    return '—';
  }
  return slice(value, 0, 8) + '…';
}
</script>

<script lang="ts">
interface Transaction {
  index: number;
  timestamp: number;
  block: bigint;
  blockPosition: number | null;
  from: Address;
  to: Address;
  function: Hex;
  data: Hex;
  value: bigint;
  gasPrice: bigint;
}

export type { Transaction };
</script>

<style scoped>
table {
  --border-radius: var(--border-radius-s);

  width: 100%;
  border-spacing: 0;
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius);
}

thead {
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
}

th,
td {
  text-align: left;
  cursor: default;
}

th {
  padding: 10px;
  font-weight: var(--font-weight-regular);
}

tr {
  th {
    &:first-child {
      border-radius: calc(var(--border-radius) - 1px) 0 0 0;
    }

    &:last-child {
      border-radius: 0 calc(var(--border-radius) - 1px) 0 0;
    }
  }
}

td {
  padding: 6px 10px;
  font-weight: var(--font-weight-light);
  line-height: 1;
}

tbody {
  tr {
    transition: opacity 0.25s ease;
    opacity: 1;
  }

  &:hover tr:not(:hover) {
    opacity: 0.5;
  }
}
</style>
