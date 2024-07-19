import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Kind as IconKind } from '@/components/__common/icon/general/index.js';

interface BaseCommand {
  icon: IconKind;
  label: string;
}

interface SimpleCommand extends BaseCommand {
  act: () => void;
}

interface NestedCommand extends BaseCommand {
  placeholder: string;
  isTopLevel?: true;
  isAsync: (query: string) => boolean;
  getItems: (query: string) => Promise<Command[]>;
}

type Command = SimpleCommand | NestedCommand;

const store = defineStore('commands', () => {
  const commands = ref<Record<string, Command[]>>({});

  function setCommands(id: string, newCommands: Command[]): void {
    commands.value[id] = newCommands;
  }

  function removeCommands(id: string): void {
    commands.value[id] = [];
  }

  return {
    commands,
    setCommands,
    removeCommands,
  };
});

export default store;
export type { Command, NestedCommand };
