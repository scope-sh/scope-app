<template>
  <div
    class="view"
    :class="{
      tiny: props.size === 'tiny',
      regular: props.size === 'regular',
      large: props.size === 'large',
    }"
  >
    {{ value }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  value: string;
  size: Size;
  label?: string;
}>();
</script>

<script lang="ts">
type Size = 'tiny' | 'regular' | 'large';
</script>

<style scoped>
.view {
  --line-height: 1.2;
  --padding: var(--spacing-6);

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
  height: calc(
    var(--row-count) * var(--font-size-m) + (var(--row-count) - 1) *
      (var(--line-height) - 1) * var(--font-size-m) + var(--padding) * 2
  );
  padding: var(--padding);
  overflow: auto;
  border: 1px solid transparent;
  border-radius: var(--border-radius-s);
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-m);
  line-height: var(--line-height);
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
