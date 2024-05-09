<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Account Id'" />
      <AttributeItemValue>{{ accountId }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Supported Module Types'" />
      <AttributeItemValue>{{ moduleTypeSupportLabel }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem v-if="rootValidator">
      <AttributeItemLabel :value="'Root Validator'" />
      <AttributeItemValue v-if="rootValidator.type === 'validator'">
        <LinkAddress :address="rootValidator.address" />
      </AttributeItemValue>
      <AttributeItemValue v-else-if="rootValidator.type === 'permission'">
        <LinkAddress :address="rootValidator.signer" />
        +
        <LinkAddress
          v-for="policy in rootValidator.policies"
          :key="policy"
          :address="policy"
        />
      </AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Modules'" />
      <AttributeItemValue>
        <div class="soon">coming soon</div>
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import type { Address, Hex } from 'viem';
import { computed, ref, watch } from 'vue';

import ABI_KERNEL_V3_ACCOUNT from '@/abi/kernelV3Account';
import LinkAddress from '@/components/__common/LinkAddress.vue';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import useLabels from '@/composables/useLabels';
import {
  TYPE_VALIDATION,
  TYPE_EXECUTION,
  TYPE_FALLBACK,
  TYPE_HOOK,
  TYPE_POLICY,
  TYPE_SIGNER,
  getName,
} from '@/utils/context/erc7579/modules';

import LensBase from './common/LensBase.vue';

interface Validator {
  type: 'validator';
  address: Address;
}

interface Permission {
  type: 'permission';
  signer: Address;
  policies: Address[];
}

type RootValidator = Validator | Permission;

const TYPE_VALIDATOR = '0x01';
const TYPE_PERMISSION = '0x02';

const { client } = useChain();
const { requestLabels } = useLabels();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);

const accountId = ref<string | null>(null);
const rootValidatorId = ref<Hex | null>(null);
const rootValidator = ref<RootValidator | null>(null);

const moduleTypeSupportLabel = computed(() => {
  const supportedTypes = [
    TYPE_VALIDATION,
    TYPE_EXECUTION,
    TYPE_FALLBACK,
    TYPE_HOOK,
    TYPE_POLICY,
    TYPE_SIGNER,
  ];
  return supportedTypes.map(getName).join(', ');
});

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

  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_KERNEL_V3_ACCOUNT,
        functionName: 'accountId',
      },
      {
        address: props.address as Address,
        abi: ABI_KERNEL_V3_ACCOUNT,
        functionName: 'rootValidator',
      },
    ],
  });

  accountId.value = result[0].error ? null : result[0].result;
  rootValidatorId.value = result[1].error ? null : result[1].result;

  if (rootValidatorId.value) {
    const typePrefix = rootValidatorId.value.slice(0, 4);
    if (typePrefix === TYPE_VALIDATOR) {
      rootValidator.value = {
        type: 'validator',
        address: `0x${rootValidatorId.value.slice(4)}` as Address,
      };
    } else if (typePrefix === TYPE_PERMISSION) {
      const permissionId = `0x${rootValidatorId.value.slice(4, 4 + 8)}` as Hex;
      const permissionResult = await client.value.multicall({
        contracts: [
          {
            address: props.address as Address,
            abi: ABI_KERNEL_V3_ACCOUNT,
            functionName: 'permissionConfig',
            args: [permissionId],
          },
        ],
      });
      const permissionResultItem = permissionResult[0];
      if (permissionResultItem.error) {
        rootValidator.value = null;
        isLoading.value = false;
        return;
      }
      const signer =
        permissionResultItem.result.signer.toLowerCase() as Address;
      const policies = permissionResultItem.result.policyData.map(
        (data) => `0x${data.slice(6)}` as Address,
      );
      rootValidator.value = {
        type: 'permission',
        signer,
        policies,
      };
    }
  }

  isLoading.value = false;
}

const addresses = computed<Address[]>(() => {
  if (!rootValidator.value) {
    return [];
  }
  if (rootValidator.value.type === 'validator') {
    return [rootValidator.value.address];
  }
  if (rootValidator.value.type === 'permission') {
    return [rootValidator.value.signer, ...rootValidator.value.policies];
  }
  return [];
});

watch(
  () => addresses.value,
  () => {
    requestLabels(addresses.value);
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.soon {
  font-style: italic;
}
</style>
