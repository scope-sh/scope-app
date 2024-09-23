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
        <div>
          {{ hash }}
        </div>
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import type { Hex } from 'viem';

import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

const { type = 'normal' } = defineProps<{
  hash: Hex;
  type?: Type;
}>();
</script>
