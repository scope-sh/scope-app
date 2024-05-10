<template>
  <ScopeDialog
    :open="isOpen"
    title="Command Palette"
    :with-context="!!activeCommand.context"
    @update:open="handleOpen"
  >
    <div
      ref="contentEl"
      @keydown.up.prevent="handleUp"
      @keydown.down.prevent="handleDown"
      @keyup.enter="handleCommand()"
      @keydown.esc.prevent="close"
    >
      <div
        v-if="activeCommand.context"
        class="context"
      >
        <span class="context-label">
          {{ activeCommand.context }}
        </span>
      </div>
      <div class="input-wrapper">
        <input
          ref="inputEl"
          v-model="query"
          :class="{ 'with-context': !!activeCommand.context }"
          :placeholder="activeCommand.placeholder"
          @input="handleInput"
          @keyup.delete="handleDelete"
        />
        <div
          v-if="isLoading"
          class="loading"
        />
      </div>
      <div
        role="listbox"
        class="options"
      >
        <div
          v-for="(command, index) in commands"
          :key="index"
          ref="itemEls"
          role="listitem"
          :aria-selected="command === selectedCommand"
          class="option"
          :class="{ selected: command === selectedCommand }"
          @mouseover="handleMouseOver(index)"
          @click="handleCommand()"
        >
          <ScopeIcon
            :kind="command.icon"
            class="icon"
          />
          <div class="label">
            {{ command.label }}
            <span v-if="'getItems' in command">…</span>
          </div>
        </div>
      </div>
    </div>
  </ScopeDialog>
</template>

<script setup lang="ts">
import type { MaybeElement } from '@vueuse/core';
import { useDebounceFn, useMagicKeys, useAnimate } from '@vueuse/core';
import { Address, Hex } from 'viem';
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ScopeDialog from '@/components/__common/ScopeDialog.vue';
import ScopeIcon from '@/components/__common/ScopeIcon.vue';
import useChain from '@/composables/useChain';
import useCommands from '@/composables/useCommands';
import useEnv from '@/composables/useEnv';
import useToast from '@/composables/useToast';
import ApiService from '@/services/api';
import EvmService from '@/services/evm';
import IndexerService from '@/services/indexer';
import NamingService from '@/services/naming';
import type { Command, NestedCommand } from '@/stores/commands';
import useUiStore from '@/stores/ui';
import type { Chain } from '@/utils/chains';
import {
  CHAINS,
  getChainByName,
  getChainName,
  getChainNames,
  isChainName,
} from '@/utils/chains';
import { toBigInt } from '@/utils/conversion';
import { getRouteLocation } from '@/utils/routing';
import {
  isAddress,
  isBlockNumber,
  isBlockTag,
  isEnsAddress,
  isTransactionHash,
  isUserOpHash,
} from '@/utils/validation/pattern';

const router = useRouter();
useMagicKeys({
  passive: false,
  onEventFired(e) {
    // Manually handle CMD + K
    if (e.metaKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
      toggle();
    }
  },
});
const { alchemyApiKey, indexerEndpoint } = useEnv();
const { commands: localCommands } = useCommands();
const uiStore = useUiStore();
const { send: sendToast } = useToast();
const { id: chainId, client } = useChain();

const isOpen = computed(() => uiStore.isPaletteOpen);

const inputEl = ref<HTMLInputElement | null>(null);
const contentEl = ref<MaybeElement>(null);
const itemEls = ref<HTMLDivElement[]>([]);

let bouncePanel: () => void = () => {};

const apiService = computed(() =>
  chainId.value ? new ApiService(chainId.value) : null,
);
const evmService = computed(() =>
  chainId.value && client.value
    ? new EvmService(chainId.value, client.value)
    : null,
);
const indexerService = computed(() =>
  chainId.value ? new IndexerService(indexerEndpoint, chainId.value) : null,
);
const namingService = new NamingService(alchemyApiKey);

function handleOpen(value: boolean): void {
  if (!value) {
    close();
  }
}

