<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#bfbfbf"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M248.024 36.2544L380.485 254.241L248.063 331.4L118.713 254.207L248.024 36.2544ZM248.217 72.7683L144.445 247.673L248.178 309.578L354.478 247.639L248.217 72.7683Z"
      :fill="kind === 'coloured' ? '#bfbfbf' : 'currentColor'"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M118.022 280.449L248.12 357.498L378.219 280.449L248.12 463.598L118.022 280.449ZM184.61 341.731L248.12 431.139L311.631 341.731L248.12 379.344L184.61 341.731Z"
      :fill="kind === 'coloured' ? '#bfbfbf' : 'currentColor'"
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
