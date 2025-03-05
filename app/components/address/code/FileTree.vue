<template>
  <Tree.Root
    v-model:expanded="directoryIds"
    :items
    :get-key="(item) => item.id"
    :get-children="getChildren"
    class="root"
  >
    <FileTreeDirectory
      :directory="directory"
      :selection
      @select="handleSelect"
    />
  </Tree.Root>
</template>

<script setup lang="ts">
import { Tree } from 'reka-ui/namespaced';
import { computed, ref, watch } from 'vue';

import FileTreeDirectory, {
  type Directory,
  type Node,
  type FileSelection,
} from './FileTreeDirectory.vue';

const { directory } = defineProps<{
  directory: Directory;
  selection: FileSelection | null;
}>();

const emit = defineEmits<{
  select: [directory: Directory, index: number];
}>();

function handleSelect(directory: Directory, index: number): void {
  emit('select', directory, index);
}

const items = computed<Node[]>(() => [directory]);

function getChildren(item: Node): Node[] | undefined {
  if (!('files' in item)) {
    return undefined;
  }
  return !item.files
    ? item.directories
    : !item.directories
      ? item.files
      : [...item.directories, ...item.files];
}

const directoryIds = ref<string[]>([]);

watch(
  () => directory,
  () => {
    const ids = new Set<string>();
    const stack = [directory];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      ids.add(current.id);
      stack.push(...current.directories);
    }

    directoryIds.value = [...ids];
  },
  { immediate: true },
);
</script>

<style scoped>
.root {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
</style>
