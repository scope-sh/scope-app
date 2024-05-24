<template>
  <div
    v-for="(leaf, key) in tree"
    :key="key"
    class="tree"
    :class="{ root: typeof leaf !== 'object', initial }"
  >
    <div class="key">{{ key }}</div>
    <PropertyTree
      v-if="typeof leaf === 'object' && leaf !== null"
      :tree="leaf as Properties"
      :initial="false"
    />
    <div
      v-else
      class="leaf"
    >
      {{ leaf }}
    </div>
  </div>
</template>

<script setup lang="ts">
import PropertyTree from './PropertyTree.vue';

defineProps<{
  tree: Properties;
  initial: boolean;
}>();
</script>

<script lang="ts">
type Properties = Record<string, unknown>;

export type { Properties };
</script>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
  column-gap: var(--spacing-4);
  line-height: 1.4;

  &.root {
    flex-direction: row;
  }

  &:not(.initial) {
    margin-left: 20px;
  }
}

.key {
  min-width: 160px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
