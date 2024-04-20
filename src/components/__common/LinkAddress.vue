<template>
  <ScopeLinkInternal
    :route="{
      name: 'address',
      address: address,
    }"
    :type
  >
    <slot>
      {{ labelText || address }}
    </slot>
  </ScopeLinkInternal>
</template>

<script setup lang="ts">
import { Address } from 'viem';
import { computed } from 'vue';

import useLabels from '@/composables/useLabels.js';

import ScopeLinkInternal, { Type } from './ScopeLinkInternal.vue';

const { getLabelText } = useLabels();

const props = withDefaults(
  defineProps<{
    address: Address;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);

const labelText = computed(() => getLabelText(props.address));
</script>
