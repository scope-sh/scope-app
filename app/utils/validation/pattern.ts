import type { Address, Hex } from 'viem';

function isBlockNumber(value: string): boolean {
  const blockNumberRegex = /^[\d]{1,9}$/;
  return !!value.match(blockNumberRegex);
}

function isBlockTag(value: string): boolean {
  const validBlockTags = ['earliest', 'latest'];
  return validBlockTags.includes(value);
}

function isAddress(value: string): value is Address {
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  return !!value.match(addressRegex);
}

function isEnsAddress(value: string): boolean {
  const addressRegex = /.+\.eth$/;
  return !!value.match(addressRegex);
}

function isTransactionHash(value: string): value is Hex {
  const hashRegex = /^0x[0-9a-f]{64}$/;
  return !!value.match(hashRegex);
}

function isOpHash(value: string): value is Hex {
  const hashRegex = /^0x[0-9a-f]{64}$/;
  return !!value.match(hashRegex);
}

export {
  isAddress,
  isBlockNumber,
  isBlockTag,
  isEnsAddress,
  isTransactionHash,
  isOpHash,
};
