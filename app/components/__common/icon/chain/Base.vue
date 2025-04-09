<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#2151F5"
  >
    <path
      d="M18.4363 230.034H327.647V270.447H18.4363V230.034Z"
      :fill="kind === 'coloured' ? '#2151F5' : 'currentColor'"
    />
  </BaseChainIcon>
</template>

<script setup lang="ts">
import BaseChainIcon from './BaseChainIcon.vue';
import type { ChainType, Kind } from './kind';

defineProps<{
  kind: Kind;
  type: ChainType;
}>();
</script>
