<template>
  <LinkBase
    :value="address"
    :type
  >
    <ScopeLinkInternal
      :route="{
        name: 'address',
        chain: chain,
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
          <ScopeTooltip
            v-if="labelText"
            delay="medium"
          >
            <template #trigger>
              {{ labelText }}
            </template>
            <template #default>
              {{ address }}
            </template>
          </ScopeTooltip>
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
import type { Address } from 'viem';
import { computed, watch } from 'vue';

import LabelIcon from './LabelIcon.vue';
import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';
import ScopeTooltip from './ScopeTooltip.vue';

import useLabels from '@/composables/useLabels.js';
import type { Chain } from '@/utils/chains.js';

const {
  address,
  chain,
  type = 'normal',
} = defineProps<{
  address: Address;
  chain?: Chain;
  type?: Type;
}>();

const { getLabelIcon, getLabelText, requestLabel } = useLabels(chain);

defineOptions({
  inheritAttrs: false,
});

watch(
  () => address,
  (value) => {
    requestLabel(value, 'primary');
  },
  { immediate: true },
);

const labelText = computed(() => getLabelText(address));
const labelIcon = computed(() => getLabelIcon(address));
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
