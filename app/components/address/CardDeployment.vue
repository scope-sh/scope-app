<template>
  <div class="card">
    <div
      v-if="isGenesis"
      class="item"
    >
      Deployed at <LinkBlock :number="0n">genesis</LinkBlock>
    </div>
    <template v-else>
      <div class="item">
        Deployed by
        <LinkAddress :address="deployment.deployer" />
      </div>
      <div class="item">
        in tx
        <LinkTransaction :hash="deployment.transactionHash">
          {{ deployment.transactionHash.slice(0, 8) }}…{{
            deployment.transactionHash.slice(-8)
          }}
        </LinkTransaction>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import LinkBlock from '../__common/LinkBlock.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import LinkTransaction from '@/components/__common/LinkTransaction.vue';
import type { Deployment } from '@/services/api';

const { deployment } = defineProps<{
  deployment: Deployment;
}>();

const isGenesis = computed(() => (deployment.deployer as string) === 'GENESIS');
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

  .item {
    display: flex;
    gap: var(--spacing-3);
    align-items: center;
  }
}
</style>
