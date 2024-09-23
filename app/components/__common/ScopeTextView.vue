<template>
  <div
    class="view"
    :class="{
      tiny: size === 'tiny',
      regular: size === 'regular',
      large: size === 'large',
      error: type === 'error',
    }"
  >
    {{ value }}
  </div>
</template>

<script setup lang="ts">
const { type = 'text' } = defineProps<{
  value: string;
  size: Size;
  type?: Type;
}>();
</script>

<script lang="ts">
type Size = 'tiny' | 'regular' | 'large';
type Type = 'text' | 'error';
</script>

<style scoped>
.view {
  --line-height: 1.2;
  --padding: var(--spacing-6);
  --border: 1px;
  --font-size: var(--font-size-m);

  &.tiny {
    --row-count: 1;
  }

  &.regular {
    --row-count: 6;
  }

  &.large {
    --row-count: 12;
  }

  width: 100%;
  max-height: calc(
    2 * var(--padding) + 2 * var(--border) + var(--row-count) *
      round(down, calc(var(--font-size) * var(--line-height)), 1px)
  );
  padding: var(--padding);
  overflow: auto;
  border: var(--border) solid transparent;
  border-radius: var(--border-radius-s);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  font-size: var(--font-size);
  line-height: var(--line-height);
  word-break: break-all;
  white-space: pre-wrap;

  &.error {
    border-color: var(--color-error);
  }
}
</style>
