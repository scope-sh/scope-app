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
                header.column.id === 'entryPoint' ||
                header.column.id === 'nonce',
              block: header.column.id === 'blockNumber',
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
              tiny:
                cell.column.id === 'success' ||
                cell.column.id === 'entryPoint' ||
                cell.column.id === 'nonce',
              block: cell.column.id === 'blockNumber',
              hash:
                cell.column.id === 'transactionHash' ||
                cell.column.id === 'hash',
              address:
                cell.column.id === 'bundler' || cell.column.id === 'paymaster',
            }"
          >
            <template v-if="cell.column.id === 'success'">
              <ScopeIcon
                :kind="cell.getValue() ? 'check' : 'cross'"
                class="icon"
              />
            </template>
            <LinkBlock
              v-else-if="cell.column.id === 'blockNumber'"
              :number="cell.getValue() as bigint"
              type="minimal"
            />
            <LinkTransaction
              v-else-if="cell.column.id === 'transactionHash'"
              :hash="cell.getValue() as Hex"
              type="minimal"
            >
              {{ cell.getValue() as Hex }}
            </LinkTransaction>
            <LinkUserOp
              v-else-if="cell.column.id === 'hash'"
              :hash="cell.getValue() as Hex"
              type="minimal"
            >
              {{ cell.getValue() as Hex }}
            </LinkUserOp>
            <LinkAddress
              v-else-if="cell.column.id === 'bundler'"
              :address="cell.getValue() as Address"
              type="minimal"
            >
              {{ getAddress(cell.getValue() as Address) }}
            </LinkAddress>
            <LinkAddress
              v-else-if="isPaymaster(cell)"
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
  Cell,
} from '@tanstack/vue-table';
import { Address, Hex, zeroAddress } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkBlock from '@/components/__common/LinkBlock.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
import LinkUserOp from '@/components/__common/LinkUserOp.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useLabels from '@/composables/useLabels.js';
import {
  ENTRYPOINT_0_6_ADDRESS,
  ENTRYPOINT_0_7_ADDRESS,
} from '@/utils/context/erc4337/entryPoint';

const { getLabelText } = useLabels();

const props = defineProps<{
  ops: UserOp[];
  page: number;
  perPage: number;
}>();

const columnHelper = createColumnHelper<UserOp>();

const columns = computed(() => [
  columnHelper.accessor('success', {
    header: 'status',
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor('entryPoint', {
    header: 'ep',
    cell: (cell) => {
      const value = cell.getValue();
      if (value === ENTRYPOINT_0_6_ADDRESS) {
        return '0.6';
      }
      if (value === ENTRYPOINT_0_7_ADDRESS) {
        return '0.7';
      }
      return '—';
    },
  }),
  columnHelper.accessor('nonce', {
    header: 'nonce',
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
]);

const table = useVueTable({
  get data() {
    return props.ops;
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

function isPaymaster(cell: Cell<UserOp, unknown>): boolean {
  return cell.column.id === 'paymaster' && cell.getValue() !== zeroAddress;
}
</script>

<script lang="ts">
interface UserOp {
  success: boolean;
  entryPoint: Address;
  nonce: bigint;
  blockNumber: number;
  transactionHash: Hex;
  hash: Hex;
  bundler: Address;
  paymaster: Address;
}

export type { UserOp };
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
