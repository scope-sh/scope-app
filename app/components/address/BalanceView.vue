<template>
  <div class="root">
    <FormLabel value="balances" />
    <ScopeSelect
      v-model="selectedTokenAddress"
      :options="tokenOptions"
      :disabled="isLoading"
      placeholder="Select token"
      class="select"
    >
      <template #trigger>
        <div
          v-if="selectedToken"
          class="option"
        >
          <LabelIcon
            v-if="getIconUrl(selectedTokenAddress)"
            :uri="getIconUrl(selectedTokenAddress)"
            class="token-icon"
          />
          <div class="token-details">
            <div class="token-balance">
              {{ selectedToken.balance }}
            </div>
            <div class="token-symbol">
              {{ selectedToken.symbol || '' }}
            </div>
          </div>
        </div>
      </template>
      <template #item="{ item }">
        <div class="option">
          <LabelIcon
            v-if="getIconUrl(item.value as Address)"
            :uri="getIconUrl(item.value as Address)"
            class="token-icon"
          />
          <div class="token-details">
            <div class="token-balance">
              {{ getTokenBalance(item.value as Address) }}
            </div>
            <div class="token-symbol">{{ item.label }}</div>
          </div>
        </div>
      </template>
    </ScopeSelect>
  </div>
</template>

<script setup lang="ts">
import { type Address, zeroAddress } from 'viem';
import { computed, onMounted, ref } from 'vue';

import FormLabel from './FormLabel.vue';

import LabelIcon from '@/components/__common/LabelIcon.vue';
import ScopeSelect from '@/components/__common/ScopeSelect.vue';
import useChain from '@/composables/useChain';
import useLabels from '@/composables/useLabels';
import { getChainIconUrl } from '@/utils/chains';

interface TokenBalance {
  address: Address;
  symbol: string | null;
  decimals: number;
  balance: string;
  iconUrl?: string;
}

const { balances, isLoading } = defineProps<{
  balances: TokenBalance[];
  isLoading: boolean;
}>();

const { id: chainId } = useChain();
const { getLabelIcon } = useLabels();

const selectedTokenAddress = ref<Address>(zeroAddress);

const selectedToken = computed(() => {
  return sortedTokenBalances.value.find(
    (token) => token.address === selectedTokenAddress.value,
  );
});

const sortedTokenBalances = computed(() => {
  const nativeToken = balances.find((token) => token.address === zeroAddress);
  const otherTokens = balances.filter((token) => token.address !== zeroAddress);

  const tokensWithIcons = otherTokens.map((token) => {
    const iconUrl = getLabelIcon(token.address);
    return {
      ...token,
      ...(iconUrl ? { iconUrl } : {}),
    };
  });

  const sortedTokens = tokensWithIcons.sort((a, b) => {
    if (a.iconUrl && !b.iconUrl) return -1;
    if (!a.iconUrl && b.iconUrl) return 1;
    return 0;
  });

  return nativeToken ? [nativeToken, ...sortedTokens] : sortedTokens;
});

function getIconUrl(address: Address): string | null {
  if (address === zeroAddress) {
    return getChainIconUrl(chainId.value);
  }
  return getLabelIcon(address);
}

function getTokenBalance(address: Address): string | null {
  const token = balances.find((t) => t.address === address);
  return token?.balance || null;
}

const tokenOptions = computed(() => {
  if (!sortedTokenBalances.value.length) {
    return [];
  }
  return sortedTokenBalances.value.map((token) => ({
    value: token.address,
    label: token.symbol || '',
  }));
});

onMounted(() => {
  if (sortedTokenBalances.value.length > 0) {
    const firstToken = sortedTokenBalances.value[0];
    if (firstToken) {
      selectedTokenAddress.value = firstToken.address;
    }
  }
});
</script>

<style scoped>
.root {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
  width: 250px;
}

.select {
  width: 100%;
  overflow: hidden;
}

.option {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  overflow: hidden;
}

.token-icon {
  width: 16px;
  height: 16px;
}

.token-details {
  display: flex;
  gap: var(--spacing-1);
  overflow: hidden;
}

.token-symbol {
  overflow: hidden;
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-balance {
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}
</style>
