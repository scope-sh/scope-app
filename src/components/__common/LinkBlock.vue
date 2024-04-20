<template>
  <ScopeLinkInternal
    :route="{
      name: 'block',
      number,
    }"
    :type
  >
    <slot>
      {{ number }}
    </slot>
  </ScopeLinkInternal>
</template>

<script setup lang="ts">
import ScopeLinkInternal, { Type } from './ScopeLinkInternal.vue';

withDefaults(
  defineProps<{
    number: bigint;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);
</script>
