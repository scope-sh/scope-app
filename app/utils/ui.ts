const TOAST_DURATION = 5000;

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export { TOAST_DURATION };
export type { Toast };