function toggle(): void {
  if (isOpen.value) {
    close();
  } else {
    uiStore.setPaletteOpen(true);
  }
}

function close(): void {
  uiStore.setPaletteOpen(false);
  selectedCommandIndex.value = 0;
  activeCommand.value = TOP_LEVEL_COMMAND;
  commands.value = staticCommands.value;
  query.value = '';
}

watch(contentEl, () => {
  updateBounceFunction();
});

function updateBounceFunction(): void {
  const { play } = useAnimate(contentEl, [{ scale: 0.99 }], {
    duration: 100,
  });
  bouncePanel = play;
}

const query = ref('');

watch(query, () => {
  selectedCommandIndex.value = 0;
  requestCommandUpdate(activeCommand.value);
});

const globalCommands = computed<Command[]>(() => {
  const commands: Command[] = [
    {
      icon: 'arrow-right',
      label: 'Go home',
      act: (): void => {
        router.push(getRouteLocation({ name: 'chain' }));
      },
    },
    {
      icon: 'arrow-right',
      label: 'Go to chain',
      placeholder: 'Enter id or name',
      isAsync: (): boolean => false,
      getItems: async (query: string): Promise<Command[]> => {
        return CHAINS.filter((chain) => {
          return getChainNames(chain).some((name) => {
            return name.toLowerCase().includes(query.toLowerCase());
          });
        }).map((chain) => {
          return {
            icon: 'arrow-right',
            label: getChainName(chain),
            act: (): void => {
              router.push(getRouteLocation({ name: 'chain', chain }));
            },
          };
        });
      },
    },
  ];
  const goToCommands: Command[] = [
    {
      icon: 'arrow-right',
      label: 'Go to address',
      placeholder: 'Enter address, ENS or contract name',
      isAsync: areGoToItemsAsync('address'),
      getItems: async (query): Promise<Command[]> =>
        getGoToItems('address', query),
    },
    {
      icon: 'arrow-right',
      label: 'Go to transaction',
      placeholder: 'Enter hash',
      isAsync: areGoToItemsAsync('transaction'),
      getItems: async (query): Promise<Command[]> =>
        getGoToItems('transaction', query),
    },
    {
      icon: 'arrow-right',
      label: 'Go to UserOp',
      placeholder: 'Enter hash',
      isAsync: areGoToItemsAsync('userop'),
      getItems: async (query): Promise<Command[]> =>
        getGoToItems('userop', query),
    },
    {
      icon: 'arrow-right',
      label: 'Go to block',
      placeholder: 'Enter number',
      isAsync: areGoToItemsAsync('block'),
      getItems: async (query): Promise<Command[]> =>
        getGoToItems('block', query),
    },
    {
      icon: 'arrow-right',
      label: 'Go to anything',
      placeholder: 'Enter destination',
      isAsync: areGoToItemsAsync('all'),
      getItems: async (query): Promise<Command[]> => getGoToItems('all', query),
    },
  ];

  if (chainId.value) {
    for (const command of goToCommands) {
      commands.push(command);
    }
    commands.push({
      icon: 'copy',
      label: 'Get contract',
      placeholder: 'Enter contract name',
      isAsync: (): boolean => true,
      getItems: async (query): Promise<Command[]> => {
        if (!apiService.value) {
          return [];
        }
        const contracts = await apiService.value.searchLabels(query);
        return contracts.map((contract) => {
          return {
            icon: 'copy',
            label: contract.namespace
              ? `${contract.namespace.value}: ${contract.value}`
              : contract.value,
            act: (): void => {
              navigator.clipboard.writeText(contract.address);
              sendToast({
                type: 'success',
                message: 'Address copied to clipboard',
              });
            },
          };
        });
      },
    });
  }
  commands.push({
    icon: 'input',
    label: 'Resolve ENS',
    placeholder: 'Enter name',
    isAsync: (query): boolean => isEnsAddress(query),
    getItems: async (query): Promise<Command[]> => {
      if (!isEnsAddress(query)) {
        return [];
      }
      const address = await namingService.resolveEns(query);
      if (!address) {
        return [];
      }
      return [
        {
          icon: 'copy',
          label: address,
          act: (): void => {
            navigator.clipboard.writeText(address);
            sendToast({
              type: 'success',
              message: 'Address copied to clipboard',
            });
          },
        },
      ];
    },
  });

  return commands;
});

