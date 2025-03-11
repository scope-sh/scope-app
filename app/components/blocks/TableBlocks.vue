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
              block: header.column.id === 'number',
              timestamp: header.column.id === 'timestamp',
              transactions: header.column.id === 'transactions',
              address: header.column.id === 'producer',
              gas:
                header.column.id === 'gasUsed' ||
                header.column.id === 'gasLimit',
              'gas-share': header.column.id === 'gasUsedShare',
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
              block: cell.column.id === 'number',
              timestamp: cell.column.id === 'timestamp',
              transactions: cell.column.id === 'transactions',
              address: cell.column.id === 'producer',
              gas:
                cell.column.id === 'gasUsed' || cell.column.id === 'gasLimit',
              'gas-share': cell.column.id === 'gasUsedShare',
            }"
          >
            <LinkBlock
              v-if="cell.column.id === 'number'"
              :number="toBlockNumber(cell.getValue())"
              type="minimal"
            />
            <ScopeTooltip
              v-else-if="cell.column.id === 'timestamp'"
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
            <LinkAddress
              v-else-if="cell.column.id === 'producer'"
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
  FlexRender,
  useVueTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/vue-table';
import type { Address } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import ScopeTooltip from '@/components/__common/ScopeTooltip.vue';
import { toRelativeTime } from '@/utils/conversion';
import { formatRelativeTime, formatShare, formatTime } from '@/utils/formatting';

const { blocks, page, perPage } = defineProps<{
  blocks: Block[];
  page: number;
  perPage: number;
}>();

const columnHelper = createColumnHelper<Block>();

const columns = computed(() => {
  return [
    columnHelper.accessor('number', {
      header: 'number',
      cell: (cell) => cell.getValue(),
    }),
    columnHelper.accessor('timestamp', {
      header: 'time',
      cell: (cell) => {
        const timestamp = cell.getValue();
        return formatRelativeTime(toRelativeTime(new Date(), timestamp));
      },
    }),
    columnHelper.accessor('transactions', {
      header: 'transactions',
      cell: (cell) => cell.getValue(),
    }),
    columnHelper.accessor('gasUsed', {
      header: 'gas used',
      cell: (cell) => cell.getValue(),
    }),
    columnHelper.accessor('gasLimit', {
      header: 'gas limit',
      cell: (cell) => cell.getValue(),
    }),
    columnHelper.accessor('gasUsedShare', {
      header: 'gas share',
      cell: (cell) => {
        const value = cell.getValue();
        return formatShare(value);
      },
    }),
    columnHelper.accessor('producer', {
      header: 'producer',
      cell: (cell) => cell.getValue(),
    }),
  ];
});

const table = useVueTable({
  get data() {
    return blocks;
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

function toAddress(value: unknown): Address {
  return value as Address;
}

function toBlockNumber(value: unknown): bigint {
  return value as bigint;
}
</script>

<script lang="ts">
interface Block {
  number: number;
  timestamp: Date;
  transactions: number;
  producer: Address;
  gasUsed: bigint;
  gasLimit: bigint;
  gasUsedShare: number;
}
</script>

<style scoped>
.table {
  overflow-x: auto;
}

table {
  --border-radius: var(--border-radius-s);

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

.block {
  width: 100px;
}

.timestamp {
  width: 140px;
}

.transactions {
  width: 90px;
}

.address {
  display: block;
  width: 380px;
}

.gas {
  width: 100px;
}

.gas-share {
  width: 80px;
}

.transactions,
.gas,
.gas-share {
  text-align: right;
}
</style>
