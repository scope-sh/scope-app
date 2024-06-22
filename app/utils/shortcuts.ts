interface ShortcutPart {
  key: string;
  isMeta?: boolean;
}

type Shortcut = ShortcutPart[];

export type { Shortcut, ShortcutPart };
