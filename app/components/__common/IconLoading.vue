<template>
  <IconBrand class="icon" />
</template>

<script setup lang="ts">
import IconBrand from '@/components/__common/IconBrand.vue';
</script>

<style scoped>
.icon {
  --color-outline: oklch(from var(--color-accent) l calc(c * 0.2) h / 100%);
  --color-glow: oklch(from var(--color-accent) l calc(c * 0.8) h / 100%);

  width: 32px;
  height: 32px;
  animation: glow 1.5s infinite alternate;
  color: var(--color-outline);
}

@keyframes glow {
  0% {
    color: var(--color-outline);
    filter: drop-shadow(0 0 5px oklch(from var(--color-glow) l c h / 80%))
      drop-shadow(0 0 10px oklch(from var(--color-glow) l c h / 60%))
      drop-shadow(0 0 15px oklch(from var(--color-glow) l c h / 40%));
  }

  100% {
    color: oklch(from var(--color-outline) l c h / 60%);
    filter: drop-shadow(0 0 5px oklch(from var(--color-glow) l c h / 60%))
      drop-shadow(0 0 10px oklch(from var(--color-glow) l c h / 40%));
  }
}
</style>
