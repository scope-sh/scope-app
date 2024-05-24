<template>
  <ArgumentTreeBranch
    :args
    class="tree"
  />
</template>

<script setup lang="ts">
import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import { Arguments } from './common';

defineProps<{
  args: Arguments;
}>();
</script>

<style scoped>
.tree {
  margin-left: 0;
}
</style>
