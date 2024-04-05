<template>
  <div class="page">
    <div class="header">
      <ScopeTabs
        v-model="section"
        :options="sections"
      />
    </div>
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import ScopeTabs from './ScopeTabs.vue';

defineProps<{
  sections: Section[];
}>();

const section = defineModel<Section['value']>('section');
</script>

<script lang="ts">
interface Section {
  label: string;
  value: string;
}

export type { Section };
</script>

<style scoped>
.page {
  display: flex;
  gap: var(--spacing-7);
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-5) 8px;

  @media (width > 768px) {
    padding: var(--spacing-10) 96px 48px;
  }
}

.header {
  display: flex;
  justify-content: end;
  width: 100%;
}

main {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  width: 100%;
}
</style>
