<template>
  <img
    v-if="url && canLoad"
    :src="url"
    alt="Address icon"
    @error="handleError"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const { uri } = defineProps<{
  uri: string | null;
}>();

const url = computed<string | null>(() => {
  if (!uri) {
    return null;
  }
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
});

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
