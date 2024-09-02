<template>
  <BaseCard
    v-if="items.length > 0"
    :items
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Item } from '@/components/__common/CardHighlights.vue';
import BaseCard from '@/components/__common/CardHighlights.vue';
import useLabels from '@/composables/useLabels';
import type { UserOpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { decodeNonce as kernelV3DecodeNonce } from '@/utils/context/erc7579/kernelV3';

const { getLabel } = useLabels();

const props = defineProps<{
  userOp: UserOpUnpacked;
}>();

const items = computed<Item[]>(() => {
  const sender = props.userOp.sender;
  const label = getLabel(sender);
  if (!label) {
    return [];
  }
  const labelType = label.type;
  if (!labelType) {
    return [];
  }
  if (labelType.id === 'kernel-v3-account') {
    const nonce = props.userOp.nonce;
    const decodedNonce = kernelV3DecodeNonce(nonce);
    if (!decodedNonce) {
      return [];
    }
    return [
      {
        icon: label.iconUrl,
        parts: [
          {
            type: 'text',
            value: 'Validate with',
          },
          {
            type: 'address',
            address: decodedNonce.identifier,
          },
        ],
      },
    ] as Item[];
  }
  return [];
});
</script>
