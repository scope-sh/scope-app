import { Address } from 'viem';

import { RelativeTime } from './conversion';

function formatAddress(value: Address, size: number): string {
  return `${value.slice(0, 2 + size / 2)}...${value.slice(-size / 2)}`;
}

function formatRelativeTime({ value, unit }: RelativeTime): string {
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return format.format(value, unit);
}

export { formatAddress, formatRelativeTime };
