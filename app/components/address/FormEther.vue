<template>
  <form @submit.prevent="query">
    <FormLabel value="ether" />
    <div class="strip">
      <ScopeTextStrip
        v-if="balance !== null"
        :value="balance.toString()"
      />
      <ScopeIcon
        kind="reload"
        class="icon"
        :class="{ disabled: isLoading }"
        @click="query"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Address } from 'viem';
import { computed, ref, onMounted } from 'vue';

import FormLabel from './FormLabel.vue';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import ScopeTextStrip from '@/components/__common/ScopeTextStrip.vue';
import useChain from '@/composables/useChain';
import EvmService from '@/services/evm';

const { address } = defineProps<{
  address: Address;
  balance: bigint | null;
}>();

const emit = defineEmits<{
  'update:balance': [value: bigint];
}>();

const { client } = useChain();

const ethereumService = computed(() =>
  client.value ? new EvmService(client.value) : null,
);

const isLoading = ref(false);

onMounted(() => {
  query();
});

async function query(): Promise<void> {
  if (!ethereumService.value) {
    return;
  }
  isLoading.value = true;
  const balance = await ethereumService.value.getBalance(address);
  emit('update:balance', balance);
  isLoading.value = false;
}
</script>

<style scoped>
form {
  display: flex;
  gap: var(--spacing-2);
  flex-direction: column;
}

.strip {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.icon {
  width: 15px;
  height: 15px;
  transition: 0.25s ease-in-out;
  cursor: pointer;
}

.icon.disabled {
  opacity: 0.6;
  pointer-events: none;
}
</style>
