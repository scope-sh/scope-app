<template>
  <div
    v-if="view === 'decoded'"
    class="card"
  >
    <div class="list">
      <AuthorizationView
        v-for="(authorization, index) in list"
        :key="index"
        :authorization
      />
    </div>
  </div>
  <ScopeTextView
    v-else
    size="regular"
    :value="JSON.stringify(list, null, 2)"
  />
</template>

<script setup lang="ts">
import AuthorizationView from './AuthorizationView.vue';

import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import type { SignedAuthorizationList } from '@/utils/context/eip7702';

defineProps<{
  list: SignedAuthorizationList;
  view: AuthorizationListView;
}>();
</script>

<script lang="ts">
type AuthorizationListView = 'hex' | 'decoded';

// eslint-disable-next-line import/prefer-default-export
export type { AuthorizationListView };
</script>

<style scoped>
.card {
  display: flex;
  gap: var(--spacing-2) var(--spacing-3);
  flex-wrap: wrap;
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-m);
  font-size: var(--font-size-s);

  .list {
    display: flex;
    gap: var(--spacing-5);
    flex-direction: column;
    align-items: start;
  }
}
</style>
