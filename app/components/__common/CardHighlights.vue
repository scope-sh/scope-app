<template>
  <ScopeCard>
    <div class="list">
      <div
        v-for="(item, itemIndex) in items"
        :key="itemIndex"
        class="item"
      >
        <img
          v-if="item.icon"
          :src="item.icon"
          class="icon"
          alt="Highlight item icon"
        />
        <div
          v-else
          class="icon-placeholder"
        />
        <div class="parts">
          <div
            v-for="(part, partIndex) in item.parts"
            :key="partIndex"
          >
            <template v-if="part.type === 'text'">
              <span>{{ part.value }}</span>
            </template>
            <template v-else-if="part.type === 'address'">
              <LinkAddress
                v-if="part.label"
                :address="part.address"
                type="minimal"
              >
                {{ part.label }}
              </LinkAddress>
              <LinkAddress
                v-else
                :address="part.address"
                type="minimal"
              />
            </template>
            <template v-else-if="part.type === 'op'">
              <LinkOp
                :hash="part.hash"
                type="minimal"
              >
                {{ part.hash }}
              </LinkOp>
            </template>
          </div>
        </div>
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import LinkOp from './LinkOp.vue';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeCard from '@/components/__common/ScopeCard.vue';
import type { Item } from '@/utils/context/highlights';

defineProps<{
  items: Item[];
}>();
</script>

<style scoped>
.list {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  max-height: 150px;
  overflow: auto;
}

.item {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.icon-placeholder,
.icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.parts {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}
</style>
