<template>
  <ScopeCard>
    <div class="content">
      <div class="header">
        <span v-if="log.blockNumber">
          <ScopeLinkInternal
            :route="{
              name: 'block',
              number: log.blockNumber,
            }"
          >
            {{ log.blockNumber }}
          </ScopeLinkInternal>
        </span>
        ·
        <span>
          <LinkAddress
            :address="log.address"
            :with-icon="false"
          />
        </span>
        ·
        <span class="index">#{{ log.logIndex }}</span>
      </div>
      <div class="topics">
        <div
          v-for="topic in log.topics"
          :key="topic"
          class="topic"
        >
          {{ topic }}
        </div>
      </div>
      <div class="data">
        <ScopeTextView
          :value="log.data"
          size="tiny"
        />
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import ScopeLinkInternal from '@/components/__common/ScopeLinkInternal.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import type { Log } from '@/services/evm';

defineProps<{
  log: Log;
}>();
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.header {
  padding-left: 2px;
  font-size: var(--font-size-s);
}

.index {
  color: var(--color-text-secondary);
}

.topic {
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}
</style>
