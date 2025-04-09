<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#62DFFF"
  >
    <path
      d="M308.114 343.725H157.95V185.52H192.308V313.078H308.114V343.725Z"
      :fill="kind === 'coloured' ? '#62DFFF' : 'currentColor'"
    />
    <path
      d="M308.482 217.58C325.382 217.58 339.087 203.875 339.087 186.971C339.087 170.067 325.382 156.362 308.482 156.362C291.573 156.362 277.869 170.067 277.869 186.971C277.869 203.875 291.573 217.58 308.482 217.58Z"
      :fill="kind === 'coloured' ? '#62DFFF' : 'currentColor'"
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
