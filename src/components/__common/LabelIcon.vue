<template>
  <img
    v-if="url && canLoad"
    :src="url"
    alt="Address icon"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  url: string | null;
}>();

const canLoad = ref(true);

function handleError(): void {
  canLoad.value = false;
}
</script>

<style scoped>
img {
  border-radius: 50%;
}
</style>