function areGoToItemsAsync(
  type: 'address' | 'block' | 'transaction' | 'userop' | 'all',
): (query: string) => boolean {
  return (query: string): boolean => {
    if (type === 'address') {
      if (isEnsAddress(query)) {
        return true;
      }
      if (isAddress(query)) {
        return false;
      }
      return true;
    }
    if (type === 'block') {
      if (isBlockNumber(query)) {
        return false;
      }
      if (isBlockTag(query)) {
        return true;
      }
      return false;
    }
    if (type === 'transaction') {
      return false;
    }
    if (type === 'userop') {
      return false;
    }
    if (type === 'all') {
      if (isChainName(query)) {
        return false;
      }
      if (isEnsAddress(query)) {
        return true;
      }
      if (isAddress(query)) {
        return false;
      }
      if (isBlockNumber(query)) {
        return false;
      }
      if (isBlockTag(query)) {
        return true;
      }
      if (isTransactionHash(query)) {
        return true;
      }
      return true;
    }
    return false;
  };
}

async function getGoToItems(
  type: 'address' | 'block' | 'transaction' | 'userop' | 'all',
  query: string,
): Promise<Command[]> {
  function getOpenChainCommand(chain: Chain): Command {
    return {
      icon: 'arrow-right',
      label: getChainName(chain),
      act: (): void => {
        router.push(getRouteLocation({ name: 'chain', chain }));
      },
    };
  }

  function getOpenAddressCommand(address: Address): Command {
    return {
      icon: 'arrow-right',
      label: address,
      isAsync: (): boolean => false,
      act: (): void => {
        router.push(getRouteLocation({ name: 'address', address }));
      },
    };
  }

  async function getOpenEnsCommand(name: string): Promise<Command | null> {
    const address = await namingService.resolveEns(name);
    if (!address) {
      return null;
    }
    return {
      icon: 'arrow-right',
      label: address,
      act: (): void => {
        router.push(getRouteLocation({ name: 'address', address }));
      },
    };
  }

  function getOpenBlockByNumberCommand(number: string): Command {
    return {
      icon: 'arrow-right',
      label: number,
      act: (): void => {
        const blockNumber = toBigInt(number);
        if (!blockNumber) {
          return;
        }
        router.push(getRouteLocation({ name: 'block', number: blockNumber }));
      },
    };
  }

  async function getOpenBlockByTagCommand(
    tag: string,
  ): Promise<Command | null> {
    if (!evmService.value) {
      return null;
    }
    if (tag === 'earliest') {
      return {
        icon: 'arrow-right',
        label: '0',
        act: (): void => {
          router.push(getRouteLocation({ name: 'block', number: 0n }));
        },
      };
    } else {
      // Get latest block
      const block = await evmService.value.getLatestBlock();
      return {
        icon: 'arrow-right',
        label: block.toString(),
        act: (): void => {
          router.push(getRouteLocation({ name: 'block', number: block }));
        },
      };
    }
  }

  function getOpenTransactionCommand(hash: string): Command {
    return {
      icon: 'arrow-right',
      label: hash,
      act: (): void => {
        router.push(getRouteLocation({ name: 'transaction', hash }));
      },
    };
  }

  function getOpenUserOpCommand(hash: string): Command {
    return {
      icon: 'arrow-right',
      label: hash,
      act: (): void => {
        router.push(getRouteLocation({ name: 'userop', hash }));
      },
    };
  }

  async function getOpenTransactionOrUserOpCommand(
    hash: string,
  ): Promise<Command | null> {
    if (!evmService.value || !indexerService.value) {
      return null;
    }
    const foundUserOp = await indexerService.value.getTxHashByUserOpHash(
      hash as Hex,
    );
    if (foundUserOp) {
      return getOpenUserOpCommand(hash);
    } else {
      return getOpenTransactionCommand(hash);
    }
  }

  async function getOpenLabelCommands(query: string): Promise<Command[]> {
    if (!apiService.value) {
      return [];
    }
    if (query === '') {
      return [];
    }
    const labels = await apiService.value.searchLabels(query);
    return labels.map((label) => {
      return {
        icon: 'arrow-right',
        label: label.namespace
          ? `${label.namespace.value}: ${label.value}`
          : label.value,
        act: (): void => {
          router.push(
            getRouteLocation({ name: 'address', address: label.address }),
          );
        },
      };
    });
  }

  switch (type) {
    case 'address': {
      if (isEnsAddress(query)) {
        const command = await getOpenEnsCommand(query);
        return command ? [command] : [];
      }
      if (isAddress(query)) {
        return [getOpenAddressCommand(query)];
      }
      return getOpenLabelCommands(query);
    }
    case 'block': {
      if (isBlockNumber(query)) {
        return [getOpenBlockByNumberCommand(query)];
      }
      if (isBlockTag(query)) {
        const command = await getOpenBlockByTagCommand(query);
        return command ? [command] : [];
      }
      return [];
    }
    case 'transaction': {
      return isTransactionHash(query) ? [getOpenTransactionCommand(query)] : [];
    }
    case 'userop': {
      return isUserOpHash(query) ? [getOpenUserOpCommand(query)] : [];
    }
    case 'all': {
      if (isChainName(query)) {
        const chain = getChainByName(query);
        const command = chain ? getOpenChainCommand(chain) : null;
        return command ? [command] : [];
      }
      if (isEnsAddress(query)) {
        const command = await getOpenEnsCommand(query);
        return command ? [command] : [];
      }
      if (isAddress(query)) {
        return [getOpenAddressCommand(query)];
      }
      if (isBlockNumber(query)) {
        return [getOpenBlockByNumberCommand(query)];
      }
      if (isBlockTag(query)) {
        const command = await getOpenBlockByTagCommand(query);
        return command ? [command] : [];
      }
      if (isTransactionHash(query)) {
        const command = await getOpenTransactionOrUserOpCommand(query);
        return command ? [command] : [];
      }
      return getOpenLabelCommands(query);
    }
  }
}

