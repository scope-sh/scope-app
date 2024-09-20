import type { Address } from 'viem';

import type { RelativeTime } from './conversion.js';
import { fromWei } from './conversion.js';

import type { NativeCurrency } from '@/composables/useChain.js';

function formatAddress(value: Address, size: number): string {
  return `${value.slice(0, 2 + size / 2)}...${value.slice(-size / 2)}`;
}

function formatEther(
  value: bigint,
  nativeCurrency: NativeCurrency,
  exact: boolean,
): string {
  return exact
    ? `${fromWei(value, nativeCurrency.decimals, 'string')} ${nativeCurrency.symbol}`
    : `${formatNumber(fromWei(value, nativeCurrency.decimals, 'number'))} ${nativeCurrency.symbol}`;
}

function formatGasPrice(value: bigint, exact: boolean): string {
  return exact
    ? `${fromWei(value, 9, 'string')} Gwei`
    : `${formatNumber(fromWei(value, 9, 'number'))} Gwei`;
}

function formatNumber(value: number): string {
  if (value === 0) {
    return '0';
  }
  const valueFormat = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `~${valueFormat.format(value)}`;
}

function formatRelativeTime({ value, unit }: RelativeTime): string {
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return format.format(value, unit);
}

function formatShare(value: number): string {
  const valueFormat = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return valueFormat.format(value);
}

function formatTime(value: Date): string {
  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export {
  formatAddress,
  formatEther,
  formatGasPrice,
  formatNumber,
  formatRelativeTime,
  formatShare,
  formatTime,
};
