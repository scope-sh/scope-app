<template>
  <ArgumentTreeBranch
    :args
    :top-level="true"
    class="tree"
  />
</template>

<script setup lang="ts">
import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import { Argument } from './common';

defineProps<{
  args: Argument[];
}>();
</script>

<style scoped>
.tree {
  margin-left: 0;
}
</style>
