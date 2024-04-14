import { computed } from 'vue';
import type { Ref } from 'vue';

import useCommandStore, { Command } from '@/stores/commands';

interface UseCommands {
  commands: Ref<Command[]>;
  setCommands: (scope: string, newCommands: Command[]) => void;
  removeCommands: (scope: string) => void;
}

function useCommands(): UseCommands {
  const commandStore = useCommandStore();

  const commands = computed<Command[]>(() =>
    Object.values<Command[]>(commandStore.commands).flat(1),
  );

  function setCommands(scope: string, newCommands: Command[]): void {
    commandStore.setCommands(scope, newCommands);
  }

  function removeCommands(scope: string): void {
    commandStore.setCommands(scope, []);
  }

  return { commands, setCommands, removeCommands };
}

export default useCommands;
