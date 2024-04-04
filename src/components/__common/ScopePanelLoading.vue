<template>
  <ScopePanel
    :title="title"
    :subtitle="subtitle"
  >
    <div class="content">
      <IconBrand class="icon" />
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import IconBrand from './IconBrand.vue';
import ScopePanel from './ScopePanel.vue';

defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.icon {
  --color: oklch(from var(--color-accent) l calc(c * 0.4) h / 100%);

  width: 32px;
  height: 32px;
  animation: glow 1.5s infinite alternate;
  opacity: 0.75;
  color: var(--color);
}

@keyframes glow {
  0% {
    color: var(--color);
    filter: drop-shadow(0 0 5px oklch(from var(--color) l c h / 80%))
      drop-shadow(0 0 10px oklch(from var(--color) l c h / 60%))
      drop-shadow(0 0 15px oklch(from var(--color) l c h / 40%));
  }

  100% {
    color: oklch(from var(--color) l c h / 60%);
    filter: drop-shadow(0 0 5px oklch(from var(--color) l c h / 60%))
      drop-shadow(0 0 10px oklch(from var(--color) l c h / 40%));
  }
}
</style>
