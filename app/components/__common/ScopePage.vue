<template>
  <div class="page">
    <main>
      <slot />
    </main>
    <div class="content">
      <div
        v-if="sections.length > 1"
        class="sections"
      >
        <ScopeTabs
          v-model="section"
          :options="sections"
        />
      </div>
      <slot name="section" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScopeTabs from './ScopeTabs.vue';

const section = defineModel<Section['value']>('section');

defineProps<{
  sections: Section[];
}>();
</script>

<script lang="ts">
interface Section {
  label: string;
  value: string;
}

// eslint-disable-next-line import/prefer-default-export
export type { Section };
</script>

<style scoped>
.page {
  display: flex;
  gap: var(--spacing-7);
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-5) 8px;

  @media (width >= 992px) {
    padding: var(--spacing-10) 96px 16px;
  }
}

main {
  display: flex;
  gap: var(--spacing-10);
  flex-direction: column;
  width: 100%;
}

.content {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
  width: 100%;
}

.sections {
  display: flex;
  justify-content: start;
  width: 100%;
}
</style>
