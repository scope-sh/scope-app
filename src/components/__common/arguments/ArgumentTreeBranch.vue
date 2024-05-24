<template>
  <div class="branch">
    <div
      v-for="(leaf, key) in args"
      :key="key"
      class="branch-part"
      :class="{ terminal: typeof leaf !== 'object' }"
    >
      <div class="key">{{ key }}</div>
      <ArgumentTreeBranch
        v-if="typeof leaf === 'object' && leaf !== null"
        :args="getArguments(leaf)"
      />
      <ArgumentTreeLeaf
        v-else
        :value="leaf"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import ArgumentTreeLeaf from './ArgumentTreeLeaf.vue';
import { Arguments } from './common';

defineProps<{
  args: Arguments;
}>();

function getArguments(args: object): Arguments {
  return args as Arguments;
}
</script>

<style scoped>
.branch {
  margin-left: 20px;
}

.branch-part {
  display: flex;
  flex-direction: column;
  column-gap: var(--spacing-4);
  line-height: 1.4;

  &.terminal {
    flex-direction: row;
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
