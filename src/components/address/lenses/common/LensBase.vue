<template>
  <div
    v-if="isLoading"
    class="content"
  >
    <IconLoading />
  </div>
  <AttributeList v-else>
    <slot />
  </AttributeList>
</template>

<script setup lang="ts">
import IconLoading from '@/components/__common/IconLoading.vue';
import { AttributeList } from '@/components/__common/attributes';

defineProps<{
  isLoading: boolean;
}>();
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}
</style>
