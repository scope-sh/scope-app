<template>
  <LinkBase
    :value="number.toString()"
    :type
  >
    <ScopeLinkInternal
      :route="{
        name: 'block',
        number,
      }"
      :type
    >
      <slot>
        {{ number }}
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

withDefaults(
  defineProps<{
    number: bigint;
    type?: Type;
  }>(),
  {
    type: 'normal',
  },
);
</script>
