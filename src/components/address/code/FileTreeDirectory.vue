<template>
  <div
    v-if="directory.directories.length > 0 || directory.files.length > 0"
    class="directory"
  >
    <div
      v-if="directory.parent"
      class="header"
      @click="toggle"
    >
      <div class="icon">
        <ScopeIcon :kind="isToggled ? 'chevron-right' : 'chevron-down'" />
      </div>
      <div
        v-if="directory.name"
        class="name"
      >
        {{ directory.name }}
      </div>
    </div>
    <div
      v-if="!isToggled && directory.directories.length > 0"
      class="directories"
    >
      <FileTreeDirectory
        v-for="(dir, index) in directory.directories"
        :key="index"
        :directory="dir"
        :selection="selection"
        @select="handleInnerSelect"
      />
    </div>
    <div
      v-if="!isToggled && directory.files.length > 0"
      class="files"
    >
      <FileTreeItem
        v-for="(file, index) in directory.files"
        :key="index"
        :file="file"
        :is-selected="isFileSelected(index)"
        @select="handleFileSelect(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

import FileTreeDirectory from './FileTreeDirectory.vue';
import FileTreeItem from './FileTreeItem.vue';

const props = defineProps<{
  directory: Directory;
  selection: FileSelection | null;
}>();

const emit = defineEmits<{
  select: [directory: Directory, index: number];
}>();

const isToggled = ref<boolean>(false);
function toggle(): void {
  isToggled.value = !isToggled.value;
}

function handleFileSelect(index: number): void {
  emit('select', props.directory, index);
}

function handleInnerSelect(directory: Directory, fileIndex: number): void {
  emit('select', directory, fileIndex);
}

function isFileSelected(index: number): boolean {
  if (!props.selection) {
    return false;
  }
  return (
    isSameDirectory(props.directory, props.selection.directory) &&
    index === props.selection.fileIndex
  );
}

function isSameDirectory(a: Directory, b: Directory): boolean {
  if (a.name !== b.name) {
    return false;
  }
  if (a.parent === null && b.parent === null) {
    return true;
  }
  if (a.parent === null || b.parent === null) {
    return false;
  }
  return isSameDirectory(a.parent, b.parent);
}
</script>

<script lang="ts">
interface Directory {
  name: string;
  parent: Directory | null;
  files: string[];
  directories: Directory[];
}

interface FileSelection {
  directory: Directory;
  fileIndex: number;
}

export type { Directory, FileSelection };
</script>

<style scoped>
.directory {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.header {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.header:hover {
  color: var(--color-text-primary);
}

.icon {
  width: 12px;
  height: 12px;
}

.name {
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-light);
}

.directories,
.files {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.directories {
  margin-left: var(--spacing-2);
}

.files {
  margin-left: var(--spacing-8);
}
</style>
