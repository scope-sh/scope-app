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
  context?: string;
  placeholder: string;
  isTopLevel?: true;
  isAsync: (query: string) => boolean;
  getItems: (query: string) => Promise<Command[]>;
}

type Command = SimpleCommand | NestedCommand;

const store = defineStore('commands', () => {
  const commands = ref<Record<string, Command[]>>({});

  function setCommands(scope: string, newCommands: Command[]): void {
    commands.value[scope] = newCommands;
  }

  return {
    commands,
    setCommands,
  };
});

export default store;
export type { Command, NestedCommand };
