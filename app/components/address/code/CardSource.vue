<template>
  <div
    v-if="singleFile"
    class="content"
  >
    <ViewSearch
      v-if="isSearching"
      :files
      @open-result="handleOpenResult"
      @query-change="handleQueryChange"
      @close-search="handleCloseSearch"
    />
    <SourceHighlighter
      v-if="selectedFile"
      :value="selectedFile.content"
      :language="source.language"
      line-numbers
      :initial-line="initialLineNumber"
      :highlight="searchQuery"
      @scroll="handleSourceScroll"
    />
  </div>
  <ScopeCard v-else>
    <div class="content">
      <ViewSearch
        v-if="isSearching"
        :files
        @open-result="handleOpenResult"
        @query-change="handleQueryChange"
        @close-search="handleCloseSearch"
      />
      <FileView
        v-else
        v-model:selected-file-index="selectedFileIndex"
        :files="files"
      />
      <div
        v-if="selectedFile"
        class="pane"
      >
        <FilePathStrip :value="selectedFile.name" />
        <SourceHighlighter
          v-if="selectedFile"
          :value="selectedFile.content"
          :language="source.language"
          line-numbers
          :initial-line="initialLineNumber"
          :highlight="searchQuery"
          @scroll="handleSourceScroll"
        />
      </div>
    </div>
  </ScopeCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import FilePathStrip from './FilePathStrip.vue';
import FileView, { type File } from './FileView.vue';
import SourceHighlighter from './SourceHighlighter.vue';
import ViewSearch, { type Result as SearchResult } from './ViewSearch.vue';

import ScopeCard from '@/components/__common/ScopeCard.vue';
import type { SourceCode } from '@/services/api.js';

const { source } = defineProps<{
  source: SourceCode;
  isSearching: boolean;
}>();

const emit = defineEmits<{
  'close-search': [];
}>();

watch(
  () => source,
  () => {
    selectedFileIndex.value = 0;
  },
);

function handleOpenResult(result: SearchResult): void {
  selectedFileIndex.value = files.value.findIndex(
    (file) => file.name === result.file.name,
  );
  initialLineNumber.value = result.line;
}

const searchQuery = ref<string>('');
function handleQueryChange(query: string): void {
  searchQuery.value = query;
}
function handleCloseSearch(): void {
  emit('close-search');
}

function handleSourceScroll(): void {
  initialLineNumber.value = 1;
}

const files = computed<File[]>(() =>
  Object.entries(source.files).map(([name, content]) => ({
    name,
    content,
  })),
);
const singleFile = computed(() => files.value.length === 1);

const selectedFileIndex = ref<number>(0);
watch(files, (newFiles) => {
  selectedFileIndex.value =
    newFiles.findIndex((file) => file.name === source.entry) || 0;
});
const selectedFile = computed(() => {
  return files.value[selectedFileIndex.value] || null;
});
const initialLineNumber = ref<number>(1);
</script>

<style scoped>
.content {
  display: flex;
  gap: var(--spacing-4);
  height: 100%;
}

.pane {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
  width: 100%;
}
</style>
