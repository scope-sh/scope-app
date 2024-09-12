<template>
  <div class="label">
    <ScopeTooltip
      v-if="note"
      delay="small"
    >
      <template #trigger>
        <div class="value">
          {{ value }}
        </div>
      </template>
      <template #default>
        <div class="note">{{ note }}</div>
      </template>
    </ScopeTooltip>
    <div
      v-else
      class="label value"
    >
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import ScopeTooltip from '@/components/__common/ScopeTooltip.vue';

defineProps<{
  value: string;
  note?: string;
}>();
</script>

<style scoped>
.value {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
  text-align: left;
  text-transform: uppercase;
}

.note {
  max-width: 240px;
}

@media (width >= 768px) {
  .label {
    width: 224px;
  }

  .value {
    font-size: var(--font-size-m);
  }
}
</style>
