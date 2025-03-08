<template>
  <div v-if="parsedOp.success">
    <AttributeList>
      <AttributeItem>
        <AttributeItemLabel value="Sender" />
        <AttributeItemValue>
          <LinkAddress
            :address="parsedOp.output.sender"
            :chain="chain"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Nonce" />
        <AttributeItemValue>
          {{ parsedOp.output.nonce }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.factory">
        <AttributeItemLabel value="Factory" />
        <AttributeItemValue>
          <LinkAddress
            :address="parsedOp.output.factory"
            :chain="chain"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.factoryData">
        <AttributeItemLabel value="Init Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="parsedOp.output.factoryData"
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="parsedOp.output.callData"
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Pre Verification Gas" />
        <AttributeItemValue>
          {{ parsedOp.output.preVerificationGas }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Verification Gas Limit" />
        <AttributeItemValue>
          {{ parsedOp.output.verificationGasLimit }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Call Gas Limit" />
        <AttributeItemValue>
          {{ parsedOp.output.callGasLimit }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Max Fee Per Gas" />
        <AttributeItemValue>
          {{ parsedOp.output.maxFeePerGas }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Max Priority Fee Per Gas" />
        <AttributeItemValue>
          {{ parsedOp.output.maxPriorityFeePerGas }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.paymaster">
        <AttributeItemLabel value="Paymaster" />
        <AttributeItemValue>
          <LinkAddress
            :address="parsedOp.output.paymaster"
            :chain="chain"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.paymasterData">
        <AttributeItemLabel value="Paymaster Data" />
        <AttributeItemValue>
          <ScopeTextView
            :value="parsedOp.output.paymasterData"
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.paymasterPostOpGasLimit">
        <AttributeItemLabel value="Paymaster Post Op Gas Limit" />
        <AttributeItemValue>
          {{ parsedOp.output.paymasterPostOpGasLimit }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem v-if="parsedOp.output.paymasterVerificationGasLimit">
        <AttributeItemLabel value="Paymaster Verification Gas Limit" />
        <AttributeItemValue>
          {{ parsedOp.output.paymasterVerificationGasLimit }}
        </AttributeItemValue>
      </AttributeItem>
      <AttributeItem>
        <AttributeItemLabel value="Signature" />
        <AttributeItemValue>
          <ScopeTextView
            :value="parsedOp.output.signature"
            size="tiny"
          />
        </AttributeItemValue>
      </AttributeItem>
    </AttributeList>
  </div>
  <div v-else>
    <div
      v-for="(issue, index) in parsedOp.issues"
      :key="index"
      class="errors"
    >
      {{ issue.issues?.[0].path?.[0].key }}:
      {{ issue.issues?.[0].message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type * as v from 'valibot';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import {
  AttributeList,
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import type { Chain } from '@/utils/chains';
import type { OpUnionSchema } from '@/utils/context/simulation';

defineProps<{
  parsedOp: v.SafeParseResult<typeof OpUnionSchema>;
  chain: Chain;
}>();
</script>

<style scoped>
.errors {
  color: var(--color-error);
}
</style>
