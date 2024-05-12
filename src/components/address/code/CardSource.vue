<template>
  <SourceHighlighter
    v-if="singleFile"
    :value="files[0]?.content || ''"
    :language="source.language"
  />
  <ScopeCard v-else>
    <div class="content">
      <FileTree
        v-model:selectedFileIndex="selectedFileIndex"
        :files="files"
      />
      <SourceHighlighter
        :value="selectedFile"
        language="Solidity"
      />
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import ScopeCard from '@/components/__common/ScopeCard.vue';
import type { SourceCode } from '@/services/api';

import FileTree from './FileTree.vue';
import SourceHighlighter from './SourceHighlighter.vue';

const props = defineProps<{
  source: SourceCode;
}>();

const files = computed(() =>
  Object.entries(props.source.files).map(([name, content]) => ({
    name,
    content,
  })),
);
const singleFile = computed(() => files.value.length === 1);

const selectedFileIndex = ref<number>(0);
const selectedFile = computed(() => {
  return files.value[selectedFileIndex.value]?.content || '';
});
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-4);
  height: 100%;
}
</style>
