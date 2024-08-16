<template>
  <div class="root">
    <router-link
      :to="to"
      class="link"
      :class="{ trimmed: type !== 'normal', highlighted: isHighlighted }"
    >
      <slot />
    </router-link>
    <div
      class="background"
      :class="{ trimmed: type !== 'normal', highlighted: isHighlighted }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Route } from '@/utils/routing';
import { getRouteLocation } from '@/utils/routing';

const props = withDefaults(
  defineProps<{
    route: Route;
    isHighlighted: boolean;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);

const to = computed(() => getRouteLocation(props.route));
</script>

<script lang="ts">
type Type = 'minimal' | 'copyable' | 'normal';

// eslint-disable-next-line import/prefer-default-export
export type { Type };
</script>

<style scoped>
.root {
  display: block;
  position: relative;
  flex: 0 1 auto;
  min-width: 1px;
  transition: all 0.2s ease-in-out;

  .background {
    position: absolute;
    z-index: -1;
    border: 1px dotted transparent;
    border-radius: var(--border-radius-xs);
    background: oklch(from var(--color-accent) l c h / 5%);
    inset: -2px -3px;
  }

  &:hover {
    .background {
      background: oklch(from var(--color-accent) l c h / 10%);
    }
  }

  .background.highlighted {
    border-radius: 2px;
    border-color: oklch(from var(--color-accent) l c h / 70%);
  }

  .background.trimmed {
    background: none;
  }
}

.link {
  --color-accent-toned-down: oklch(from var(--color-accent) l calc(c * 0.6) h);

  display: block;
  padding: 0;
  overflow: hidden;
  color: var(--color-accent);
  text-overflow: ellipsis;
  white-space: nowrap;

  &.trimmed {
    color: var(--color-accent-toned-down);

    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>
