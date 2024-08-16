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
      :is-highlighted
    >
      <slot>
        <div
          ref="el"
          class="address"
        >
          <LabelIcon
            :uri="labelIcon"
            class="icon"
          />
          <div v-if="labelText">{{ labelText }}</div>
          <div
            v-else
            class="label-address"
          >
            {{ address }}
          </div>
        </div>
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import { useElementHover } from '@vueuse/core';
import type { Address } from 'viem';
import { computed, ref, watch } from 'vue';

import LabelIcon from './LabelIcon.vue';
import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

import useLabels from '@/composables/useLabels.js';
import useLinkHover from '@/composables/useLinkHover.js';

const { getLabelIcon, getLabelText, requestLabel } = useLabels();
const { link, setLink } = useLinkHover();

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    address: Address;
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
    ? link.value.type === 'address' &&
      link.value.value === props.address &&
      !isHovered.value
    : false,
);
watch(isHovered, (value) => {
  if (value) {
    setLink({
      type: 'address',
      value: props.address,
    });
  } else {
    setLink(null);
  }
});

watch(
  () => props.address,
  (value) => {
    requestLabel(value, 'primary');
  },
  { immediate: true },
);

const labelText = computed(() => getLabelText(props.address));
const labelIcon = computed(() => getLabelIcon(props.address));
</script>

<style scoped>
.address {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
}

.icon {
  width: 1em;
  height: 1em;
}

.label-address {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
