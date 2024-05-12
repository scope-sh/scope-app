<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="wrapper">
    <div
      class="text"
      v-html="html"
    />
    <ButtonCopy
      class="button"
      :value="value"
    />
  </div>
</template>

<script setup lang="ts">
import { getHighlighter } from 'shiki';
import { ref, watch } from 'vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';

type Language = 'Solidity' | 'Vyper' | 'JSON' | 'plaintext';

const props = defineProps<{
  value: string;
  language: Language;
}>();

const html = ref<string>('');

watch(
  () => props.value,
  async () => {
    const highlighter = await getHighlighter({
      themes: ['ayu-dark'],
      langs: ['solidity', 'vyper', 'json', 'plaintext'],
    });
    html.value = highlighter.codeToHtml(props.value, {
      lang: props.language.toLowerCase(),
      theme: 'ayu-dark',
    });
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.text {
  width: 100%;
  height: 100%;
  padding: var(--spacing-7);
  overflow: auto;
  transition: border-color 0.25s ease-in-out;
  border: 1px solid transparent;
  border-radius: var(--border-radius-m);
  background: #201e21;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
}

.text :deep(pre) {
  margin: 0;
  background: inherit !important;
  word-break: break-all;
  white-space: pre-wrap;
}

.text :deep(span) {
  font-family: var(--font-mono);
}

.button {
  display: none;
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-background-secondary);
}

.wrapper:hover .button {
  display: initial;
}
</style>
