<template>
  <div
    ref="el"
    class="root"
  >
    <RouterLink
      :to="to"
      class="link"
      :class="{ trimmed: type !== 'normal', highlighted: isHighlighted }"
      @click.stop
    >
      <slot />
    </RouterLink>
    <div
      class="background"
      :class="{ trimmed: type !== 'normal', highlighted: isHighlighted }"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { computed, useTemplateRef, watch } from 'vue';
import { RouterLink } from 'vue-router';

import useLinkHover from '@/composables/useLinkHover.js';
import type { Route } from '@/utils/routing';
import { getRouteLocation } from '@/utils/routing';

const { route, type = 'normal' } = defineProps<{
  route: Route;
  type?: Type;
}>();

const { route: hoveredRoute, setRoute: setHoveredRoute } = useLinkHover();

const el = useTemplateRef('el');
const isHovered = useElementHover(el);
watch(isHovered, (value) => {
  if (value) {
    setHoveredRoute(route);
  } else {
    setHoveredRoute(null);
  }
});

const to = computed(() => getRouteLocation(route));

const isHighlighted = computed(() => {
  if (isHovered.value) {
    return false;
  }
  if (hoveredRoute.value) {
    switch (hoveredRoute.value.name) {
      case 'block':
        return (
          route.name === 'block' && route.number === hoveredRoute.value.number
        );
      case 'transaction':
        return (
          route.name === 'transaction' && route.hash === hoveredRoute.value.hash
        );
      case 'address':
        return (
          route.name === 'address' &&
          route.address === hoveredRoute.value.address
        );
      case 'op':
        return route.name === 'op' && route.hash === hoveredRoute.value.hash;
    }
  }
  return false;
});
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
    background: oklch(from var(--color-accent) l c h / 10%);
    inset: -2px -3px;
  }

  &:hover {
    .background {
      background: oklch(from var(--color-accent) l c h / 15%);
    }
  }

  .background.highlighted {
    border-style: dashed;
    border-radius: 2px;
    border-color: oklch(from var(--color-accent) l c h / 80%);
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
