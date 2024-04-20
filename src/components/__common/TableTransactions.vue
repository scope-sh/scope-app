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
            <LinkBlock
              v-if="cell.column.id === 'blockNumber'"
              :number="cell.getValue() as bigint"
              type="minimal"
            />
            <LinkTransaction
              v-else-if="cell.column.id === 'hash'"
              :hash="cell.getValue() as Hex"
              type="minimal"
            >
              {{ formatHash(cell.getValue() as Hex) }}
            </LinkTransaction>
            <LinkAddress
              v-else-if="cell.column.id === 'from'"
              :address="cell.getValue() as Address"
              type="minimal"
            >
              {{ getAddress(cell.getValue() as Address) }}
            </LinkAddress>
            <LinkAddress
              v-else-if="cell.column.id === 'to' && cell.getValue()"
              :address="cell.getValue() as Address"
              type="minimal"
            >
              {{ getAddress(cell.getValue() as Address) }}
            </LinkAddress>
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
  ColumnDef,
} from '@tanstack/vue-table';
import { Address, Hex, size, slice } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import useLabels from '@/composables/useLabels.js';
import { formatAddress, formatEther, formatGasPrice } from '@/utils/formatting';

import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';

const { getLabelText } = useLabels();

const props = defineProps<{
  transactions: Transaction[];
  page: number;
  perPage: number;
  type: 'address' | 'block';
}>();

const columnHelper = createColumnHelper<Transaction>();

const columns = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Transaction, any>[] = [];
  if (props.type === 'address') {
    columns.push(
      columnHelper.accessor('blockNumber', {
        header: 'block',
        cell: (cell) => cell.getValue(),
      }),
    );
    columns.push(
      columnHelper.accessor('transactionIndex', {
        header: 'pos.',
        cell: (cell) => cell.getValue(),
      }),
    );
  } else if (props.type === 'block') {
    columns.push(
      columnHelper.accessor('blockPosition', {
        header: 'pos.',
        cell: (cell) => cell.getValue(),
      }),
    );
  }
  columns.push(
    ...[
      columnHelper.accessor('hash', {
        header: 'hash',
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
    ],
  );
  return columns;
});

const table = useVueTable({
  get data() {
    return props.transactions;
  },
  columns: columns.value,
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

function getAddress(value: Address): string {
  const labelText = getLabelText(value);
  return labelText ? labelText : formatAddress(value, 16);
}

function formatHash(value: Hex): string {
  const size = 16;
  return `${value.slice(0, 2 + size / 2)}...${value.slice(-size / 2)}`;
}

function formatFunction(value: Hex): string {
  return size(value) === 0 ? '—' : value;
}

function formatData(value: Hex): string {
  if (size(value) === 0) {
    return '—';
  }
  return slice(value, 0, 20) + '…';
}
</script>

<script lang="ts">
interface AddressTransaction {
  blockNumber: number;
  transactionIndex: number;
  hash: Hex;
  from: Address;
  to: Address | null;
  function: Hex;
  data: Hex;
  value: bigint;
  gasPrice: bigint;
}

interface BlockTransaction {
  blockPosition: number | null;
  hash: Hex;
  from: Address;
  to: Address | null;
  function: Hex;
  data: Hex;
  value: bigint;
  gasPrice: bigint;
}

type Transaction = AddressTransaction | BlockTransaction;

export type { AddressTransaction, BlockTransaction, Transaction };
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

td {
  padding: 6px 10px;
  font-weight: var(--font-weight-light);
  line-height: 1;
  white-space: nowrap;
}

tr {
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

  th {
    &:first-child {
      border-radius: calc(var(--border-radius) - 1px) 0 0 0;
    }

    &:last-child {
      border-radius: 0 calc(var(--border-radius) - 1px) 0 0;
    }
  }
}

tbody {
  &:hover tr:not(:hover) {
    opacity: 0.5;
  }
}
</style>
