<template>
  <ScopeLinkInternal
    :route="{
      name: 'transaction',
      hash,
    }"
    :type
  >
    <slot>
      {{ hash }}
    </slot>
  </ScopeLinkInternal>
</template>

<script setup lang="ts">
import { Hex } from 'viem';

import ScopeLinkInternal, { Type } from './ScopeLinkInternal.vue';

withDefaults(
  defineProps<{
    hash: Hex;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);
</script>
