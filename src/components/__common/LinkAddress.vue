<template>
  <ScopeLinkInternal
    :route="{
      name: 'address',
      address: address,
    }"
  >
    <div class="content">
      {{ address }}
    </div>
  </ScopeLinkInternal>
</template>

<script setup lang="ts">
import { Address } from 'viem';

import ScopeLinkInternal from './ScopeLinkInternal.vue';

defineProps<{
  address: Address;
}>();
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
</style>
