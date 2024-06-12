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

const props = defineProps<{
  uri: string | null;
}>();

const url = computed<string | null>(() => {
  if (!props.uri) {
    return null;
  }
  if (props.uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${props.uri.slice(7)}`;
  }
  return props.uri;
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
