<template>
  <ScopePage :sections="[]">
    <ScopePanel title="Op Simulation">
      <div class="body">
        <div class="form">
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
          <div v-if="parsedInputResult.success">
            <AttributeList>
              <AttributeItem>
                <AttributeItemLabel value="Sender" />
                <AttributeItemValue>
                  <LinkAddress :address="parsedInputResult.output.sender" />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Nonce" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.nonce }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem v-if="parsedInputResult.output.factory">
                <AttributeItemLabel value="Factory" />
                <AttributeItemValue>
                  <LinkAddress :address="parsedInputResult.output.factory" />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem v-if="parsedInputResult.output.factoryData">
                <AttributeItemLabel value="Init Data" />
                <AttributeItemValue>
                  <ScopeTextView
                    :value="parsedInputResult.output.factoryData"
                    size="tiny"
                  />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Call Data" />
                <AttributeItemValue>
                  <ScopeTextView
                    :value="parsedInputResult.output.callData"
                    size="tiny"
                  />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Pre Verification Gas" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.preVerificationGas }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Verification Gas Limit" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.verificationGasLimit }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Call Gas Limit" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.callGasLimit }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Max Fee Per Gas" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.maxFeePerGas }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Max Priority Fee Per Gas" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.maxPriorityFeePerGas }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem v-if="parsedInputResult.output.paymaster">
                <AttributeItemLabel value="Paymaster" />
                <AttributeItemValue>
                  <LinkAddress :address="parsedInputResult.output.paymaster" />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem v-if="parsedInputResult.output.paymasterData">
                <AttributeItemLabel value="Paymaster Data" />
                <AttributeItemValue>
                  <ScopeTextView
                    :value="parsedInputResult.output.paymasterData"
                    size="tiny"
                  />
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem
                v-if="parsedInputResult.output.paymasterPostOpGasLimit"
              >
                <AttributeItemLabel value="Paymaster Post Op Gas Limit" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.paymasterPostOpGasLimit }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem
                v-if="parsedInputResult.output.paymasterVerificationGasLimit"
              >
                <AttributeItemLabel value="Paymaster Verification Gas Limit" />
                <AttributeItemValue>
                  {{ parsedInputResult.output.paymasterVerificationGasLimit }}
                </AttributeItemValue>
              </AttributeItem>
              <AttributeItem>
                <AttributeItemLabel value="Signature" />
                <AttributeItemValue>
                  <ScopeTextView
                    :value="parsedInputResult.output.signature"
                    size="tiny"
                  />
                </AttributeItemValue>
              </AttributeItem>
            </AttributeList>
          </div>
          <div v-else>
            <div
              v-for="(issue, index) in parsedInputResult.issues"
              :key="index"
              class="errors"
            >
              {{ issue.issues?.[0].path?.[0].key }}:
              {{ issue.issues?.[0].message }}
            </div>
          </div>
        </div>
      </div>
    </ScopePanel>
  </ScopePage>
</template>

<script setup lang="ts">
import * as v from 'valibot';
import type { Address, Hex } from 'viem';
import { concat, padHex, size, slice } from 'viem';
import {
  entryPoint06Address,
  entryPoint07Address,
} from 'viem/account-abstraction';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import LinkAddress from '@/components/__common/LinkAddress.vue';
import ScopePage from '@/components/__common/ScopePage.vue';
import ScopePanel from '@/components/__common/ScopePanel.vue';
import ScopeTextView from '@/components/__common/ScopeTextView.vue';
import ScopeToggle from '@/components/__common/ScopeToggle.vue';
import {
  AttributeList,
  AttributeItem,
  AttributeItemLabel,
  AttributeItemValue,
} from '@/components/__common/attributes';
import { type OpSimulationRoute, getRouteLocation } from '@/utils/routing';

type SimulationQueryParams = Exclude<OpSimulationRoute, 'name'>;

const route = useRouter();

const AddressSchema = v.pipe(
  v.string(),
  v.regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid Ethereum address'),
  v.transform((value) => value.toLowerCase() as Address),
);
const HexStringSchema = v.pipe(
  v.string(),
  v.regex(/^0x[0-9a-fA-F]*$/, 'Must be a valid hex string starting with 0x'),
  v.transform((value) => value.toLowerCase() as Hex),
);
// A string that represents a big integer
const BigIntSchema = v.pipe(
  v.string(),
  // v.regex(/^\d+$/, 'Must be a valid big integer'),
  v.regex(/^0x[0-9a-fA-F]+$/, 'Must be a valid hex string starting with 0x'),
  v.transform((value) => BigInt(value)),
);

