<template>
  <LensBase :is-loading="isLoading">
    <AttributeItem>
      <AttributeItemLabel :value="'Active Keys'" />
      <AttributeItemValue>{{ activeKeys }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Active Slots'" />
      <AttributeItemValue>{{ activeSlots }}</AttributeItemValue>
    </AttributeItem>
    <AttributeItem>
      <AttributeItemLabel :value="'Key'" />
      <AttributeItemValue>
        <LensForm
          :loading="isKeyLoading"
          @query="fetchKey"
        >
          <template #input>
            <LensInput
              v-model="keyIndex"
              placeholder="Slot"
              :invalid="
                validatedKeyInputs.length === 1 &&
                !isInputValid(validatedKeyInputs, 0)
              "
              :disabled="isKeyLoading"
            />
          </template>
          <template
            v-if="key"
            #output
          >
            {{ key }}
          </template>
        </LensForm>
      </AttributeItemValue>
    </AttributeItem>
  </LensBase>
</template>

<script setup lang="ts">
import { type Address, concat, zeroAddress } from 'viem';
import { ref, watch } from 'vue';

import LensBase from './common/LensBase.vue';
import LensForm from './common/LensForm.vue';
import LensInput from './common/LensInput.vue';

import ABI_DAIMO_ACCOUNT from '@/abi/daimoAccount';
import {
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import useChain from '@/composables/useChain';
import {
  validate as validateInputs,
  isValid as areInputsValid,
  isInputValid,
} from '@/utils/validation/inputs';
import type { ValidatedInput } from '~/utils/validation';

const { client } = useChain();

const props = defineProps<{
  address: Address;
}>();

const isLoading = ref(true);
const isKeyLoading = ref(false);
const validatedKeyInputs = ref<ValidatedInput[]>([]);

const keyIndex = ref<string>('');

const activeKeys = ref<number | null>(null);
const activeSlots = ref<string | null>(null);
const key = ref<string | null>(null);

watch(
  () => props.address,
  () => {
    fetch();
  },
  {
    immediate: true,
  },
);

watch(
  () => keyIndex.value,
  () => {
    validatedKeyInputs.value = [];
  },
);

async function fetch(): Promise<void> {
  if (!client.value) return;

  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'numActiveKeys',
      },
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'getActiveSigningKeys',
      },
    ],
  });

  activeKeys.value = result[0].status === 'success' ? result[0].result : null;
  activeSlots.value =
    result[1].status === 'success' ? result[1].result[1].join(', ') : null;

  isLoading.value = false;
}

async function fetchKey(): Promise<void> {
  isKeyLoading.value = true;
  key.value = null;
  if (!client.value || !keyIndex.value) return;

  const index = parseInt(keyIndex.value);
  validatedKeyInputs.value = validateInputs({
    address: zeroAddress,
    abi: ABI_DAIMO_ACCOUNT,
    functionName: 'keys',
    args: [index, 0n],
  });
  const isValid = areInputsValid(validatedKeyInputs.value);
  if (!isValid) {
    isKeyLoading.value = false;
    return;
  }
  const result = await client.value.multicall({
    contracts: [
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'keys',
        args: [index, 0n],
      },
      {
        address: props.address as Address,
        abi: ABI_DAIMO_ACCOUNT,
        functionName: 'keys',
        args: [index, 1n],
      },
    ],
  });

  isKeyLoading.value = false;
  const keyPartLeft = result[0].status === 'success' ? result[0].result : null;
  const keyPartRight = result[1].status === 'success' ? result[1].result : null;
  key.value =
    keyPartLeft && keyPartRight ? concat([keyPartLeft, keyPartRight]) : null;
}
</script>
