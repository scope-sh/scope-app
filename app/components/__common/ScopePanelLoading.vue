<template>
  <ScopePanel
    :title="title"
    :subtitle="subtitle"
  >
    <div class="content">
      <IconLoading />
    </div>
  </ScopePanel>
</template>

<script setup lang="ts">
import IconLoading from './IconLoading.vue';
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
</style>
