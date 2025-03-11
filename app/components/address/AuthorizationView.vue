<template>
  <template v-if="signerAddress">
    <div
      v-if="authorization.contractAddress === zeroAddress"
      class="item"
    >
      <LinkAddress :address="signerAddress" />
      undelegated at nonce
      {{ authorization.nonce }}
    </div>
    <div
      v-else
      class="item"
    >
      <LinkAddress :address="signerAddress" />
      delegated to
      <LinkAddress :address="authorization.contractAddress" /> at nonce
      {{ authorization.nonce }}
    </div>
  </template>
  <div
    v-else-if="signerAddress === undefined"
    class="item error"
  >
    Failed to delegate to
    <LinkAddress :address="authorization.contractAddress" /> at nonce
    {{ authorization.nonce }}: bad signature
  </div>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import { zeroAddress, type Address } from 'viem';
import { recoverAuthorizationAddress } from 'viem/experimental';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import type { SignedAuthorization } from '@/utils/context/eip7702';

const { authorization: a } = defineProps<{
  authorization: SignedAuthorization;
}>();

async function toSignerAddress(
  authorization: SignedAuthorization,
): Promise<Address | undefined> {
  try {
    const address = await recoverAuthorizationAddress({
      authorization,
    });
    return address.toLowerCase() as Address;
  } catch {
    return undefined;
  }
}

const { state: signerAddress } = useAsyncState(toSignerAddress(a), null);
</script>

<style scoped>
.item {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.item.error {
  color: var(--color-error);
}
</style>
