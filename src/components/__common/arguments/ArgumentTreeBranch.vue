<template>
  <div class="branch">
    <div
      v-for="(arg, index) in args"
      :key="arg.name"
      class="branch-part"
      :class="{ terminal: isPrimitiveType(arg.type) }"
    >
      <div class="key">
        {{ arg.internalType || arg.type }} {{ arg.indexed ? 'indexed' : '' }}
        {{ arg.name || index }}
      </div>
      <div
        v-if="arg.type === 'tuple[]'"
        class="tuple-array"
      >
        <template
          v-for="(argItem, itemIndex) in arg.value as unknown[][]"
          :key="itemIndex"
        >
          <div class="key">{{ itemIndex }}</div>
          <ArgumentTreeBranch :args="getArguments(argItem)" />
        </template>
      </div>
      <ArgumentTreeBranch
        v-else-if="arg.value instanceof Array"
        :args="getArguments(arg.value as unknown[])"
      />
      <LinkAddress
        v-else-if="arg.type === 'address'"
        :address="getAddress(arg.value)"
        type="minimal"
      />
      <ArgumentTreeLeaf
        v-else
        :value="arg.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Address } from 'viem';

import LinkAddress from '../LinkAddress.vue';

import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import ArgumentTreeLeaf from './ArgumentTreeLeaf.vue';
import { Argument, isPrimitiveType } from './common';

defineProps<{
  args: Argument[];
}>();

function getArguments(args: unknown[]): Argument[] {
  return args as Argument[];
}

function getAddress(value: unknown): Address {
  return (value as Address).toLowerCase() as Address;
}
</script>

<style scoped>
.branch {
  margin-left: 20px;
}

.branch-part {
  display: flex;
  flex-direction: column;
  column-gap: var(--spacing-4);
  line-height: 1.4;

  &.terminal {
    flex-direction: row;
  }

  & > .key {
    min-width: 240px;
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:not(.terminal) {
    & > .key {
      min-width: 100%;
      max-width: 100%;
    }
  }
}

.metadata {
  display: flex;
  gap: var(--spacing-2);
}

.tuple-array {
  margin-left: 20px;
}
</style>
