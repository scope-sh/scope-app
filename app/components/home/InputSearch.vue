<template>
  <div class="wrapper">
    <div
      class="overlay"
      :class="{ active: isActive }"
    />
    <div
      ref="inputContainerEl"
      @keydown.up.prevent="handleUp"
      @keydown.down.prevent="handleDown"
      @keydown.enter="handleSubmit"
    >
      <div class="input-container">
        <input
          v-model="query"
          placeholder="Address, transaction, operation, or chain"
          @input="handleInput"
        />
        <div
          class="icon-wrapper"
          :class="{ disabled: results.length === 0 }"
        >
          <ScopeIcon
            class="icon"
            kind="arrow-right"
            @click="handleClick"
          />
        </div>
      </div>
      <SearchResults
        v-if="isActive"
        :is-loading="isLoading"
        :results="results"
        :selected-index="selectedResultIndex"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useFocusWithin, refDebounced } from '@vueuse/core';
import type { Address, Hex } from 'viem';
import { isAddress } from 'viem';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import SearchResults, {
  type Result,
} from '@/components/__common/SearchResults.vue';
import useEnv from '@/composables/useEnv';
import NamingService from '@/services/naming';
import { ETHEREUM, isChainName, getChainByName } from '@/utils/chains';
import { getRouteLocation } from '@/utils/routing';
import { searchTransactionOrOp } from '@/utils/search';
import { isEnsAddress, isTransactionHash } from '@/utils/validation/pattern';

const emit = defineEmits<{
  focus: [];
  blur: [];
}>();

const { indexerEndpoint, quicknodeAppName, quicknodeAppKey } = useEnv();
const router = useRouter();

const inputContainerEl = useTemplateRef<HTMLDivElement>('inputContainerEl');

const { focused: isFocused } = useFocusWithin(inputContainerEl);
watch(isFocused, (value) => {
  if (value) {
    emit('focus');
  } else {
    emit('blur');
  }
});
// Prevents race condition when clicking on the search results
const isFocusedDebounced = refDebounced(isFocused, 100);
const isActive = computed(() => isFocusedDebounced.value || isFocused.value);

function handleSubmit(): void {
  navigate();
}

function handleClick(): void {
  navigate();
}

const selectedResultIndex = ref(0);
function handleUp(): void {
  if (selectedResultIndex.value > 0) {
    selectedResultIndex.value--;
  }
}
function handleDown(): void {
  if (selectedResultIndex.value < results.value.length - 1) {
    selectedResultIndex.value++;
  }
}

const query = ref('');
const results = ref<Result[]>([]);
const isEnsResolving = ref(false);
const isTransactionOrOpResolving = ref(false);
const isLoading = computed(
  () => isEnsResolving.value || isTransactionOrOpResolving.value,
);

function handleInput(): void {
  selectedResultIndex.value = 0;
  results.value = [];
  if (query.value !== '') {
    search();
  }
}

const search = useDebounceFn(async () => {
  results.value = [];

  if (!query.value) {
    return;
  }

  if (isChainName(query.value)) {
    const chain = getChainByName(query.value);
    if (chain) {
      results.value = [
        {
          type: 'chain',
          chain,
        },
      ];
    }
  }

  if (isEnsAddress(query.value)) {
    isEnsResolving.value = true;
    const address = await resolveEns(query.value);
    isEnsResolving.value = false;
    if (address) {
      results.value = [
        {
          type: 'address',
          address,
        },
      ];
    }
  } else if (isAddress(query.value)) {
    results.value = [
      {
        type: 'address',
        address: query.value,
      },
    ];
  } else if (isTransactionHash(query.value)) {
    isTransactionOrOpResolving.value = true;
    const result = await searchTransactionOrOp(
      query.value as Hex,
      quicknodeAppName,
      quicknodeAppKey,
      indexerEndpoint,
    );
    isTransactionOrOpResolving.value = false;
    if (result) {
      results.value = [
        {
          type: result.type,
          chain: result.chain,
          hash: result.hash,
        },
      ];
    }
  }
}, 200);

async function resolveEns(name: string): Promise<Address | null> {
  const namingService = new NamingService(
    quicknodeAppName,
    quicknodeAppKey,
    ETHEREUM,
  );
  return namingService.resolveEns(name);
}

function handleSelect(result: Result): void {
  openResult(result);
}

function navigate(): void {
  const result = results.value[selectedResultIndex.value];
  if (!result) {
    return;
  }
  openResult(result);
}

function openResult(result: Result): void {
  if (result.type === 'chain') {
    router.push(getRouteLocation({ name: 'chain', chain: result.chain }));
  } else if (result.type === 'address') {
    router.push(
      getRouteLocation({
        name: 'global-address',
        address: result.address,
      }),
    );
  } else if (result.type === 'transaction' || result.type === 'op') {
    router.push(
      getRouteLocation({
        name: result.type,
        chain: result.chain,
        hash: result.hash,
      }),
    );
  }
}
</script>

<style scoped>
.wrapper {
  position: relative;
}

.overlay {
  display: block;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.25s ease-in-out;
  opacity: 0;
  background: black;
  pointer-events: none;
}

.overlay.active {
  opacity: 0.5;
}

.input-container {
  position: relative;
  z-index: 2;
}

input {
  width: 100%;
  padding: var(--spacing-4) var(--spacing-5);
  transition: 0.25s ease-in-out;
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--border-radius-s);
  outline: none;
  background: transparent;
  box-shadow: inset 2px 2px 2px rgb(0 0 0 / 40%);
  color: var(--color-text-primary);
  font-size: var(--font-size-l);
}

@media (width >= 768px) {
  input {
    font-size: var(--font-size-s);
  }
}

input:disabled {
  opacity: 0.6;
}

input:focus {
  border-color: var(--color-border-primary);
}

input::placeholder {
  color: var(--color-text-placeholder);
}

.icon-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  height: 100%;
  padding: 0 8px;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.icon {
  width: 15px;
  height: 15px;
  transition: 0.25s ease-in-out;
  opacity: 0.8;
  cursor: pointer;
}

.icon:hover {
  opacity: 1;
}
</style>
