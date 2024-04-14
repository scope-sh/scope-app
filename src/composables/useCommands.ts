import { computed, onUnmounted } from 'vue';
import type { Ref } from 'vue';

import useCommandStore, { Command } from '@/stores/commands';

interface UseCommands {
  commands: Ref<Command[]>;
  setCommands: (newCommands: Command[]) => void;
}

function useCommands(scope?: string): UseCommands {
  const commandStore = useCommandStore();

  const commands = computed<Command[]>(() =>
    Object.values<Command[]>(commandStore.commands).flat(1),
  );

  function setCommands(newCommands: Command[]): void {
    if (!scope) {
      console.warn('Scope is required to set commands');
      return;
    }
    const scopeCommands = commandStore.commands[scope];
    if (scopeCommands && scopeCommands.length > 0) {
      console.warn(
        'Trying to set commands for a scope that already has commands',
      );
      return;
    }
    commandStore.setCommands(scope, newCommands);
  }

  onUnmounted(() => {
    if (!scope) {
      console.warn('Scope is required to remove commands');
      return;
    }
    commandStore.setCommands(scope, []);
  });

  return { commands, setCommands };
}

export default useCommands;
