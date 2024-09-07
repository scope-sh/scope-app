<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Owners'" />
      <AttributeItemValue v-if="owners">
        <div
          v-for="owner in owners"
          :key="owner.value"
        >
          <LinkAddress
            v-if="owner.type === 'address'"
            :address="owner.value"
          />
          <template v-else>
            {{ owner.value }}
          </template>
        </div>
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Hex, Address } from 'viem';
import { slice, pad, zeroHash } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';

import ABI_COINBASE_SMART_WALLET_ACCOUNT from '@/abi/coinbaseSmartWalletV1Account';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';

type Owner =
  | {
      type: 'key';
      value: Hex;
    }
  | {
      type: 'address';
      value: Address;
    };

const { client } = useChain();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const owners = ref<Owner[] | null>(null);

watch(
  () => props.address,
  () => {
    fetch();
  },
  {
    immediate: true,
  },
);

async function fetch(): Promise<void> {
  if (!client.value) return;

  owners.value = null;
  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_COINBASE_SMART_WALLET_ACCOUNT,
        functionName: 'nextOwnerIndex',
      },
    ],
  });

  const nextOwnerIndex =
    result[0].status === 'success' ? result[0].result : null;

  if (nextOwnerIndex === null) {
    isLoading.value = false;
    return;
  }

  const ownersResult = await client.value.multicall({
    contracts: Array.from({ length: Number(nextOwnerIndex) }, (_, i) => ({
      address: props.address as Address,
      abi: ABI_COINBASE_SMART_WALLET_ACCOUNT,
      functionName: 'ownerAtIndex',
      args: [BigInt(i)],
    })),
  });
  const ownersValue = ownersResult.map((result) =>
    result.status === 'success' ? result.result : null,
  );
  owners.value = ownersValue
    .filter((owner): owner is Address => owner !== zeroHash)
    .map((owner) => {
      // If the first 44 bytes are 0, it's an address
      if (pad(slice(owner, 44)) === owner) {
        return {
          type: 'address',
          value: slice(owner, 44),
        };
      }
      // Otherwise, it's a key
      return {
        type: 'key',
        value: owner,
      };
    });

  isLoading.value = false;
}
</script>
