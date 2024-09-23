<template>
  <ScopePanelLoading
    v-if="isLoading"
    title="Logs"
  />
  <ScopePanel
    v-else
    title="Logs"
  >
    <template #header>
      <div class="panel-header">
        <ScopePaginator
          v-if="rows.length"
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
      <ScopeLabelEmptyState
        v-if="!rows.length"
        value="No logs found"
      />
      <template v-else>
        <div class="logs">
          <ScopeToggle
            v-model="selectedLogView"
            :options="logViewOptions"
          />
          <CardLog
            v-for="(log, index) in rows"
            :key="index"
            :log="log"
            :view="selectedLogView"
            type="address"
          />
        </div>
        <div class="panel-footer">
          <SelectPerPage v-model="perPage" />
          <div class="footer-side">
            <ScopePaginator
              v-if="rows.length"
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
    </template>
  </ScopePanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { Log, LogView } from '@/components/__common/CardLog.vue';
import CardLog from '@/components/__common/CardLog.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeLabelEmptyState from '@/components/__common/ScopeLabelEmptyState.vue';
import ScopePaginator from '@/components/__common/ScopePaginator.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopePanelLoading from '@/components/__common/ScopePanelLoading.vue';
import type { Option as ToggleOption } from '@/components/__common/ScopeToggle.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import SelectPerPage from '@/components/__common/SelectPerPage.vue';
import type { Log as AddressLog } from '@/services/hypersync';

const page = defineModel<number>('page', {
  required: true,
});

const perPage = defineModel<number>('perPage', {
  required: true,
});

const { items } = defineProps<{
  isLoading: boolean;
  items: AddressLog[];
  maxPage: number;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const selectedLogView = ref<LogView>('decoded');
const logViewOptions = computed<ToggleOption<LogView>[]>(() => [
  {
    value: 'decoded',
    icon: 'text',
  },
  {
    value: 'hex',
    icon: 'hex-string',
  },
]);

const rows = computed<Log[]>(() => {
  return items
    .map((log) => {
      return {
        blockNumber: log.blockNumber,
        blockTimestamp: log.blockTimestamp,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        address: log.address,
        topics: log.topics,
        data: log.data,
      };
    })
    .slice((page.value - 1) * perPage.value, page.value * perPage.value);
});

function refresh(): void {
  emit('refresh');
}
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

.logs {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
}
</style>
