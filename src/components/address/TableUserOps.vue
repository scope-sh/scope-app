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
            <template v-if="cell.column.id === 'success'">
              <ScopeIcon
                :kind="cell.getValue() ? 'check-circled' : 'cross'"
                class="icon"
              />
            </template>
            <ScopeLinkInternal
              v-else-if="cell.column.id === 'blockNumber'"
              :route="{ name: 'block', number: cell.getValue() as bigint }"
              type="minimal"
            >
              {{ cell.getValue() }}
            </ScopeLinkInternal>
            <ScopeLinkInternal
              v-else-if="cell.column.id === 'transactionHash'"
              :route="{ name: 'transaction', hash: cell.getValue() as Hex }"
              type="minimal"
            >
              {{ formatHash(cell.getValue() as Hex) }}
            </ScopeLinkInternal>
            <ScopeLinkInternal
              v-else-if="cell.column.id === 'hash'"
              :route="{ name: 'userop', hash: cell.getValue() as Hex }"
              type="minimal"
            >
              {{ formatHash(cell.getValue() as Hex) }}
            </ScopeLinkInternal>
            <LinkAddress
              v-else-if="cell.column.id === 'paymaster'"
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
} from '@tanstack/vue-table';
import { Address, Hex } from 'viem';
import { computed, watch } from 'vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import useLabels from '@/composables/useLabels.js';
import {
  ENTRYPOINT_0_6_ADDRESS,
  ENTRYPOINT_0_7_ADDRESS,
} from '@/utils/context/erc4337/entryPoint';
import { formatAddress } from '@/utils/formatting';

import ScopeIcon from '../__common/ScopeIcon.vue';

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
      return '–';
    },
  }),
  columnHelper.accessor('paymaster', {
    header: 'paymaster',
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
  return labelText ? labelText : formatAddress(value, 16);
}

function formatHash(value: Hex): string {
  const size = 16;
  return `${value.slice(0, 2 + size / 2)}...${value.slice(-size / 2)}`;
}
</script>

<script lang="ts">
interface UserOp {
  success: boolean;
  entryPoint: Address;
  paymaster: Address;
  blockNumber: number;
  transactionHash: Hex;
  hash: Hex;
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

.icon {
  width: 12px;
  height: 12px;
}
</style>
