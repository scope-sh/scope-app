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
        <div class="address">
          <LabelIcon
            :uri="labelIcon"
            class="icon"
          />
          <span>{{ labelText || address }}</span>
        </div>
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { computed, watch } from 'vue';

import LabelIcon from './LabelIcon.vue';
import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

import useLabels from '@/composables/useLabels.js';

const { getLabelIcon, getLabelText, requestLabel } = useLabels();

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
</style>
