<template>
  <LinkBase
    :value="hash"
    :type
  >
    <ScopeLinkInternal
      :route="{
        name: 'userop',
        hash,
      }"
      :type
      :is-highlighted
    >
      <slot>
        {{ hash }}
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import type { Hex } from 'viem';
import { computed, ref, watch } from 'vue';

import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

import useLinkHover from '@/composables/useLinkHover.js';

const { link, setLink } = useLinkHover();

const props = withDefaults(
  defineProps<{
    hash: Hex;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);

const el = ref();
const isHovered = useElementHover(el);
const isHighlighted = computed(() =>
  link.value
    ? link.value.type === 'userop' &&
      link.value.value === props.hash &&
      !isHovered.value
    : false,
);
watch(isHovered, (value) => {
  if (value) {
    setLink({
      type: 'userop',
      value: props.hash,
    });
  } else {
    setLink(null);
  }
});
</script>
