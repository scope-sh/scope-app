<template>
  <div class="files">
    <input
      v-model="filter"
      placeholder="Filter"
    />
    <FileTree
      v-if="filteredDirectory"
      :directory="filteredDirectory"
      :selection="fileSelection"
      @select="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import FileTree from './FileTree.vue';
import type { Directory, FileSelection } from './FileTreeDirectory.vue';

const props = defineProps<{
  files: File[];
  selectedFileIndex: number;
}>();

const emit = defineEmits<{
  'update:selectedFileIndex': [index: number];
}>();

const fileSelection = computed<FileSelection | null>(() => {
  const file = props.files[props.selectedFileIndex];
  if (!file) {
    return null;
  }
  const path = file.name.split('/');
  let current: Directory = rootDirectory.value;

  for (let i = 0; i < path.length - 1; i += 1) {
    const name = path[i];
    const directory = current.directories.find((dir) => dir.name === name);

    if (!directory) {
      return null;
    }
    current = directory;
  }

  const fileName = path.at(-1);
  if (!fileName) {
    return null;
  }
  const fileIndex = current.files.findIndex((f) => f.name === fileName);
  if (fileIndex === -1) {
    return null;
  }
  return {
    directory: current,
    fileIndex,
  };
});
const rootDirectory = computed<Directory>(() => {
  const root: Directory = {
    name: '',
    parent: null,
    files: [],
    directories: [],
    children: [],
    id: generateId(),
  };

  props.files.forEach((file) => {
    const path = file.name.split('/');
    let current = root;

    for (let i = 0; i < path.length - 1; i += 1) {
      const name = path[i] || '';
      const directory = current.directories.find((dir) => dir.name === name);

      if (directory) {
        current = directory;
      } else {
        const newDirectory: Directory = {
          name,
          parent: current,
          files: [],
          directories: [],
          children: [],
          id: generateId(),
        };

        current.directories.push(newDirectory);
        current.children = [...current.children, newDirectory];
        current = newDirectory;
      }
    }

    const fileName = path.at(-1);
    if (!fileName) {
      return;
    }
    const directoryFile = {
      name: fileName,
      id: generateId(),
    };
    current.children = [...current.children, directoryFile];
    current.files.push(directoryFile);
  });

  return root;
});

function generateId(): string {
  return Math.random().toString(36);
}

const filter = ref<string>('');
const filteredDirectory = computed<Directory | null>(() => {
  return filterDirectory(rootDirectory.value, filter.value);
});
function filterDirectory(
  directory: Directory,
  filter: string,
): Directory | null {
  const files = directory.files.filter((file) =>
    file.name.toLowerCase().includes(filter.toLowerCase()),
  );
  const directories = directory.directories
    .map((dir) => filterDirectory(dir, filter))
    .filter((dir) => dir !== null);
  if (files.length === 0 && directories.length === 0) {
    return null;
  }
  const filteredDirectory: Directory = {
    name: directory.name,
    parent: directory.parent,
    files,
    directories,
    children: directory.children,
    id: directory.id,
  };
  return filteredDirectory;
}

function handleFileSelect(directory: Directory, fileIndex: number): void {
  const file = directory.files[fileIndex];
  if (!file) {
    return;
  }
  const path = getFullPath(directory);
  const filePath = path === '' ? file.name : `${path}/${file.name}`;
  const selectedFileIndex = props.files.findIndex(
    (file) => file.name === filePath,
  );
  emit('update:selectedFileIndex', selectedFileIndex);
}

function getFullPath(directory: Directory): string {
  if (directory.parent === null) {
    return directory.name;
  }
  return directory.parent.parent === null
    ? directory.name
    : `${getFullPath(directory.parent)}/${directory.name}`;
}
</script>

<script lang="ts">
interface File {
  name: string;
  content: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { File };
</script>

<style scoped>
.files {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  width: 256px;
  overflow-y: scroll;
}

input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-2);
  border: 1px solid transparent;
  border-radius: var(--border-radius-s);
  outline: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);

  &::placeholder {
    color: var(--color-text-placeholder);
  }

  &:hover {
    background: var(--color-background-tertiary);
  }

  &:focus {
    border-color: var(--color-border-tertiary);
  }
}
</style>
