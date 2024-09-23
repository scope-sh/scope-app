<template>
  <div class="panel">
    <div class="header">
      <div class="header-side">
        <h2 class="title">{{ title }}</h2>
        <ScopeTooltip
          v-if="subtitle"
          delay="large"
          disable-closing-trigger
        >
          <template #trigger>
            <div
              class="subtitle"
              @click="handleSubtitleClick"
            >
              {{ subtitle }}
            </div>
          </template>
          <template #default>
            <div v-if="ready">Click to copy</div>
            <div v-else>Copied!</div>
          </template>
        </ScopeTooltip>
      </div>
      <div class="header-side">
        <slot name="header" />
      </div>
    </div>
    <div
      v-if="loading"
      class="content loading"
    >
      <slot />
      <div class="loading-view">
        <IconLoading />
      </div>
    </div>
    <div
      v-else
      class="content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimeout } from '@vueuse/core';
import { onMounted } from 'vue';

import IconLoading from './IconLoading.vue';
import ScopeTooltip from './ScopeTooltip.vue';

const { subtitle = '' } = defineProps<{
  title: string;
  subtitle?: string;
  loading?: boolean;
}>();

onMounted(() => {
  stop();
});

const { ready, start, stop } = useTimeout(2000, { controls: true });

function handleSubtitleClick(): void {
  copyToClipboard(subtitle);
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
  start();
}
</script>

<style scoped>
.panel {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  width: 100%;
  padding: var(--spacing-8) var(--spacing-6);
  scroll-margin-top: var(--spacing-8);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-l);
}

@media (width >= 768px) {
  .panel {
    padding: var(--spacing-9) var(--spacing-8);
  }
}

.header {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  justify-content: space-between;
}

.header-side {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  overflow: hidden;
}

.title {
  margin: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  font-weight: var(--font-weight-regular);
}

.subtitle {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-l);
  font-weight: var(--font-weight-light);
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.content {
  display: flex;
  gap: var(--spacing-9);
  flex-direction: column;
}

.loading {
  position: relative;
}

.loading-view {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--color-background-primary);
}
</style>
