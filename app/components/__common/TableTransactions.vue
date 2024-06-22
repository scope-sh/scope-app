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
              tiny:
                header.column.id === 'success' ||
                header.column.id === 'blockPosition' ||
                header.column.id === 'transactionIndex',
              block: header.column.id === 'blockNumber',
              timestamp: header.column.id === 'blockTimestamp',
              hash: header.column.id === 'hash',
              address: header.column.id === 'from' || header.column.id === 'to',
              func: header.column.id === 'function',
              data: header.column.id === 'data',
              value:
                header.column.id === 'value' || header.column.id === 'gasPrice',
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
              tiny:
                cell.column.id === 'success' ||
                cell.column.id === 'blockPosition' ||
                cell.column.id === 'transactionIndex',
              block: cell.column.id === 'blockNumber',
              timestamp: cell.column.id === 'blockTimestamp',
              hash: cell.column.id === 'hash',
              address: cell.column.id === 'from' || cell.column.id === 'to',
              func: cell.column.id === 'function',
              data: cell.column.id === 'data',
              value:
                cell.column.id === 'value' || cell.column.id === 'gasPrice',
            }"
          >
            <template v-if="cell.column.id === 'success'">
              <ScopeIcon
                v-if="cell.getValue() !== undefined"
                :kind="cell.getValue() ? 'check' : 'cross'"
                class="icon"
              />
            </template>
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
              {{ cell.getValue() as Hex }}
            </LinkTransaction>
            <template v-else-if="cell.column.id === 'from'">
              <LinkAddress
                v-if="cell.getValue() !== address"
                :address="cell.getValue() as Address"
                type="minimal"
              />
              <span v-else>
                {{ getAddress(cell.getValue() as Address) }}
              </span>
            </template>
            <template v-else-if="cell.column.id === 'to'">
              <template v-if="cell.getValue()">
                <LinkAddress
                  v-if="cell.getValue() !== address"
                  :address="cell.getValue() as Address"
                  type="minimal"
                />
                <span v-else>
                  {{ getAddress(cell.getValue() as Address) }}
                </span>
              </template>
              <span v-else>—</span>
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
  type ColumnDef,
  FlexRender,
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table';
import { type Address, type Hex, size } from 'viem';
import { computed, watch } from 'vue';

import LinkBlock from './LinkBlock.vue';
import LinkTransaction from './LinkTransaction.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useLabels from '@/composables/useLabels.js';
import { toRelativeTime } from '@/utils/conversion';
import {
  formatEther,
  formatGasPrice,
  formatRelativeTime,
} from '@/utils/formatting';

const { getLabelText } = useLabels();

const props = defineProps<{
  address?: Address;
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
      columnHelper.accessor('success', {
        header: '',
        cell: (cell) => cell.getValue(),
      }),
    );
    columns.push(
      columnHelper.accessor('blockTimestamp', {
        header: 'time',
        cell: (cell) => {
          const timestamp = cell.getValue() as number;
          return formatRelativeTime(
            toRelativeTime(new Date(), new Date(timestamp)),
          );
        },
      }),
    );
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
  return labelText ? labelText : value;
}

function formatFunction(value: Hex): string {
  return size(value) === 0 ? '—' : value;
}

function formatData(value: Hex): string {
  if (size(value) === 0) {
    return '—';
  }
  return value;
}
</script>

<script lang="ts">
interface AddressTransaction {
  success: boolean;
  blockNumber: number;
  blockTimestamp: number;
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
  display: flex;
  border-radius: calc(var(--border-radius) - 1px)
    calc(var(--border-radius) - 1px) 0 0;
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
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

.icon {
  width: 12px;
  height: 12px;
}

.tiny {
  width: 60px;
}

.hash {
  width: 250px;
}

.block {
  width: 100px;
}

.timestamp {
  width: 110px;
}

.address {
  width: 250px;
}

.func {
  width: 70px;
}

.data {
  width: 260px;
}

.value {
  width: 100px;
}
</style>
