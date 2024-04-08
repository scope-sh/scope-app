<template>
  <ScopeLinkInternal
    :route="{
      name: 'address',
      address: address,
    }"
    :type
  >
    <slot>
      {{ address }}
    </slot>
  </ScopeLinkInternal>
</template>

<script setup lang="ts">
import { Address } from 'viem';

import ScopeLinkInternal, { Type } from './ScopeLinkInternal.vue';

withDefaults(
  defineProps<{
    address: Address;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);
</script>

<style scoped>
.content {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
</style>
