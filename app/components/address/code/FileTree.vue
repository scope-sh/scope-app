<template>
  <Tree.Root
    :items="[directory]"
    :get-key="(item) => item.id"
    :default-expanded="directoryIds"
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
import { Tree } from 'radix-vue/namespaced';
import { computed } from 'vue';

import FileTreeDirectory, {
  type Directory,
  type FileSelection,
} from './FileTreeDirectory.vue';

const props = defineProps<{
  directory: Directory;
  selection: FileSelection | null;
}>();

const emit = defineEmits<{
  select: [directory: Directory, index: number];
}>();

function handleSelect(directory: Directory, index: number): void {
  emit('select', directory, index);
}

const directoryIds = computed<string[]>(() => {
  const ids = new Set<string>();
  const stack = [props.directory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    ids.add(current.id);
    stack.push(...current.directories);
  }

  return [...ids];
});
</script>

<style scoped>
.root {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
</style>
