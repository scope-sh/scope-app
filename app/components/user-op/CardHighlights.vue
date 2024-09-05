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
import { decodeSignature as biconomyV2DecodeSignature } from '@/utils/context/erc4337/biconomyV2';
import { decodeSignature as coinbaseSmartWalletV1DecodeSignature } from '@/utils/context/erc4337/coinbaseSmartWalletV1';
import type { UserOpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { decodeSignature as kernelV2DecodeSignature } from '@/utils/context/erc4337/kernelV2';
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
  if (labelType.id === 'kernel-v2-account') {
    const signature = props.userOp.signature;
    const decodedSignature = kernelV2DecodeSignature(signature);
    if (!decodedSignature) {
      return [];
    }
    if (decodedSignature.mode === 'sudo') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Validate with default validator',
            },
          ],
        },
      ] as Item[];
    }
    if (decodedSignature.mode === 'enable') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Enable',
            },
            {
              type: 'address',
              address: decodedSignature.validator,
            },
            {
              type: 'text',
              value: 'as validator',
            },
          ],
        },
      ] as Item[];
    }
    if (decodedSignature.mode === 'use') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Use custom validator',
            },
          ],
        },
      ] as Item[];
    }
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
  if (labelType.id === 'biconomy-v2-account') {
    const signature = props.userOp.signature;
    const decodedSignature = biconomyV2DecodeSignature(signature);
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
            address: decodedSignature.validator,
          },
        ],
      },
    ] as Item[];
  }
  if (labelType.id === 'coinbase-smart-wallet-v1-account') {
    const signature = props.userOp.signature;
    const decodedSignature = coinbaseSmartWalletV1DecodeSignature(signature);
    if (!decodedSignature) {
      return [];
    }
    return [
      {
        icon: label.iconUrl,
        parts: [
          {
            type: 'text',
            value: `Validate with owner #${decodedSignature.ownerIndex}`,
          },
        ],
      },
    ] as Item[];
  }
  return [];
});
</script>
