import { defineStore } from 'pinia';
import { ref } from 'vue';

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
  const commands = ref<Command[]>([]);

  function setCommands(newCommands: Command[]): void {
    commands.value = newCommands;
  }

  return {
    commands,
    setCommands,
  };
});

export default store;
export type { Command, NestedCommand };
