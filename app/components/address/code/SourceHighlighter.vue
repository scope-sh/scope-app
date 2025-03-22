<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="wrapper">
    <div
      ref="textEl"
      class="text"
      @scroll="handleScroll"
      v-html="html"
    />
    <ButtonCopy
      class="button"
      :value="value"
    />
  </div>
</template>

<script setup lang="ts">
import { transformerNotationWordHighlight } from '@shikijs/transformers';
import { type HighlighterGeneric, createHighlighter } from 'shiki';
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';

import ButtonCopy from '@/components/__common/ButtonCopy.vue';

type Language = 'Solidity' | 'Vyper' | 'JSON' | 'plaintext';

const {
  value,
  language,
  lineNumbers,
  initialLine = 1,
  highlight = null,
} = defineProps<{
  value: string;
  language: Language;
  lineNumbers: boolean;
  initialLine?: number;
  highlight?: string | null;
}>();

const emit = defineEmits<{
  scroll: [];
}>();

const textEl = useTemplateRef('textEl');

const highlighter = ref<HighlighterGeneric<'solidity', 'ayu-dark'> | null>(
  null,
);

onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: ['ayu-dark'],
    langs: ['solidity', 'vyper', 'json', 'plaintext'],
  });
});

const html = computed(() => {
  if (!highlighter.value) {
    return '';
  }
  const source = getHighlightSnippet(language, highlight) + value;
  return highlighter.value.codeToHtml(source, {
    lang: language.toLowerCase(),
    theme: 'ayu-dark',
    transformers: [transformerNotationWordHighlight()],
  });
});

watch(
  () => initialLine,
  () => {
    if (initialLine === 1) {
      return;
    }
    scrollToLine(initialLine);
  },
  {
    immediate: true,
  },
);

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrollToLine(line: number): Promise<void> {
  if (!textEl.value) {
    return;
  }
  await sleep(10);
  const lineEls = textEl.value.getElementsByClassName('line');
  const lineEl = lineEls[line - 1];
  if (!lineEl) {
    return;
  }

  const containerRect = textEl.value.getBoundingClientRect();
  const elementRect = lineEl.getBoundingClientRect();

  const offsetTop =
    elementRect.top -
    containerRect.top +
    textEl.value.scrollTop -
    textEl.value.clientHeight / 2 +
    elementRect.height / 2;

  textEl.value.scrollTop = offsetTop;
}

function handleScroll(): void {
  emit('scroll');
}

function getHighlightSnippet(language: Language, word: string | null): string {
  if (!word) {
    return '';
  }
  switch (language) {
    case 'Solidity':
      return `// [!code word:${word}]\n`;
    case 'Vyper':
      return `# [!code word:${word}]\n`;
    default:
      return '';
  }
}

const lineBeforeDisplay = computed(() =>
  lineNumbers ? 'inline-block' : 'none',
);
</script>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.text {
  --font-size: var(--font-size-m);
  --line-number-digits: 4;

  width: 100%;
  height: 100%;
  padding: var(--spacing-7);
  overflow: auto;
  transition: border-color 0.25s ease-in-out;
  border: 1px solid transparent;
  border-radius: var(--border-radius-m);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-size: var(--font-size);
}

.text :deep(pre) {
  margin: 0;
  background: inherit !important;
  word-break: break-all;
  white-space: pre-wrap;
  counter-reset: step;
  counter-increment: step 0;
}

.text :deep(.line) {
  font-family: var(--font-mono);
}

.text :deep(.line)::before {
  content: counter(step);
  display: v-bind('lineBeforeDisplay');
  width: calc(var(--line-number-digits) * var(--font-size-m) / 2);
  margin-right: 48px;
  color: var(--color-text-secondary);
  text-align: right;
  counter-increment: step;
}

.text :deep(.line) .highlighted-word {
  background: oklch(from var(--color-accent) l c h / 20%);
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
