<template>
  <BaseChainIcon
    :kind="kind"
    :type="type"
    color="#DFFE00"
  >
    <path
      d="M305.913 125L257.462 268.094V310.077H241.575V268.094L193.124 125H115V375H167.464V250.422L146.5 179.355L161.43 173.782L229.562 374.993H269.475L337.607 173.782L352.537 179.355L331.573 250.422V375H384.037V125H305.913Z"
      :fill="kind === 'coloured' ? '#DFFE00' : 'currentColor'"
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
