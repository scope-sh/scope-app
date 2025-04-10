<template>
  <ScopePage :sections="[]">
    <ScopePanel title="Op Simulation">
      <div class="body">
        <div class="form">
          <div class="input">
            <textarea
              v-model="input"
              placeholder="User Operation JSON"
            />
          </div>
          <div class="options">
            <SelectChain
              v-model="chain"
              :options="CHAINS"
            />
            <input
              v-model="blockInput"
              placeholder="Block Number"
            />
            <ScopeToggle
              v-model="entryPointVersion"
              :options="[
                { value: '0.6', label: 'Entry Point 0.6' },
                { value: '0.7', label: 'Entry Point 0.7' },
                { value: '0.8', label: 'Entry Point 0.8' },
              ]"
            />
          </div>
        </div>
        <ExampleView @select="handleExampleSelect" />
        <div>
          <button
            :disabled="!parsedInputResult.success"
            @click="openSimulationPage"
          >
            Simulate
          </button>
        </div>
        <div
          v-if="input.trim().length > 0"
          class="preview"
        >
          <PreviewView
            :parsed-op="parsedInputResult"
            :chain="chain"
          />
        </div>
      </div>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import * as v from 'valibot';
import type { Address } from 'viem';
import { concat, padHex } from 'viem';
import {
  entryPoint06Address,
  entryPoint07Address,
} from 'viem/account-abstraction';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import SelectChain from '@/components/_app/header/SelectChain.vue';
import ExampleView, {
  type Example,
} from '@/components/simulate/ExampleView.vue';
import PreviewView from '@/components/simulate/PreviewView.vue';
import { type Chain, CHAINS, DEFAULT_CHAIN } from '@/utils/chains';
import { ENTRY_POINT_0_8_ADDRESS } from '@/utils/context/erc4337/entryPoint';
import { OpUnionSchema } from '@/utils/context/simulation';
import { type OpSimulationRoute, getRouteLocation } from '@/utils/routing';

type SimulationQueryParams = Exclude<OpSimulationRoute, 'name'>;

const route = useRouter();

const chain = ref<Chain>(DEFAULT_CHAIN);

const entryPointVersion = ref<'0.6' | '0.7' | '0.8'>('0.7');
const entryPoint = computed(() =>
  entryPointVersion.value === '0.6'
    ? (entryPoint06Address.toLowerCase() as Address)
    : entryPointVersion.value === '0.7'
      ? (entryPoint07Address.toLowerCase() as Address)
      : ENTRY_POINT_0_8_ADDRESS,
);

const input = ref<string>('');
const inputJson = computed(() => {
  try {
    return JSON.parse(input.value);
  } catch {
    return null;
  }
});
const parsedInputResult = computed(() =>
  v.safeParse(OpUnionSchema, inputJson.value),
);
const parsedInput = computed(() =>
  parsedInputResult.value.success === true
    ? parsedInputResult.value.output
    : null,
);

const blockInput = ref<string>('');
const block = computed<number | undefined>(() => {
  // If an input is a valid non-negative integer, convert it to a number
  // Otherwise, return 'latest'
  const blockNumber = parseInt(blockInput.value);
  if (!isNaN(blockNumber) && blockNumber >= 0) {
    return blockNumber;
  }
  return undefined;
});

function openSimulationPage(): void {
  if (!parsedInput.value) {
    return;
  }

  const {
    sender,
    nonce,
    factory,
    factoryData,
    callData,
    callGasLimit,
    verificationGasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
    paymaster,
    paymasterData,
    paymasterPostOpGasLimit,
    paymasterVerificationGasLimit,
    preVerificationGas,
    signature,
  } = parsedInput.value;
  const simulationQueryParams: SimulationQueryParams = {
    name: 'op-simulation',
    chain: chain.value,
    blockNumber: block.value,
    entryPoint: entryPoint.value,
    sender,
    nonce: `0x${nonce.toString(16)}`,
    initCode: concat([factory || '0x', factoryData || '0x']),
    callData,
    accountGasLimits: concat([
      padHex(`0x${verificationGasLimit.toString(16)}`, {
        size: 16,
      }),
      padHex(`0x${callGasLimit.toString(16)}`, {
        size: 16,
      }),
    ]),
    preVerificationGas: `0x${preVerificationGas.toString(16)}`,
    gasFees: concat([
      padHex(`0x${maxPriorityFeePerGas.toString(16)}`, {
        size: 16,
      }),
      padHex(`0x${maxFeePerGas.toString(16)}`, {
        size: 16,
      }),
    ]),
    paymasterAndData: concat([
      paymaster || '0x',
      paymasterVerificationGasLimit
        ? padHex(`0x${paymasterVerificationGasLimit.toString(16)}`, {
            size: 16,
          })
        : '0x',
      paymasterPostOpGasLimit
        ? padHex(`0x${paymasterPostOpGasLimit.toString(16)}`, { size: 16 })
        : '0x',
      paymasterData || '0x',
    ]),
    signature,
  };

  const routeLocation = getRouteLocation(simulationQueryParams);
  route.push(routeLocation);
}

function handleExampleSelect(example: Example): void {
  chain.value = example.chain;
  entryPointVersion.value = example.entryPointVersion;
  blockInput.value = example.blockNumber.toString();
  input.value = example.value;
}
</script>

<style scoped>
.body {
  display: flex;
  gap: var(--spacing-7);
  flex-direction: column;
}

.form {
  display: flex;
  gap: var(--spacing-10);
}

.input {
  flex: 3;
}

.options {
  display: flex;
  flex: 2;
  gap: var(--spacing-6);
  flex-direction: column;
}

.form,
.preview {
  width: 100%;
}

textarea {
  width: 100%;
  height: 120px;
  padding: var(--spacing-4);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-m);
  outline: none;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: var(--font-size-s);

  &:focus {
    border-color: var(--color-border-primary);
  }
}

input {
  width: 120px;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border-tertiary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: var(--font-size-s);

  &:focus {
    border-color: var(--color-border-quaternary);
  }
}

button {
  width: 120px;
  height: 32px;
  border: none;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;

  &:hover {
    background: var(--color-background-secondary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
