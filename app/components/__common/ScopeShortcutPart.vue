<template>
  <div>
    <div
      class="shortcut"
      :class="{ small: size === 'small', regular: size === 'regular' }"
    >
      <span
        v-if="value.isMeta"
        class="meta"
      >
        {{ metaKeyLabel }}
      </span>
      {{ value.key }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ShortcutPart } from '@/utils/shortcuts';

type Size = 'small' | 'regular';

defineProps<{
  size: Size;
  value: ShortcutPart;
}>();

const metaKeyLabel = /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)
  ? '⌘'
  : 'Ctrl';
</script>

<style scoped>
.shortcut {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  border-radius: var(--border-radius-xs);
  background: var(--color-background-secondary);
  box-shadow: var(--elevation-low);
  font-family: var(--font-mono);

  &.regular {
    padding: 3px 5px;
  }

  &.small {
    padding: 3px 4px;
    font-size: var(--font-size-s);
  }
}

.meta {
  padding-top: 2px;
  font-size: var(--font-size-l);
  line-height: 13px;
}
</style>
