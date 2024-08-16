<template>
  <LinkBase
    :value="number.toString()"
    :type
  >
    <ScopeLinkInternal
      :route="{
        name: 'block',
        number,
      }"
      :type
      :is-highlighted
    >
      <slot>
        <div ref="el">
          {{ number }}
        </div>
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

import useLinkHover from '@/composables/useLinkHover.js';

const { link, setLink } = useLinkHover();

const props = withDefaults(
  defineProps<{
    number: bigint;
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
    ? link.value.type === 'block' &&
      link.value.value === props.number &&
      !isHovered.value
    : false,
);
watch(isHovered, (value) => {
  if (value) {
    setLink({
      type: 'block',
      value: props.number,
    });
  } else {
    setLink(null);
  }
});
</script>
