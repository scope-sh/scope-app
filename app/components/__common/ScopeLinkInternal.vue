<template>
  <router-link
    :to="to"
    class="root"
    :class="{ trimmed: type !== 'normal' }"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Route } from '@/utils/routing';
import { getRouteLocation } from '@/utils/routing';

const props = withDefaults(
  defineProps<{
    route: Route;
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
  --color-accent-toned-down: oklch(from var(--color-accent) l calc(c * 0.6) h);

  display: block;
  flex: 1;
  padding: 2px;
  overflow: hidden;
  transition: all 0.2s ease-in-out;
  border-radius: var(--border-radius-xs);
  background: oklch(from var(--color-accent) l c h / 5%);
  color: var(--color-accent);
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: oklch(from var(--color-accent) l c h / 10%);
  }

  &.trimmed {
    padding: 0;
    background: none;
    color: var(--color-accent-toned-down);

    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>