const Op_0_6_Schema = v.pipe(
  v.object({
    sender: AddressSchema,
    nonce: BigIntSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    callGasLimit: BigIntSchema,
    verificationGasLimit: BigIntSchema,
    preVerificationGas: BigIntSchema,
    maxFeePerGas: BigIntSchema,
    maxPriorityFeePerGas: BigIntSchema,
    paymasterAndData: HexStringSchema,
    signature: HexStringSchema,
  }),
  v.transform((op) => {
    const initCodeUnpacked =
      size(op.initCode as Hex) > 0
        ? {
            factory: slice(op.initCode as Hex, 0, 20),
            factoryData: slice(op.initCode as Hex, 20),
          }
        : {
            factory: null,
            factoryData: null,
          };
    const paymasterDataUnpacked =
      size(op.paymasterAndData as Hex) > 0
        ? size(op.paymasterAndData as Hex) > 20
          ? {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 20, 36),
              ),
              paymasterPostOpGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 36, 52),
              ),
              paymasterData:
                size(op.paymasterAndData as Hex) > 52
                  ? slice(op.paymasterAndData as Hex, 52)
                  : '0x',
            }
          : {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: null,
              paymasterPostOpGasLimit: null,
              paymasterData: null,
            }
        : {
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
          };
    return {
      sender: op.sender.toLowerCase() as Address,
      nonce: op.nonce,
      factory: initCodeUnpacked.factory,
      factoryData: initCodeUnpacked.factoryData,
      callData: op.callData,
      paymaster: paymasterDataUnpacked.paymaster,
      paymasterVerificationGasLimit:
        paymasterDataUnpacked.paymasterVerificationGasLimit,
      paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
      paymasterData: paymasterDataUnpacked.paymasterData,
      signature: op.signature,
      preVerificationGas: op.preVerificationGas,
      verificationGasLimit: op.verificationGasLimit,
      callGasLimit: op.callGasLimit,
      maxFeePerGas: op.maxFeePerGas,
      maxPriorityFeePerGas: op.maxPriorityFeePerGas,
    } as OpSchema;
  }),
);

// Mirrors the UserOperation<'0.7'> type from viem
const Op_0_7_Schema = v.pipe(
  v.object({
    sender: AddressSchema,
    nonce: BigIntSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    accountGasLimits: BigIntSchema,
    preVerificationGas: BigIntSchema,
    gasFees: BigIntSchema,
    paymasterAndData: HexStringSchema,
    signature: HexStringSchema,
  }),
  v.transform((op) => {
    const initCodeUnpacked =
      size(op.initCode as Hex) > 0
        ? {
            factory: slice(op.initCode as Hex, 0, 20),
            factoryData: slice(op.initCode as Hex, 20),
          }
        : {
            factory: null,
            factoryData: null,
          };
    const paymasterDataUnpacked =
      size(op.paymasterAndData as Hex) > 0
        ? size(op.paymasterAndData as Hex) > 20
          ? {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 20, 36),
              ),
              paymasterPostOpGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 36, 52),
              ),
              paymasterData:
                size(op.paymasterAndData as Hex) > 52
                  ? slice(op.paymasterAndData as Hex, 52)
                  : '0x',
            }
          : {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: null,
              paymasterPostOpGasLimit: null,
              paymasterData: null,
            }
        : {
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
          };
    const verificationGasLimit = BigInt(
      slice(`0x${op.accountGasLimits.toString(16)}`, 0, 16),
    );
    const callGasLimit = BigInt(
      slice(`0x${op.accountGasLimits.toString(16)}`, 16),
    );
    const maxFeePerGas = BigInt(slice(`0x${op.gasFees.toString(16)}`, 0, 16));
    const maxPriorityFeePerGas = BigInt(
      slice(`0x${op.gasFees.toString(16)}`, 16),
    );
    return {
      sender: op.sender.toLowerCase() as Address,
      nonce: op.nonce,
      factory: initCodeUnpacked.factory,
      factoryData: initCodeUnpacked.factoryData,
      callData: op.callData,
      paymaster: paymasterDataUnpacked.paymaster,
      paymasterVerificationGasLimit:
        paymasterDataUnpacked.paymasterVerificationGasLimit,
      paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
      paymasterData: paymasterDataUnpacked.paymasterData,
      signature: op.signature,
      preVerificationGas: op.preVerificationGas,
      verificationGasLimit: verificationGasLimit,
      callGasLimit: callGasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as OpSchema;
  }),
);

const UnpackedOpSchema = v.object({
  callData: HexStringSchema,
  callGasLimit: BigIntSchema,
  factory: v.nullable(AddressSchema),
  factoryData: v.nullable(HexStringSchema),
  maxFeePerGas: BigIntSchema,
  maxPriorityFeePerGas: BigIntSchema,
  nonce: BigIntSchema,
  paymaster: v.nullable(AddressSchema),
  paymasterData: v.nullable(HexStringSchema),
  paymasterPostOpGasLimit: v.nullable(BigIntSchema),
  paymasterVerificationGasLimit: v.nullable(BigIntSchema),
  preVerificationGas: BigIntSchema,
  sender: AddressSchema,
  signature: HexStringSchema,
  verificationGasLimit: BigIntSchema,
});
type OpSchema = v.InferOutput<typeof UnpackedOpSchema>;

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
  v.safeParse(
    v.union([UnpackedOpSchema, Op_0_6_Schema, Op_0_7_Schema]),
    inputJson.value,
  ),
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
      padHex(`0x${maxFeePerGas.toString(16)}`, {
        size: 16,
      }),
      padHex(`0x${maxPriorityFeePerGas.toString(16)}`, {
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

.errors {
  color: var(--color-error);
}
</style>
