<template>
  <LinkBase
    :value="address"
    :type
  >
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
  </LinkBase>
</template>

<script setup lang="ts">
import { Address } from 'viem';
import { computed, watch } from 'vue';

import useLabels from '@/composables/useLabels.js';

import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { Type } from './ScopeLinkInternal.vue';

const { getLabelText, requestLabel } = useLabels();

const props = withDefaults(
  defineProps<{
    address: Address;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);

watch(
  () => props.address,
  (value) => {
    requestLabel(value);
  },
  { immediate: true },
);

const labelText = computed(() => getLabelText(props.address));
</script>
