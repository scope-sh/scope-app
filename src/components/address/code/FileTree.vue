<template>
  <div class="files">
    <input
      v-model="filter"
      placeholder="Filter"
    />
    <FileTreeDirectory
      :directory="rootDirectory"
      :selection="fileSelection"
      @select="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import FileTreeDirectory, {
  Directory,
  FileSelection,
} from './FileTreeDirectory.vue';

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
  const fileIndex = current.files.findIndex((f) => f === fileName);
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
        };

        current.directories.push(newDirectory);
        current = newDirectory;
      }
    }

    const fileName = path.at(-1);
    if (!fileName) {
      return;
    }
    if (!fileName.toLowerCase().includes(filter.value.toLowerCase())) {
      return;
    }
    current.files.push(fileName);
  });

  return root;
});

const filter = ref<string>('');

function handleFileSelect(directory: Directory, fileIndex: number): void {
  const selectedFileIndex = props.files.findIndex(
    (file) =>
      file.name === `${getFullPath(directory)}/${directory.files[fileIndex]}`,
  );
  emit('update:selectedFileIndex', selectedFileIndex);
}

function getFullPath(directory: Directory): string {
  if (directory.parent === null) {
    return directory.name;
  }
  const parentPath = getFullPath(directory.parent);
  return directory.parent.parent === null
    ? directory.name
    : `${parentPath}/${directory.name}`;
}
</script>

<script lang="ts">
interface File {
  name: string;
  content: string;
}

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
  border: none;
  border-radius: var(--border-radius-s);
  outline: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);

  &::placeholder {
    color: var(--color-text-placeholder);
  }
}
</style>
