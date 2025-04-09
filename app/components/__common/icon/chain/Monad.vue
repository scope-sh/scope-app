<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#6E54FF"
  >
    <path
      d="M245.898 67.6542C193.241 67.6542 63.552 197.339 63.552 249.999C63.552 302.659 193.241 432.346 245.898 432.346C298.555 432.346 428.246 302.657 428.246 249.999C428.246 197.341 298.557 67.6542 245.898 67.6542ZM217.482 354.27C195.278 348.219 135.577 243.788 141.629 221.583C147.681 199.377 252.11 139.678 274.315 145.73C296.521 151.781 356.222 256.21 350.17 278.416C344.119 300.623 239.688 360.322 217.482 354.27Z"
      :fill="kind === 'coloured' ? '#6E54FF' : 'currentColor'"
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
