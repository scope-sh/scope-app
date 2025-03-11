<template>
  <div class="stack">
    <div class="sides">
      <AttributeList class="side">
        <AttributeItem>
          <AttributeItemLabel value="Name" />
          <AttributeItemValue>{{ source.name }}</AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="EVM" />
          <AttributeItemValue>{{ source.evm }}</AttributeItemValue>
        </AttributeItem>
      </AttributeList>
      <AttributeList class="side">
        <AttributeItem>
          <AttributeItemLabel value="Compiler" />
          <AttributeItemValue :note="source.compiler.version">
            {{ source.compiler.type }}
          </AttributeItemValue>
        </AttributeItem>
        <AttributeItem>
          <AttributeItemLabel value="Optimization" />
          <AttributeItemValue v-if="source.compilation.optimization">
            {{ source.compilation.optimization.runs }} runs
          </AttributeItemValue>
          <AttributeItemValue v-else>—</AttributeItemValue>
        </AttributeItem>
      </AttributeList>
    </div>
    <AttributeList v-if="size(source.constructorArguments) > 0">
      <AttributeItem>
        <AttributeItemLabel value="Constructor Arguments" />
        <AttributeItemValue>
          <div class="constructor">
            <ScopeToggle
              v-model="selectedConstructorView"
              :options="constructorViewOptions"
            />
            <ViewConstructor
              :view="selectedConstructorView"
              :address
              :constructor-data="source.constructorArguments"
            />
          </div>
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </div>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { size } from 'viem';
import { computed, ref } from 'vue';

import ViewConstructor from './ViewConstructor.vue';
import type { ConstructorView } from './ViewConstructor.vue';

import type { Option as ToggleOption } from '@/components/__common/ScopeToggle.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import type { SourceCode } from '@/services/api';

const { source } = defineProps<{
  address: Address;
  source: SourceCode;
}>();

const selectedConstructorView = ref<ConstructorView>('decoded');
const constructorViewOptions = computed<ToggleOption<ConstructorView>[]>(() => [
  {
    value: 'decoded',
    icon: 'text',
  },
  {
    value: 'hex',
    icon: 'hex-string',
  },
]);
</script>

<style scoped>
.stack {
  --spacing: var(--spacing-5);

  display: flex;
  gap: var(--spacing);
  flex-direction: column;
}

.sides {
  display: flex;
  row-gap: var(--spacing);
  flex-flow: column wrap;
}

@media (width >= 768px) {
  .sides {
    flex-direction: row;
    font-size: var(--font-size-m);
  }
}

.side {
  flex: 1;
}

.constructor {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  width: 100%;
}
</style>