const staticCommands = computed(() => [
  ...globalCommands.value,
  ...localCommands.value,
]);

const TOP_LEVEL_COMMAND: NestedCommand = {
  icon: 'arrow-right',
  label: 'Top level',
  placeholder: 'Search anything or enter a command',
  isTopLevel: true,
  isAsync: (query: string): boolean => {
    const filteredStaticCommands = staticCommands.value.filter((command) => {
      return command.label.toLowerCase().includes(query.toLowerCase());
    });
    if (filteredStaticCommands.length > 0) {
      return false;
    }
    return areGoToItemsAsync('all')(query);
  },
  getItems: async (query: string): Promise<Command[]> => {
    const filteredStaticCommands = staticCommands.value.filter((command) => {
      return command.label.toLowerCase().includes(query.toLowerCase());
    });
    if (filteredStaticCommands.length > 0) {
      return filteredStaticCommands;
    }
    return getGoToItems('all', query);
  },
};

watch(staticCommands, () => {
  if (activeCommand.value.isTopLevel) {
    commands.value = staticCommands.value;
  }
});

const isLoading = ref(false);
const commands = ref<Command[]>(staticCommands.value);
const activeCommand = ref<NestedCommand>(TOP_LEVEL_COMMAND);

const queryEdited = ref(false);

function handleInput(): void {
  queryEdited.value = true;
}

function handleDelete(): void {
  if (!queryEdited.value) {
    activeCommand.value = TOP_LEVEL_COMMAND;
    commands.value = staticCommands.value;
    bouncePanel();
  }
  queryEdited.value = false;
}

