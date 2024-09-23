<template>
  <div class="root">
    <h3>{{ getFragmentName(fragment) }}</h3>
    <div class="form">
      <form
        autocomplete="off"
        @submit.prevent="handleSubmit"
      >
        <div
          v-if="abiInputs.length > 0"
          class="inputs"
        >
          <AbiFormInput
            v-for="(abiInput, index) in abiInputs"
            :key="index"
            :abi-input="abiInput"
            :input="inputs[index]"
            @update:input="(newValue) => handleInputUpdate(index, newValue)"
          />
        </div>
        <div
          v-if="isWriteFunction"
          class="context"
        >
          <div class="context-name">context</div>
          <div class="context-inputs">
            <AbiFormInputPrimitive
              v-model="accountString"
              :abi-input="{ type: 'address', name: 'sender' }"
            />
            <AbiFormInputPrimitive
              v-if="isPayable"
              v-model="amountString"
              :abi-input="{ type: 'uint256', name: 'value' }"
            />
          </div>
        </div>
        <div class="query">
          <button
            type="submit"
            :disabled="isLoading || !isValid"
          >
            <ScopeIcon :kind="result === null ? 'arrow-right' : 'reload'" />
          </button>
          <ScopeTextView
            v-if="errorLabel"
            :value="errorLabel"
            type="error"
            size="tiny"
          />
          <AbiFormOutput
            v-else
            :abi-outputs="abiOutputs"
            :value="result"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AbiFunction, Address } from 'abitype';
import { computed, onMounted, provide, ref, watch, type Ref } from 'vue';

import AbiFormInput from './AbiFormInput.vue';
import AbiFormInputPrimitive from './AbiFormInputPrimitive.vue';
import AbiFormOutput from './AbiFormOutput.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import useChain from '@/composables/useChain';
import useEnv from '@/composables/useEnv';
import NamingService from '@/services/naming';
import {
  getFragmentName,
  isPayable as isFragmentPayable,
  isNonpayable as isFragmentNonpayable,
  type QueryError,
} from '@/utils/context/evm';
import {
  type Input as AbiInput,
  type Output as AbiOutput,
  getInitialValue,
  isValid as isAbiValid,
  normalize,
} from '@/utils/validation/abi';

const { fragment, error } = defineProps<{
  fragment: AbiFunction;
  isLoading: boolean;
  result: unknown;
  error: QueryError | null;
}>();

const emit = defineEmits<{
  submit: [
    {
      args: unknown[];
      account?: Address;
      amount?: bigint;
    },
  ];
}>();

const { id: chainId } = useChain();
const { quicknodeAppName, quicknodeAppKey } = useEnv();

const namingService = computed(() =>
  chainId.value
    ? new NamingService(quicknodeAppName, quicknodeAppKey, chainId.value)
    : null,
);

const abiInputs = computed(() => fragment.inputs as AbiInput[]);
const abiOutputs = computed(() => fragment.outputs as AbiOutput[]);
const isPayable = computed(() => isFragmentPayable(fragment));
const isNonpayable = computed(() => isFragmentNonpayable(fragment));
const isWriteFunction = computed(() => isPayable.value || isNonpayable.value);

const accountString = ref<string>('');
const amountString = ref<string>('');

const inputs = ref<unknown[]>([]);
const isValid = computed(() => {
  if (isWriteFunction.value) {
    if (
      !isAbiValid([accountString.value], [{ type: 'address', name: 'account' }])
    ) {
      return false;
    }
  }
  if (isPayable.value) {
    if (
      !isAbiValid([amountString.value], [{ type: 'uint256', name: 'value' }])
    ) {
      return false;
    }
  }
  return isAbiValid(inputs.value, abiInputs.value);
});
const validated = ref<boolean>(false);
const errorLabel = computed(() => {
  if (!error) {
    return null;
  }
  if (error.type === 'fetch') {
    return 'Fetch failed';
  }
  if (error.type === 'revert') {
    return `Call reverted: ${error.reason}`;
  }
  if (error.type === 'ens') {
    return error.name
      ? `Unable to resolve ${error.name}`
      : 'ENS resolution failed';
  }
  return 'Unknown error';
});

function requestValidation(): void {
  validated.value = true;
}

provide(injectionKey, {
  validated,
  requestValidation,
});

onMounted(() => {
  inputs.value = abiInputs.value.map((input) => getInitialValue(input));
});

watch(
  inputs,
  () => {
    validated.value = false;
  },
  { deep: true },
);

function handleInputUpdate(index: number, newValue: unknown): void {
  inputs.value[index] = newValue;
}

async function handleSubmit(): Promise<void> {
  if (!namingService.value) {
    return;
  }
  const args = await normalize(
    inputs.value,
    abiInputs.value,
    namingService.value,
  );
  const context = isWriteFunction.value
    ? await normalize(
        [accountString.value, amountString.value],
        [
          { type: 'address', name: 'account' },
          { type: 'uint256', name: 'amount' },
        ],
        namingService.value,
      )
    : null;
  const account = context ? (context[0] as Address) : undefined;
  const amount = context ? BigInt(context[1] as string) : undefined;
  emit('submit', {
    args,
    account: account,
    amount: amount,
  });
}
</script>

<script lang="ts">
interface Injection {
  validated: Ref<boolean>;
  requestValidation: () => void;
}

const injectionKey = Symbol();

export { injectionKey };
export type { Injection };
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;
}

h3 {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-s);
  font-weight: var(--font-weight-light);
}

form {
  display: flex;
  gap: var(--spacing-6);
  flex-direction: column;
}

.inputs {
  display: flex;
  gap: var(--spacing-3);
  flex-direction: column;
}

.context {
  display: flex;
  gap: var(--spacing-4);
  flex-direction: column;

  & .context-name {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
    font-size: var(--font-size-m);
  }

  & .context-inputs {
    display: flex;
    gap: var(--spacing-3);
    flex-direction: column;
  }
}

.query {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

button {
  display: flex;
  width: 16px;
  height: 16px;
  padding: 0;
  transition: opacity 0.5s;
  border: none;
  opacity: 0.4;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.1;
  }
}
</style>
