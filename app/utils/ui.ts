import type { Address, Hex } from 'viem';

const TOAST_DURATION = 5000;

interface Toast {
  type: 'success' | 'error';
  message: string;
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

export { TOAST_DURATION };
export type { Toast, Link };
