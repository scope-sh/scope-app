<template>
  <Pagination.Root
    :page="zeroBased ? page + 1 : page"
    :total="total"
    :disabled
    :items-per-page="1"
    :sibling-count="1"
    show-edges
    @update:page="handlePageUpdate"
  >
    <Pagination.List class="list">
      <Pagination.Prev class="button button-arrow">
        <ScopeIcon
          class="icon"
          kind="arrow-left"
        />
      </Pagination.Prev>
      <Pagination.ListItem
        v-if="showPage"
        class="button"
        :value="page"
      >
        {{ page }}
      </Pagination.ListItem>
      <Pagination.Next class="button button-arrow">
        <ScopeIcon
          class="icon"
          kind="arrow-right"
        />
      </Pagination.Next>
    </Pagination.List>
  </Pagination.Root>
</template>

<script setup lang="ts">
import { Pagination } from 'reka-ui/namespaced';

import ScopeIcon from './ScopeIcon.vue';

const page = defineModel<number>({
  required: true,
});

const {
  total = undefined,
  zeroBased = false,
  showPage = true,
  disabled = false,
} = defineProps<{
  total?: number;
  zeroBased?: boolean;
  showPage?: boolean;
  disabled?: boolean;
}>();

function handlePageUpdate(newValue: number): void {
  page.value = zeroBased ? newValue - 1 : newValue;
}
</script>

<style scoped>
.list {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
  justify-content: center;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-m);
}

.button-arrow {
  color: var(--color-text-secondary);

  &:hover {
    color: var(--color-text-primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.icon {
  width: 14px;
  height: 14px;
  cursor: pointer;
}
</style>
