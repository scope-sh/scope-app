<template>
  <ScopePage :sections="[]">
    <ScopePanel title="Blocks">
      <template #header>
        <div class="panel-header">
          <ScopePaginator
            v-if="blocks.length"
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
      <template #default>
        <div
          v-if="isLoading"
          class="loading"
        >
          <IconLoading />
        </div>
        <TableBlocks
          v-else
          :blocks="rows"
          :page="page - 1"
          :per-page="perPage"
        />
        <div class="panel-footer">
          <SelectPerPage v-model="perPage" />
          <div class="footer-side">
            <ScopePaginator
              v-if="blocks.length"
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
  </ScopePage>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import IconLoading from '@/components/__common/IconLoading.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
import TableBlocks from '@/components/blocks/TableBlocks.vue';
import useChain from '@/composables/useChain';
import EvmService, { type Block } from '@/services/evm';

const { id: chainId, client } = useChain();

const evmService = computed(() =>
  client.value ? new EvmService(client.value) : null,
);

const blocks = ref<Block[]>([]);
const page = ref(1);
const perPage = ref(20);
const maxPage = computed(() =>
  blocks.value[0]
    ? Math.ceil(Number(blocks.value[0].number) / perPage.value)
    : 0,
);
const isLoading = ref(false);

function refresh(): void {
  page.value = 1;
  blocks.value = [];
  fetchBlocks();
}

watch(page, (page) => {
  if (blocks.value.length >= page * perPage.value) {
    return;
  }
  fetchBlocks();
});
watch(perPage, () => {
  page.value = 1;
  fetchBlocks();
});
watch(
  chainId,
  async () => {
    fetchBlocks();
  },
  {
    immediate: true,
  },
);

async function fetchBlocks(): Promise<void> {
  if (!evmService.value) {
    return;
  }
  const earliestBlock = blocks.value.at(-1)?.number;
  const latestBlock = earliestBlock
    ? BigInt(earliestBlock) - 1n
    : await evmService.value.getLatestBlock();
  isLoading.value = true;
  const newBlocks = [];
  for (let i = 0n; i < perPage.value; i++) {
    const block = await evmService.value.getBlock(latestBlock - i);
    if (block) {
      newBlocks.push(block);
    }
  }

  // Append newly fetched blocks to the end of the list
  // Make sure there are no duplicates
  blocks.value = [
    ...new Map(
      blocks.value.concat(newBlocks).map((block) => [`${block.number}`, block]),
    ).values(),
  ];

  isLoading.value = false;
}

const rows = computed(() => {
  return blocks.value.map((block) => ({
    ...block,
    gasUsedShare: Number(block.gasUsed) / Number(block.gasLimit),
  }));
});
</script>

<style scoped>
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

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}
</style>
