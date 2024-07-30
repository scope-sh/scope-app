<template>
  <div id="app">
    <AppHeader v-if="!isChainPage" />
    <NuxtPage />
    <AppFooter v-if="!isChainPage" />
    <CommandPalette />
    <Toast
      :value="activeToast"
      @close="hideToast"
    />
  </div>
</template>

<script setup lang="ts">
import '@fontsource-variable/inter';
import '@fontsource/inconsolata/400.css';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { useSeoMeta } from '#imports';
import CommandPalette from '@/components/_app/CommandPalette.vue';
import AppFooter from '@/components/_app/Footer.vue';
import AppHeader from '@/components/_app/Header.vue';
import Toast from '@/components/_app/Toast.vue';
import useToast from '@/composables/useToast.js';

const route = useRoute();

const { active: activeToast, hide: hideToast } = useToast();

const isChainPage = computed(() => route.name === 'chain');

useSeoMeta({
  title: 'scope',
  ogTitle: 'scope',
  description: 'block explorer for builders in aa',
  ogDescription: 'block explorer for builders in aa',
  ogImage: 'https://alpha.scope.sh/social.png',
  twitterCard: 'summary_large_image',
});
</script>

<style>
:root {
  --color-text-primary: oklch(90.67% 0 0deg);
  --color-text-secondary: oklch(69.6% 0 0deg);
  --color-text-placeholder: oklch(55.55% 0 0deg);
  --color-background-primary: oklch(21.26% 0.007 314.68deg);
  --color-background-secondary: oklch(25.16% 0.008 308.11deg);
  --color-border-primary: oklch(81.03% 0.04 87.57deg);
  --color-border-secondary: oklch(63.03% 0.021 90.62deg);
  --color-border-tertiary: oklch(35.83% 0.014 280.02deg);
  --color-border-quaternary: oklch(49.51% 0.019 278.16deg);
  --color-accent: oklch(86.41% 0.102 88.3deg);
  --color-success: oklch(76.61% 0.168 161.85deg);
  --color-error: oklch(64.66% 0.178 30.98deg);
  --font-general: 'Inter Variable', -apple-system, 'BlinkMacSystemFont',
    avenir next, avenir, segoe ui, helvetica neue, helvetica, 'Ubuntu', roboto,
    noto, arial, sans-serif;
  --font-mono: 'Inconsolata', 'Menlo', 'Consolas', 'Monaco', 'Liberation Mono',
    'Lucida Console', monospace;
  --font-weight-light: 200;
  --font-weight-regular: 400;
  --font-weight-heavy: 600;
  --font-size-xs: 11px;
  --font-size-s: 12px;
  --font-size-m: 14px;
  --font-size-l: 16px;
  --font-size-xl: 20px;
  --spacing-1: 2px;
  --spacing-2: 4px;
  --spacing-3: 6px;
  --spacing-4: 8px;
  --spacing-5: 10px;
  --spacing-6: 12px;
  --spacing-7: 16px;
  --spacing-8: 20px;
  --spacing-9: 24px;
  --spacing-10: 32px;
  --border-radius-xs: 2px;
  --border-radius-s: 4px;
  --border-radius-m: 8px;
  --border-radius-l: 12px;
}

body {
  margin: 0;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-family: var(--font-general);
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-regular);
}

a {
  color: inherit;
  text-decoration: none;
}

/* Reset */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

#app {
  isolation: isolate;
}
</style>
