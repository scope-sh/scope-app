import type { Address, Hex } from 'viem';

const TOAST_DURATION = 5 * 1000;
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

interface OpHashLink {
  type: 'op';
  value: Hex;
}

interface AddressLink {
  type: 'address';
  value: Address;
}

type Link = BlockLink | TransactionHashLink | OpHashLink | AddressLink;

export { TOAST_DURATION, MAX_TOASTS };
export type { ToastData, Toast, Link };
