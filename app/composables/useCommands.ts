import { computed, onUnmounted, ref } from 'vue';
import type { Ref } from 'vue';

import useCommandStore, { type Command } from '@/stores/commands.js';

interface UseCommands {
  commands: Ref<Command[]>;
  setCommands: (newCommands: Command[]) => void;
}

function useCommands(): UseCommands {
  const commandStore = useCommandStore();

  const id = ref<string>(generateId());

  const commands = computed<Command[]>(() =>
    Object.values<Command[]>(commandStore.commands).flat(1),
  );

  function setCommands(newCommands: Command[]): void {
    commandStore.setCommands(id.value, newCommands);
  }

  onUnmounted(() => {
    commandStore.removeCommands(id.value);
  });

  function generateId(): string {
    return Math.random().toString(16).slice(2);
  }

  return { commands, setCommands };
}

export default useCommands;
