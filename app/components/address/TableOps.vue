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
                header.column.id === 'entryPoint' ||
                header.column.id === 'nonce',
              block: header.column.id === 'blockNumber',
              timestamp: header.column.id === 'blockTimestamp',
              hash:
                header.column.id === 'transactionHash' ||
                header.column.id === 'hash',
              address:
                header.column.id === 'bundler' ||
                header.column.id === 'paymaster',
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
                cell.column.id === 'entryPoint' || cell.column.id === 'nonce',
              block: cell.column.id === 'blockNumber',
              timestamp: cell.column.id === 'blockTimestamp',
              hash:
                cell.column.id === 'transactionHash' ||
                cell.column.id === 'hash',
              address:
                cell.column.id === 'bundler' || cell.column.id === 'paymaster',
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
              v-else-if="cell.column.id === 'transactionHash'"
              :hash="toHash(cell.getValue())"
              type="minimal"
            >
              {{ toHash(cell.getValue()) }}
            </LinkTransaction>
            <LinkOp
              v-else-if="cell.column.id === 'hash'"
              :hash="toHash(cell.getValue())"
              type="minimal"
            >
              {{ toHash(cell.getValue()) }}
            </LinkOp>
            <LinkAddress
              v-else-if="cell.column.id === 'bundler'"
              :address="toAddress(cell.getValue())"
              type="minimal"
            />
            <LinkAddress
              v-else-if="isPaymaster(cell)"
              :address="toAddress(cell.getValue())"
              type="minimal"
            />
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
  type Cell,
  FlexRender,
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table';
import { type Address, type Hex, zeroAddress } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import LinkOp from '@/components/__common/LinkOp.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeTooltip from '@/components/__common/ScopeTooltip.vue';
import {
  ENTRY_POINT_0_6_ADDRESS,
  ENTRY_POINT_0_7_ADDRESS,
  ENTRY_POINT_0_8_ADDRESS,
} from '@/utils/context/erc4337/entryPoint';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime, formatTime } from '@/utils/formatting';

const { ops, page, perPage } = defineProps<{
  ops: Op[];
  page: number;
  perPage: number;
}>();

const columnHelper = createColumnHelper<Op>();

const columns = computed(() => [
  columnHelper.accessor('success', {
    header: '',
    cell: (cell) => cell.getValue(),
  }),
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
  columnHelper.accessor('hash', {
    header: 'hash',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('bundler', {
    header: 'bundler',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('paymaster', {
    header: 'paymaster',
    cell: (cell) => {
      const value = cell.getValue();
      return value === zeroAddress ? '—' : value;
    },
  }),
  columnHelper.accessor('nonce', {
    header: 'nonce',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('entryPoint', {
    header: 'ep',
    cell: (cell) => {
      const value = cell.getValue();
      if (value === ENTRY_POINT_0_6_ADDRESS) {
        return '0.6';
      }
      if (value === ENTRY_POINT_0_7_ADDRESS) {
        return '0.7';
      }
      if (value === ENTRY_POINT_0_8_ADDRESS) {
        return '0.8';
      }
      return '—';
    },
  }),
]);

const table = useVueTable({
  get data() {
    return ops;
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

function isPaymaster(cell: Cell<Op, unknown>): boolean {
  return cell.column.id === 'paymaster' && cell.getValue() !== zeroAddress;
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
interface Op {
  success: boolean;
  entryPoint: Address;
  nonce: bigint;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  hash: Hex;
  bundler: Address;
  paymaster: Address;
}

// eslint-disable-next-line import/prefer-default-export
export type { Op };
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

  td.status {
    padding-right: 0;
  }

  &:first-child {
    td {
      padding: 10px 10px 6px;

      &.status {
        padding-right: 0;
      }
    }
  }

  &:last-child {
    td {
      padding: 6px 10px 10px;

      &.status {
        padding-right: 0;
      }
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

.status {
  display: flex;
  align-items: center;
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
  width: 250px;
}
</style>
