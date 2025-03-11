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
              status: header.column.id === 'success',
              small:
                header.column.id === 'blockPosition' ||
                header.column.id === 'transactionIndex',
              block: header.column.id === 'blockNumber',
              timestamp: header.column.id === 'blockTimestamp',
              hash: header.column.id === 'hash',
              address: header.column.id === 'from' || header.column.id === 'to',
              func: header.column.id === 'function',
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
              status: cell.column.id === 'success',
              small:
                cell.column.id === 'blockPosition' ||
                cell.column.id === 'transactionIndex',
              block: cell.column.id === 'blockNumber',
              timestamp: cell.column.id === 'blockTimestamp',
              hash: cell.column.id === 'hash',
              address: cell.column.id === 'from' || cell.column.id === 'to',
              func: cell.column.id === 'function',
              value:
                cell.column.id === 'value' || cell.column.id === 'gasPrice',
            }"
          >
            <template v-if="cell.column.id === 'success'">
              <ScopeIcon
                v-if="cell.getValue() === false"
                kind="cross"
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
              v-else-if="cell.column.id === 'hash'"
              :hash="toHash(cell.getValue())"
              type="minimal"
            >
              {{ cell.getValue() }}
            </LinkTransaction>
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
              <template v-if="cell.getValue()">
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
              <span v-else>—</span>
            </template>
            <template v-else-if="cell.column.id === 'value'">
              <ScopeTooltip
                delay="medium"
              >
                <template #trigger>
                  {{ formatEther(cell.getValue<bigint>(), nativeCurrency, false) }}
                </template>
                <template #default>
                  {{ formatEther(cell.getValue<bigint>(), nativeCurrency, true) }}
                </template>
              </ScopeTooltip>
            </template>
            <template v-else-if="cell.column.id === 'gasPrice'">
              <ScopeTooltip
                delay="medium"
              >
                <template #trigger>
                  {{ formatGasPrice(cell.getValue<bigint>(), false) }}
                </template>
                <template #default>
                  {{ formatGasPrice(cell.getValue<bigint>(), true) }}
                </template>
            </ScopeTooltip>
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
import ScopeTooltip from './ScopeTooltip.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useAbi from '@/composables/useAbi.js';
import useChain from '@/composables/useChain.js';
import useLabels from '@/composables/useLabels.js';
import { toRelativeTime } from '@/utils/conversion';
import {
  formatEther,
  formatGasPrice,
  formatRelativeTime,
  formatTime,
} from '@/utils/formatting';

const { address, transactions, page, perPage, type } = defineProps<{
  address?: Address;
  transactions: Transaction[];
  page: number;
  perPage: number;
  type: 'address' | 'block';
}>();
const { getFunctionName } = useAbi();
const { nativeCurrency } = useChain();
const { getLabelText } = useLabels();

const columnHelper = createColumnHelper<Transaction>();

const columns = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Transaction, any>[] = [];
  if (type === 'address') {
    columns.push(
      columnHelper.accessor('success', {
        header: '',
        cell: (cell) => cell.getValue(),
      }),
    );
    columns.push(
      columnHelper.accessor('blockTimestamp', {
        header: 'time',
        cell: (cell) => cell.getValue(),
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
  } else if (type === 'block') {
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
        cell: (cell) =>
          formatFunction(address, cell.row.getValue('to'), cell.getValue()),
      }),
      columnHelper.accessor('value', {
        header: 'value',
        cell: (cell) =>
          formatEther(cell.getValue(), nativeCurrency.value, false),
      }),
      columnHelper.accessor('gasPrice', {
        header: 'gas price',
        cell: (cell) => formatGasPrice(cell.getValue(), false),
      }),
    ],
  );
  return columns;
});

const table = useVueTable({
  get data() {
    return transactions;
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

function formatFunction(
  address: Address | undefined,
  to: Address | undefined,
  value: Hex,
): string {
  if (size(value) === 0) {
    return '—';
  }
  const target = to ? to : address;
  if (!target) {
    return value;
  }
  const functionName = getFunctionName(target, value);
  return functionName ? functionName : value;
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
  value: bigint;
  gasPrice: bigint;
}

interface BlockTransaction {
  blockPosition: number | null;
  hash: Hex;
  from: Address;
  to: Address | null;
  function: Hex;
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

  td.status {
    padding-right: 0;
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

.status {
  width: 24px;
}

.small {
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
  display: block;
  width: 250px;
}

.func {
  width: 200px;
}

.value {
  width: 110px;
}

.address-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
