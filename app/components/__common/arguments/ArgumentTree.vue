<template>
  <ArgumentTreeBranch
    :args
    top-level
    class="tree"
  />
</template>

<script setup lang="ts">
import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import type { Argument } from './common';

defineProps<{
  args: Argument[];
}>();
</script>

<style scoped>
.tree {
  margin-left: 0;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}
</style>
