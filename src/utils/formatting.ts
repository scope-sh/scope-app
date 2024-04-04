import { Address } from 'viem';

import { RelativeTime, fromWei } from './conversion';

function formatAddress(value: Address, size: number): string {
  return `${value.slice(0, 2 + size / 2)}...${value.slice(-size / 2)}`;
}

function formatEther(value: bigint): string {
  return `${formatNumber(fromWei(value, 18))} ETH`;
}

function formatGasPrice(value: bigint): string {
  return `${formatNumber(fromWei(value, 9))} Gwei`;
}

function formatNumber(value: number): string {
  const valueFormat = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return valueFormat.format(value);
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
