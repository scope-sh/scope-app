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
        <div>
          {{ number }}
        </div>
      </slot>
    </ScopeLinkInternal>
  </LinkBase>
</template>

<script setup lang="ts">
import LinkBase from './LinkBase.vue';
import ScopeLinkInternal, { type Type } from './ScopeLinkInternal.vue';

const { type = 'normal' } = defineProps<{
  number: bigint;
  type?: Type;
}>();
</script>
