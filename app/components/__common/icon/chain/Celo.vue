<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#FDFF52"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M372.18 127.82H127.819V372.18H372.175V286.882H331.622C317.643 317.999 286.179 339.672 250.17 339.672C200.529 339.672 160.328 299.124 160.328 249.829C160.328 200.534 200.529 160.333 250.17 160.333C286.877 160.333 318.342 182.708 332.326 214.519H372.18V127.82Z"
      :fill="kind === 'coloured' ? '#FDFF52' : 'currentColor'"
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
