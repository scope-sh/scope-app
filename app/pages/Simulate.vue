<template>
  <ScopePage :sections="[]">
    <ScopePanel title="Op Simulation">
      <div class="body">
        <div class="form">
          <SelectChain
            v-model="chain"
            :options="CHAINS"
          />
          <ScopeToggle
            v-model="entryPointVersion"
            :options="[
              { value: '0.6', label: 'Entry Point 0.6' },
              { value: '0.7', label: 'Entry Point 0.7' },
            ]"
          />
          <textarea
            v-model="input"
            placeholder="User Operation JSON"
          />
          <ExampleView @select="handleExampleSelect" />
        </div>
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
import ExampleView, {
  type Example,
} from '@/components/simulate/ExampleView.vue';
import PreviewView from '@/components/simulate/PreviewView.vue';
import { type Chain, CHAINS, DEFAULT_CHAIN } from '@/utils/chains';
import { OpUnionSchema } from '@/utils/context/simulation';
import { type OpSimulationRoute, getRouteLocation } from '@/utils/routing';
import SelectChain from '~/components/_app/header/SelectChain.vue';

type SimulationQueryParams = Exclude<OpSimulationRoute, 'name'>;

const route = useRouter();

const chain = ref<Chain>(DEFAULT_CHAIN);

const entryPointVersion = ref<'0.6' | '0.7'>('0.7');
const entryPoint = computed(() =>
  entryPointVersion.value === '0.6'
    ? (entryPoint06Address.toLowerCase() as Address)
    : (entryPoint07Address.toLowerCase() as Address),
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
  input.value = example.value;
}
</script>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form,
.preview {
  width: 100%;
}

textarea {
  width: 100%;
  height: 120px;
  padding: 8px;
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
