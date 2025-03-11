<template>
  <div class="branch">
    <div
      v-for="(arg, index) in args"
      :key="arg.name"
      class="branch-part"
      :class="{ terminal: isPrimitiveType(arg.type) }"
    >
      <div class="key">
        {{ getKey(arg, index) }}
      </div>
      <div
        v-if="arg.type && arg.type.startsWith('tuple[')"
        class="tuple-array"
      >
        <template
          v-for="(argItem, itemIndex) in arg.value as unknown[][]"
          :key="itemIndex"
        >
          <div class="key">{{ itemIndex }}</div>
          <ArgumentTreeBranch
            :args="getArguments(argItem)"
            :top-level="false"
          />
        </template>
      </div>
      <ArgumentTreeBranch
        v-else-if="arg.value instanceof Array"
        :args="getArguments(arg.value as unknown[])"
        :top-level="false"
      />
      <LinkAddress
        v-else-if="arg.type === 'address'"
        :address="getAddress(arg.value)"
        type="copyable"
        class="value"
      />
      <ArgumentTreeLeaf
        v-else
        :value="arg.value"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import LinkAddress from '../LinkAddress.vue';

// eslint-disable-next-line import/no-self-import
import ArgumentTreeBranch from './ArgumentTreeBranch.vue';
import ArgumentTreeLeaf from './ArgumentTreeLeaf.vue';
import type { Argument } from './common';
import { isPrimitiveType } from './common';

const { topLevel } = defineProps<{
  args: Argument[];
  topLevel: boolean;
}>();

function getArguments(args: unknown[]): Argument[] {
  return args as Argument[];
}

function getAddress(value: unknown): Address {
  return (value as Address).toLowerCase() as Address;
}

function getKey(arg: Argument, index: number): string {
  const type = topLevel
    ? arg.internalType || arg.type
    : arg.name
      ? arg.internalType || arg.type
      : '';
  const name = topLevel ? arg.name || '' : arg.name || index;
  return `${type} ${arg.indexed ? 'indexed' : ''} ${name}`;
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
    flex: 0 0 160px;
    overflow: hidden;
    color: var(--color-text-secondary);
    text-overflow: ellipsis;
  }

  @media (width >= 768px) {
    & > .key {
      flex: 0 0 240px;
      white-space: nowrap;
    }
  }

  &:not(.terminal) {
    & > .key {
      flex: 0 0 100%;
    }
  }

  & > .value {
    flex: 0 1 auto;
    min-width: 1px;
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
