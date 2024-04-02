<template>
  <router-link
    :to="to"
    class="link"
  >
    <slot />
    <div class="background" />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Route } from '@/utils/routing';
import { getRouteLocation } from '@/utils/routing';

const props = defineProps<{
  route: Route;
}>();

const to = computed(() => getRouteLocation(props.route));
</script>

<style scoped>
.link {
  display: inline-flex;
  position: relative;
  color: var(--color-accent);
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
