<template>
  <!-- Generally, the list should go from the list generic type to the most one -->
  <DaimoAccount
    v-if="hasLabelTypeId('daimo-v1-account')"
    :address="address"
  />
  <AlchemyLightV2Account
    v-if="hasLabelTypeId('alchemy-v2-light-account')"
    :address="address"
  />
  <AlchemyModularV1Account
    v-if="hasLabelTypeId('alchemy-v1-multi-owner-modular-account')"
    :address="address"
  />
  <CoinbaseSmartWalletV1Account
    v-else-if="hasLabelTypeId('coinbase-smart-wallet-v1-account')"
    :address="address"
  />
  <KernelV2AccountLens
    v-else-if="hasLabelTypeId('kernel-v2-account')"
    :address="address"
  />
  <KernelV3AccountLens
    v-else-if="hasLabelTypeId('kernel-v3-account')"
    :address="address"
  />
  <BiconomyV2Account
    v-else-if="hasLabelTypeId('biconomy-v2-account')"
    :address="address"
  />
  <SafeV1_4_1Lens
    v-if="
      hasLabelTypeId('safe-v1.4.1-account') ||
      hasLabelTypeId('safe7579-v1.0.0-account')
    "
    :address="address"
  />
  <FunV1Account
    v-if="hasLabelTypeId('fun-v1-account')"
    :address="address"
  />
  <EtherspotModularV1Account
    v-if="hasLabelTypeId('etherspot-modular-v1-account')"
    :address="address"
  />
  <UniswapV2PoolLens
    v-else-if="hasLabelTypeId('uniswap-v2-pool')"
    :address="address"
  />
  <UniswapV3PoolLens
    v-else-if="hasLabelTypeId('uniswap-v3-pool')"
    :address="address"
  />
  <AerodromeV1Pool
    v-else-if="hasLabelTypeId('aerodrome-v1-pool')"
    :address="address"
  />
  <AaveV3Token
    v-else-if="
      hasLabelTypeId('aave-v3-atoken') ||
      hasLabelTypeId('aave-v3-stoken') ||
      hasLabelTypeId('aave-v3-vtoken')
    "
    :address="address"
  />
  <MorphoVault
    v-else-if="hasLabelTypeId('morpho-vault')"
    :address="address"
  />
  <Erc7579ModuleLens
    v-else-if="
      hasLabelTypeId('erc7579-module') || hasLabelTypeId('rhinestone-v1-module')
    "
    :address="address"
  />
  <ZoraToken721Lens
    v-else-if="hasLabelTypeId('zora-721-token')"
    :address="address"
  />
  <ZoraToken1155Lens
    v-else-if="hasLabelTypeId('zora-1155-token')"
    :address="address"
  />
  <Erc20Lens
    v-else-if="hasLabelTypeId('erc20')"
    :address="address"
  />
</template>

<script setup lang="ts">
import type { Address } from 'viem';

import AaveV3Token from './lenses/AaveV3Token.vue';
import AerodromeV1Pool from './lenses/AerodromeV1Pool.vue';
import AlchemyLightV2Account from './lenses/AlchemyLightV2Account.vue';
import AlchemyModularV1Account from './lenses/AlchemyModularV1Account.vue';
import BiconomyV2Account from './lenses/BiconomyV2Account.vue';
import CoinbaseSmartWalletV1Account from './lenses/CoinbaseSmartWalletV1Account.vue';
import DaimoAccount from './lenses/DaimoAccount.vue';
import Erc20Lens from './lenses/Erc20Lens.vue';
import Erc7579ModuleLens from './lenses/Erc7579ModuleLens.vue';
import EtherspotModularV1Account from './lenses/EtherspotModularV1Account.vue';
import FunV1Account from './lenses/FunV1Account.vue';
import KernelV2AccountLens from './lenses/KernelV2AccountLens.vue';
import KernelV3AccountLens from './lenses/KernelV3AccountLens.vue';
import MorphoVault from './lenses/MorphoVault.vue';
import SafeV1_4_1Lens from './lenses/SafeV1_4_1Lens.vue';
import UniswapV2PoolLens from './lenses/UniswapV2PoolLens.vue';
import UniswapV3PoolLens from './lenses/UniswapV3PoolLens.vue';
import ZoraToken1155Lens from './lenses/ZoraToken1155.vue';
import ZoraToken721Lens from './lenses/ZoraToken721.vue';

import type { LabelTypeId } from '@/services/api.js';

const props = defineProps<{
  labelTypes: LabelTypeId[];
  address: Address;
}>();

function hasLabelTypeId(labelTypeId: LabelTypeId): boolean {
  return props.labelTypes.includes(labelTypeId);
}
</script>
