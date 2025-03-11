<template>
  <div class="view">
    <div class="header">
      <div class="input">
        <input
          ref="inputEl"
          v-model="query"
          placeholder="Search"
        />
        <ScopeIcon
          class="icon"
          kind="cross"
          @click="handleCrossIconClick"
        />
      </div>
      <div class="stats">
        {{ statsLabel }}
      </div>
    </div>
    <div
      v-if="results.length > 0"
      class="results"
    >
      <div
        v-for="(fileResults, filePath) of resultsByFile"
        :key="filePath"
        class="file-results"
      >
        <div class="file-path">
          <div class="file-name">{{ getFileName(filePath) }}</div>
          <div class="file-dir">{{ getFileDir(filePath) }}</div>
        </div>
        <div
          v-for="result in fileResults"
          :key="result.line"
          class="result"
          @click="() => handleResultClick(result)"
        >
          {{ result.match }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useFocus } from '@vueuse/core';
import { computed, ref, useTemplateRef, watch } from 'vue';

import type { File } from './FileView.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const { files } = defineProps<{
  files: File[];
}>();

const emit = defineEmits<{
  'close-search': [];
  'open-result': [result: Result];
  'query-change': [query: string];
}>();

const MAX_RESULTS = 500;

const inputEl = useTemplateRef('inputEl');
useFocus(inputEl, { initialValue: true });

const query = ref('');
const results = ref<Result[]>([]);
const resultsByFile = computed(() => {
  const map: Record<string, Result[]> = {};
  for (const result of results.value) {
    const fileName = result.file.name;
    if (!map[fileName]) {
      map[fileName] = [];
    }
    const fileMap = map[fileName];
    if (!fileMap) {
      continue;
    }
    fileMap.push(result);
  }
  return map;
});
const statsLabel = computed(() => {
  if (query.value.length === 0) {
    return '';
  }
  if (results.value.length === 0) {
    return 'No results found.';
  }
  const countSuffix = results.value.length === MAX_RESULTS ? '+' : '';
  const resultWord = results.value.length === 1 ? 'result' : 'results';
  const fileWord =
    Object.keys(resultsByFile.value).length === 1 ? 'file' : 'files';
  return `${results.value.length}${countSuffix} ${resultWord} in ${Object.keys(resultsByFile.value).length}${countSuffix} ${fileWord}`;
});

watch(query, () => {
  requestSearch();
});
const requestSearch = useDebounceFn(() => {
  emit('query-change', query.value);
  results.value = search(query.value);
}, 500);

function handleCrossIconClick(): void {
  query.value = '';
  emit('query-change', '');
  emit('close-search');
}

function search(query: string): Result[] {
  if (query.length === 0) {
    return [];
  }
  const results: Result[] = [];
  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) {
        continue;
      }
      if (line.includes(query)) {
        results.push({
          file,
          line: i,
          match: line,
        });
      }
      if (results.length >= MAX_RESULTS) {
        return results;
      }
    }
  }
  return results;
}

function getFileName(filePath: string): string {
  const tokens = filePath.split('/');
  return tokens.at(-1) || '';
}

function getFileDir(filePath: string): string {
  const tokens = filePath.split('/');
  return tokens.slice(0, -1).join('/');
}

function handleResultClick(result: Result): void {
  emit('open-result', result);
}
</script>

<script lang="ts">
interface Result {
  file: File;
  line: number;
  match: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { Result };
</script>

<style scoped>
.view {
  display: flex;
  gap: var(--spacing-5);
  flex-direction: column;
  width: 256px;
  overflow-y: scroll;
}

.header {
  position: sticky;
  top: 0;
  padding-bottom: var(--spacing-2);
  background: var(--color-background-primary);
}

.stats {
  padding: var(--spacing-2) 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.input {
  --icon-size: 14px;
  --color-accent-toned-down: oklch(from var(--color-accent) l calc(c * 0.2) h);

  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-6) var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-xs);
  background: var(--color-background-secondary);
  font-size: var(--font-size-s);

  &:focus-within {
    border-color: var(--color-accent-toned-down);
  }
}

input {
  width: calc(100% - var(--icon-size));
  padding: 0;
  border: none;
  outline: none;
  background-color: transparent;
  color: var(--color-text-primary);
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--color-text-primary);
  }
}

.results-empty {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.results {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.file-results {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.file-path {
  display: flex;
  gap: var(--spacing-3);
  align-items: baseline;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-s);
}

.file-dir {
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.result {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: none;

  &:hover {
    border-radius: var(--border-radius-xs);
    background: var(--color-background-secondary);
    cursor: pointer;
  }
}
</style>
