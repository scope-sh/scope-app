import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Kind as IconKind } from '@/components/__common/icon/general';

interface BaseCommand {
  icon: IconKind;
  label: string;
}

interface SimpleCommand extends BaseCommand {
  act: () => void;
}

interface NestedCommand extends BaseCommand {
  context?: string;
  placeholder: string;
  isTopLevel?: true;
  isAsync: (query: string) => boolean;
  getItems: (query: string) => Promise<Command[]>;
}

type Command = SimpleCommand | NestedCommand;

const store = defineStore('commands', () => {
  const commands = ref<Record<string, Command[]>>({});

  const allCommands = computed<Command[]>(() =>
    Object.values<Command[]>(commands.value).flat(1),
  );

  function setCommands(scope: string, newCommands: Command[]): void {
    commands.value[scope] = newCommands;
  }

  function removeCommands(scope: string): void {
    delete commands.value[scope];
  }

  return {
    commands,
    allCommands,
    setCommands,
    removeCommands,
  };
});

export default store;
export type { Command, NestedCommand };
