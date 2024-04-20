<template>
  <LinkBase
    :value="hash"
    :type
  >
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
  </LinkBase>
</template>

<script setup lang="ts">
import { Hex } from 'viem';

import LinkBase from './LinkBase.vue';
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