async function handleCommand(): Promise<void> {
  const command = commands.value[selectedCommandIndex.value];
  if (!command) {
    return;
  }
  if ('act' in command) {
    command.act();
    close();
  } else {
    activeCommand.value = command;
    inputEl.value?.focus();
    bouncePanel();
    selectedCommandIndex.value = 0;
    query.value = '';
    queryEdited.value = false;
    commands.value = [];
    updateCommands(command);
  }
}

async function requestCommandUpdate(command: NestedCommand): Promise<void> {
  commands.value = [];
  if (!command.isAsync(query.value) || query.value.length === 0) {
    updateCommands(command);
  } else {
    debouncedCommandUpdate(command);
  }
}

const debouncedCommandUpdate = useDebounceFn(async (command) => {
  await updateCommands(command);
}, 500);

async function updateCommands(command: NestedCommand): Promise<void> {
  isLoading.value = true;
  const sentQuery = query.value;
  const validCommands = await command.getItems(sentQuery);
  isLoading.value = false;
  // Prevent request race condition
  if (sentQuery !== query.value || command !== activeCommand.value) {
    return;
  }
  commands.value = validCommands;
}

const selectedCommandIndex = ref(0);

const selectedCommand = computed<Command | undefined>(
  () => commands.value[selectedCommandIndex.value],
);

function handleUp(): void {
  if (selectedCommandIndex.value > 0) {
    selectedCommandIndex.value--;
  }
}

function handleDown(): void {
  if (selectedCommandIndex.value < commands.value.length - 1) {
    selectedCommandIndex.value++;
  }
}

function handleMouseOver(index: number): void {
  selectedCommandIndex.value = index;
}

watch(selectedCommand, (newValue) => {
  if (newValue) {
    nextTick(scrollSelectedIntoView);
  }
});

function scrollSelectedIntoView(): void {
  const selectedItemEl = itemEls.value[selectedCommandIndex.value];
  selectedItemEl?.scrollIntoView({ block: 'nearest' });
}
</script>

<style scoped>
.context {
  width: 100%;
  padding: 4px;
  padding: var(--spacing-4) var(--spacing-8);
}

.context-label {
  padding: var(--spacing-2);
  border-radius: var(--border-radius-xs);
  background: var(--color-background-secondary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-s);
}

.input-wrapper {
  display: flex;
  position: relative;
  align-items: center;
  border-bottom: 1px solid var(--color-border-tertiary);
}

input {
  flex: 1;
  width: 100%;
  padding: var(--spacing-8);
  border: none;
  border-radius: 4px;
  outline: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-light);

  &.with-context {
    padding: var(--spacing-4) var(--spacing-8) var(--spacing-8);
  }

  &::placeholder {
    color: var(--color-text-placeholder);
  }
}

.loading {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 1px;
  animation: 4s linear infinite alternate pulse;
  opacity: 0.2;
  background: var(--color-text-primary);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.2;
  }

  25%,
  75% {
    opacity: 0.6;
  }

  50% {
    opacity: 0.4;
  }
}

.options {
  --item-height: 48px;
  --item-max-count: 8;
  --panel-height: calc(var(--item-height) * var(--item-max-count));

  height: var(--panel-height);
  max-height: 70vh;
  margin: var(--spacing-3) 0;
  overflow-y: scroll;
}

.option {
  display: flex;
  align-items: center;
  height: var(--item-height);
  margin: 0 var(--spacing-5);
  padding: 0 var(--spacing-5);
  overflow: hidden;
  border-radius: var(--border-radius-m);
  color: var(--color-text-secondary);
  font-size: var(--font-size-m);
  text-overflow: ellipsis;
  white-space: nowrap;
  gap: var(--spacing-5);
  cursor: pointer;

  &.selected {
    --color-accent-toned-down: oklch(
      from var(--color-accent) l calc(c * 0.6) h
    );

    background: var(--color-background-secondary);
    color: var(--color-accent-toned-down);
  }
}

.icon {
  width: 15px;
  height: 15px;
}

.label {
  display: flex;
}
</style>
