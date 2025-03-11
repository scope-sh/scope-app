<template>
  <li class="directory">
    <Tree.Item
      v-slot="{ isExpanded }"
      as-child
      :level="level"
      :value="directory"
      class="item"
    >
      <button>
        <div
          v-if="directory.parent"
          class="label"
        >
          <div class="icon">
            <ScopeIcon :kind="!isExpanded ? 'chevron-right' : 'chevron-down'" />
          </div>
          <div
            v-if="directory.name"
            class="name"
          >
            {{ directory.name }}
          </div>
        </div>
      </button>

      <ul
        v-if="isExpanded && directory.directories.length > 0"
        class="directories"
      >
        <FileTreeDirectory
          v-for="dir in directory.directories"
          :key="dir.id"
          :directory="dir"
          :selection
          :level="level + 1"
          @select="handleInnerSelect"
        />
      </ul>
      <ul
        v-if="isExpanded && directory.files.length > 0"
        class="files"
      >
        <li
          v-for="(file, index) in directory.files"
          :key="file.id"
          :class="{ selected: isFileSelected(index) }"
          class="item"
          @click="() => handleFileSelect(index)"
        >
          {{ file.name }}
        </li>
      </ul>
    </Tree.Item>
  </li>
</template>

<script setup lang="ts">
import { Tree } from 'reka-ui/namespaced';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';

const {
  directory,
  selection,
  level = 0,
} = defineProps<{
  directory: Directory;
  selection: FileSelection | null;
  level?: number;
}>();

const emit = defineEmits<{
  select: [directory: Directory, index: number];
}>();

function handleFileSelect(index: number): void {
  emit('select', directory, index);
}

function handleInnerSelect(directory: Directory, fileIndex: number): void {
  emit('select', directory, fileIndex);
}

function isFileSelected(index: number): boolean {
  if (!selection) {
    return false;
  }
  return (
    isSameDirectory(directory, selection.directory) &&
    index === selection.fileIndex
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
interface Directory extends Item {
  parent: Directory | null;
  files: File[];
  directories: Directory[];
}

type File = Item;

type Node = File | Directory;

interface Item {
  name: string;
  id: string;
}

interface FileSelection {
  directory: Directory;
  fileIndex: number;
}

export type { Directory, FileSelection, Node };
</script>

<style scoped>
.directory {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

button {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
}

.label {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon {
  width: 12px;
  height: 12px;
}

.directories,
.files {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  padding: 0;
  list-style: none;
}

.directories {
  margin-left: var(--spacing-2);
}

.files {
  margin-left: var(--spacing-8);
}

.item {
  list-style-type: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-light);
  cursor: pointer;

  &:hover {
    color: var(--color-text-primary);
  }
}

.item.selected {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-heavy);
}
</style>
