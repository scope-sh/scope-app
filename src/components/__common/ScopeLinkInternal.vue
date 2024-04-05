<template>
  <router-link
    :to="to"
    class="link"
    :class="{ minimal: type === 'minimal' }"
  >
    <slot />
    <div
      v-if="type === 'normal'"
      class="background"
    />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Route } from '@/utils/routing';
import { getRouteLocation } from '@/utils/routing';

type Type = 'minimal' | 'normal';

const props = withDefaults(
  defineProps<{
    route: Route;
    type: Type;
  }>(),
  {
    type: 'normal',
  },
);

const to = computed(() => getRouteLocation(props.route));
</script>

<style scoped>
.link {
  --color-accent-toned-down: oklch(from var(--color-accent) l calc(c * 0.6) h);

  display: inline-flex;
  position: relative;
  transition: all 0.2s ease-in-out;
  color: var(--color-accent);

  &.minimal {
    color: var(--color-accent-toned-down);

    &:hover {
      color: var(--color-accent);
    }
  }
}

.background {
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  border-radius: var(--border-radius-xs);
  opacity: 0.05;
  background: var(--color-accent);
}

.link:hover .background {
  opacity: 0.1;
}
</style>
