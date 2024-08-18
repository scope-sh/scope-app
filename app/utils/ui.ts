import type { Address, Hex } from 'viem';

const TOAST_DURATION = 5000;
const MAX_TOASTS = 3;

interface ToastData {
  type: 'success' | 'error';
  message: string;
}

interface Toast extends ToastData {
  id: number;
}

interface BlockLink {
  type: 'block';
  value: bigint;
}

interface TransactionHashLink {
  type: 'transaction';
  value: Hex;
}

interface UserOpHashLink {
  type: 'userop';
  value: Hex;
}

interface AddressLink {
  type: 'address';
  value: Address;
}

type Link = BlockLink | TransactionHashLink | UserOpHashLink | AddressLink;

export { TOAST_DURATION, MAX_TOASTS };
export type { ToastData, Toast, Link };
