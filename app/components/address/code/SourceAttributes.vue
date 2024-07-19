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
          <ScopeTextView
            :value="source.constructorArguments"
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </div>
</template>

<script setup lang="ts">
import { size } from 'viem';

import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
  AttributeList,
} from '@/components/__common/attributes';
import type { SourceCode } from '@/services/api';

defineProps<{
  source: SourceCode;
}>();
</script>

<style scoped>
.stack {
  --spacing: var(--spacing-5);

  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.sides {
  display: flex;
  flex-flow: column wrap;
  row-gap: var(--spacing);
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
</style>
