import {
  getContractAddress,
  size,
  type Address,
  type Hash,
  type Transaction,
  type Log,
  getAbiItem,
  toEventSelector,
  decodeEventLog,
  formatUnits,
} from 'viem';

import aaveV3TokenAbi from '@/abi/aaveV3Token';
import aerodromeV1PoolAbi from '@/abi/aerodromeV1Pool';
import entryPoint070Abi from '@/abi/entryPointV0_7_0';
import erc20Abi from '@/abi/erc20';
import uniswapV2PoolAbi from '@/abi/uniswapV2Pool';
import uniswapV3PoolAbi from '@/abi/uniswapV3Pool';
import zora1155TokenAbi from '@/abi/zora1155Token';
import zora721TokenAbi from '@/abi/zora721Token';
import type { Label } from '@/services/api';
import { decodeSignature as biconomyV2DecodeSignature } from '@/utils/context/erc4337/biconomyV2';
import { decodeSignature as coinbaseSmartWalletV1DecodeSignature } from '@/utils/context/erc4337/coinbaseSmartWalletV1';
import type { OpUnpacked } from '@/utils/context/erc4337/entryPoint';
import { decodeSignature as kernelV2DecodeSignature } from '@/utils/context/erc4337/kernelV2';
import { decodeNonce as kernelV3DecodeNonce } from '@/utils/context/erc7579/kernelV3';

interface ItemPartText {
  type: 'text';
  value: string;
}

interface ItemPartAddress {
  type: 'address';
  address: Address;
  label?: string;
}

interface ItemPartOp {
  type: 'op';
  hash: Hash;
}

type ItemPart = ItemPartText | ItemPartAddress | ItemPartOp;

interface Item {
  icon?: string;
  parts: ItemPart[];
}

function getContractDeployment(transaction: Transaction): Item[] {
  const toAddress = transaction.to;
  const input = transaction.input;
  if (!toAddress && size(input) > 0) {
    const from = transaction.from;
    const nonce = BigInt(transaction.nonce);
    // Contract deployment transaction
    const contractAddress = getContractAddress({
      from,
      nonce,
    });
    return [
      {
        parts: [
          {
            type: 'text',
            value: 'Deploy',
          },
          {
            type: 'address',
            address: contractAddress.toLowerCase() as Address,
          },
          {
            type: 'text',
            value: 'contract',
          },
        ],
      },
    ];
  }
  return [];
}

function getOp(
  op: OpUnpacked,
  getLabel: (address: Address) => Label | null,
): Item[] {
  const sender = op.sender;
  const label = getLabel(sender);
  if (!label) {
    return [];
  }
  const labelType = label.type;
  if (!labelType) {
    return [];
  }
  if (labelType.id === 'kernel-v2-account') {
    const signature = op.signature;
    const decodedSignature = kernelV2DecodeSignature(signature);
    if (!decodedSignature) {
      return [];
    }
    if (decodedSignature.mode === 'sudo') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Validate with default validator',
            },
          ],
        },
      ] as Item[];
    }
    if (decodedSignature.mode === 'enable') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Enable',
            },
            {
              type: 'address',
              address: decodedSignature.validator,
            },
            {
              type: 'text',
              value: 'as validator',
            },
          ],
        },
      ] as Item[];
    }
    if (decodedSignature.mode === 'use') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Use custom validator',
            },
          ],
        },
      ] as Item[];
    }
  }
  if (labelType.id === 'kernel-v3-account') {
    const nonce = op.nonce;
    const decodedNonce = kernelV3DecodeNonce(nonce);
    if (!decodedNonce) {
      return [];
    }
    if (decodedNonce.mode === 'enable') {
      if (decodedNonce.vType === 'permission') {
        return [
          {
            icon: label.iconUrl,
            parts: [
              {
                type: 'text',
                value: `Enable permission ${decodedNonce.identifier}`,
              },
            ],
          },
        ];
      }
      if (decodedNonce.vType === 'validator') {
        return [
          {
            icon: label.iconUrl,
            parts: [
              {
                type: 'text',
                value: 'Enable',
              },
              {
                type: 'address',
                address: decodedNonce.identifier,
              },
              {
                type: 'text',
                value: 'validator',
              },
            ],
          },
        ];
      }
    }
    if (decodedNonce.mode === 'install') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Install',
            },
            {
              type: 'address',
              address: decodedNonce.identifier,
            },
            {
              type: 'text',
              value: 'validator',
            },
          ],
        },
      ];
    }
    if (decodedNonce.vType === 'root') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Validate with root validator',
            },
          ],
        },
      ];
    }
    if (decodedNonce.vType === 'validator') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: 'Validate with',
            },
            {
              type: 'address',
              address: decodedNonce.identifier,
            },
          ],
        },
      ];
    }
    if (decodedNonce.vType === 'permission') {
      return [
        {
          icon: label.iconUrl,
          parts: [
            {
              type: 'text',
              value: `Validate with permission ${decodedNonce.identifier}`,
            },
          ],
        },
      ];
    }
  }
  if (labelType.id === 'biconomy-v2-account') {
    const signature = op.signature;
    const decodedSignature = biconomyV2DecodeSignature(signature);
    return [
      {
        icon: label.iconUrl,
        parts: [
          {
            type: 'text',
            value: 'Validate with',
          },
          {
            type: 'address',
            address: decodedSignature.validator,
          },
        ],
      },
    ] as Item[];
  }
  if (labelType.id === 'coinbase-smart-wallet-v1-account') {
    const signature = op.signature;
    const decodedSignature = coinbaseSmartWalletV1DecodeSignature(signature);
    if (!decodedSignature) {
      return [];
    }
    return [
      {
        icon: label.iconUrl,
        parts: [
          {
            type: 'text',
            value: `Validate with owner #${decodedSignature.ownerIndex}`,
          },
        ],
      },
    ] as Item[];
  }
  return [];
}

function getLogs(
  logs: Log[],
  getLabel: (address: Address) => Label | null,
): Item[] {
  const items: Item[] = [];
  for (const log of logs) {
    const logItem = getLog(log, getLabel);
    if (logItem) {
      items.push(logItem);
    }
  }
  return items;
}

function getLog(
  log: Log,
  getLabel: (address: Address) => Label | null,
): Item | undefined {
  const topic = log.topics[0];
  if (!topic) {
    return;
  }
  const erc20Transfer = getAbiItem({
    abi: erc20Abi,
    name: 'Transfer',
  });
  const uniV2SwapTransfer = getAbiItem({
    abi: uniswapV2PoolAbi,
    name: 'Swap',
  });
  const uniV3SwapTransfer = getAbiItem({
    abi: uniswapV3PoolAbi,
    name: 'Swap',
  });
  const aeroV1SwapTransfer = getAbiItem({
    abi: aerodromeV1PoolAbi,
    name: 'Swap',
  });
  const entryPointAccountDeployment = getAbiItem({
    abi: entryPoint070Abi,
    name: 'AccountDeployed',
  });
  const aaveV3TokenMint = getAbiItem({
    abi: aaveV3TokenAbi,
    name: 'Mint',
  });
  const aaveV3TokenBurn = getAbiItem({
    abi: aaveV3TokenAbi,
    name: 'Burn',
  });
  const zora721TokenSale = getAbiItem({
    abi: zora721TokenAbi,
    name: 'Sale',
  });
  const zora1155TokenPurchase = getAbiItem({
    abi: zora1155TokenAbi,
    name: 'Purchased',
  });
  if (topic === toEventSelector(erc20Transfer)) {
    if (size(log.data) !== 32) {
      return;
    }
    const decodedLog = decodeEventLog({
      abi: erc20Abi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Transfer') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'erc20') {
      return;
    }
    const name = addressLabel.value;
    const decimals = addressLabel?.metadata?.decimals as number | undefined;
    if (decimals === undefined) {
      return;
    }
    const from = decodedLog.args.from?.toLowerCase() as Address | undefined;
    const to = decodedLog.args.to?.toLowerCase() as Address | undefined;
    const value = decodedLog.args.value;
    if (!from || !to || !value) {
      return;
    }
    const amount = formatUnits(value, decimals);
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Transfer',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
          label: `${amount} ${name}`,
        },
        {
          type: 'text',
          value: 'from',
        },
        {
          type: 'address',
          address: from,
        },
        {
          type: 'text',
          value: 'to',
        },
        {
          type: 'address',
          address: to,
        },
      ],
    };
  } else if (topic === toEventSelector(uniV2SwapTransfer)) {
    const decodedLog = decodeEventLog({
      abi: uniswapV2PoolAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Swap') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'uniswap-v2-pool') {
      return;
    }
    const name = addressLabel.value;
    const tokens = addressLabel.metadata?.tokens as string[] | undefined;
    if (!tokens) {
      return;
    }
    const token0 = tokens[0];
    const token1 = tokens[1];
    if (!token0 || !token1) {
      return;
    }
    const token0Label = getLabel(token0 as Address);
    const token1Label = getLabel(token1 as Address);
    const token0Symbol = token0Label?.value as string | undefined;
    const token1Symbol = token1Label?.value as string | undefined;
    if (!token0Symbol || !token1Symbol) {
      return;
    }
    const token0Decimals = token0Label?.metadata?.decimals as
      | number
      | undefined;
    const token1Decimals = token1Label?.metadata?.decimals as
      | number
      | undefined;
    if (token0Decimals === undefined || token1Decimals === undefined) {
      return;
    }
    const amount0In = decodedLog.args.amount0In;
    const amount1In = decodedLog.args.amount1In;
    const amount0Out = decodedLog.args.amount0Out;
    const amount1Out = decodedLog.args.amount1Out;
    if (!amount0In || !amount1In || !amount0Out || !amount1Out) {
      return;
    }

    const is0To1 = amount0In > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? amount0In : amount1In,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? amount1Out : amount0Out,
      tokenOutDecimals,
    );
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Swap',
        },
        {
          type: 'address',
          address: tokenIn.toLowerCase() as Address,
          label: `${tokenInAmount} ${tokenInSymbol}`,
        },
        {
          type: 'text',
          value: 'for',
        },
        {
          type: 'address',
          address: tokenOut.toLowerCase() as Address,
          label: `${tokenOutAmount} ${tokenOutSymbol}`,
        },
        {
          type: 'text',
          value: 'through',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
          label: name,
        },
      ],
    };
  } else if (topic === toEventSelector(uniV3SwapTransfer)) {
    const decodedLog = decodeEventLog({
      abi: uniswapV3PoolAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Swap') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'uniswap-v3-pool') {
      return;
    }
    const name = addressLabel.value;
    const tokens = addressLabel.metadata?.tokens as string[] | undefined;
    if (!tokens) {
      return;
    }
    const token0 = tokens[0];
    const token1 = tokens[1];
    if (!token0 || !token1) {
      return;
    }
    const token0Label = getLabel(token0 as Address);
    const token1Label = getLabel(token1 as Address);
    const token0Symbol = token0Label?.value as string | undefined;
    const token1Symbol = token1Label?.value as string | undefined;
    if (!token0Symbol || !token1Symbol) {
      return;
    }
    const token0Decimals = token0Label?.metadata?.decimals as
      | number
      | undefined;
    const token1Decimals = token1Label?.metadata?.decimals as
      | number
      | undefined;
    if (token0Decimals === undefined || token1Decimals === undefined) {
      return;
    }
    const amount0 = decodedLog.args.amount0;
    const amount1 = decodedLog.args.amount1;
    if (!amount0 || !amount1) {
      return;
    }

    const is0To1 = amount0 > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? amount0 : amount1,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? -amount1 : -amount0,
      tokenOutDecimals,
    );
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Swap',
        },
        {
          type: 'address',
          address: tokenIn.toLowerCase() as Address,
          label: `${tokenInAmount} ${tokenInSymbol}`,
        },
        {
          type: 'text',
          value: 'for',
        },
        {
          type: 'address',
          address: tokenOut.toLowerCase() as Address,
          label: `${tokenOutAmount} ${tokenOutSymbol}`,
        },
        {
          type: 'text',
          value: 'through',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
          label: name,
        },
      ],
    };
  } else if (topic === toEventSelector(aeroV1SwapTransfer)) {
    const decodedLog = decodeEventLog({
      abi: aerodromeV1PoolAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Swap') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'aerodrome-v1-pool') {
      return;
    }
    const name = addressLabel.value;
    const tokens = addressLabel.metadata?.tokens as string[] | undefined;
    if (!tokens) {
      return;
    }
    const token0 = tokens[0];
    const token1 = tokens[1];
    if (!token0 || !token1) {
      return;
    }
    const token0Label = getLabel(token0 as Address);
    const token1Label = getLabel(token1 as Address);
    const token0Symbol = token0Label?.value as string | undefined;
    const token1Symbol = token1Label?.value as string | undefined;
    if (!token0Symbol || !token1Symbol) {
      return;
    }
    const token0Decimals = token0Label?.metadata?.decimals as
      | number
      | undefined;
    const token1Decimals = token1Label?.metadata?.decimals as
      | number
      | undefined;
    if (token0Decimals === undefined || token1Decimals === undefined) {
      return;
    }
    const amount0In = decodedLog.args.amount0In;
    const amount1In = decodedLog.args.amount1In;
    const amount0Out = decodedLog.args.amount0Out;
    const amount1Out = decodedLog.args.amount1Out;
    if (!amount0In || !amount1In || !amount0Out || !amount1Out) {
      return;
    }

    const is0To1 = amount0In > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? amount0In : amount1In,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? amount1Out : amount0Out,
      tokenOutDecimals,
    );
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Swap',
        },
        {
          type: 'address',
          address: tokenIn.toLowerCase() as Address,
          label: `${tokenInAmount} ${tokenInSymbol}`,
        },
        {
          type: 'text',
          value: 'for',
        },
        {
          type: 'address',
          address: tokenOut.toLowerCase() as Address,
          label: `${tokenOutAmount} ${tokenOutSymbol}`,
        },
        {
          type: 'text',
          value: 'through',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
          label: name,
        },
      ],
    };
  } else if (topic === toEventSelector(entryPointAccountDeployment)) {
    const decodedLog = decodeEventLog({
      abi: entryPoint070Abi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'AccountDeployed') {
      return;
    }
    const sender = decodedLog.args.sender?.toLowerCase() as Address | undefined;
    const factory = decodedLog.args.factory?.toLowerCase() as
      | Address
      | undefined;
    if (!sender || !factory) {
      return;
    }

    const addressLabel = getLabel(factory);
    return {
      icon: addressLabel?.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Deploy account',
        },
        {
          type: 'address',
          address: sender,
        },
        {
          type: 'text',
          value: 'using',
        },
        {
          type: 'address',
          address: factory,
        },
      ],
    };
  } else if (topic === toEventSelector(aaveV3TokenMint)) {
    const decodedLog = decodeEventLog({
      abi: aaveV3TokenAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Mint') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (
      addressLabelType.id !== 'aave-v3-atoken' &&
      addressLabelType.id !== 'aave-v3-vtoken'
    ) {
      return;
    }
    const underlying = addressLabel?.metadata?.underlying as
      | Address
      | undefined;
    if (underlying === undefined) {
      return;
    }
    const account = decodedLog.args.onBehalfOf?.toLowerCase() as
      | Address
      | undefined;
    if (!account) {
      return;
    }
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Deposit',
        },
        {
          type: 'address',
          address: underlying.toLowerCase() as Address,
        },
        {
          type: 'text',
          value: 'to',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
        },
        {
          type: 'text',
          value: 'for',
        },
        {
          type: 'address',
          address: account,
        },
      ],
    };
  } else if (topic === toEventSelector(aaveV3TokenBurn)) {
    const decodedLog = decodeEventLog({
      abi: aaveV3TokenAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Burn') {
      return;
    }
    const addressLabel = getLabel(log.address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (
      addressLabelType.id !== 'aave-v3-atoken' &&
      addressLabelType.id !== 'aave-v3-vtoken'
    ) {
      return;
    }
    const underlying = addressLabel?.metadata?.underlying as
      | Address
      | undefined;
    if (underlying === undefined) {
      return;
    }
    const account = decodedLog.args.target?.toLowerCase() as
      | Address
      | undefined;
    if (!account) {
      return;
    }
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Withdraw',
        },
        {
          type: 'address',
          address: underlying.toLowerCase() as Address,
        },
        {
          type: 'text',
          value: 'to',
        },
        {
          type: 'address',
          address: log.address.toLowerCase() as Address,
        },
        {
          type: 'text',
          value: 'for',
        },
        {
          type: 'address',
          address: account,
        },
      ],
    };
  } else if (topic === toEventSelector(zora721TokenSale)) {
    const decodedLog = decodeEventLog({
      abi: zora721TokenAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Sale') {
      return;
    }
    const address = log.address.toLowerCase() as Address;
    const addressLabel = getLabel(address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'zora-721-token') {
      return;
    }
    const amount = decodedLog.args.quantity;
    if (!amount) {
      return;
    }
    const account = decodedLog.args.to?.toLowerCase() as Address | undefined;
    if (!account) {
      return;
    }
    const token = addressLabel.namespace
      ? `${addressLabel.namespace.value}: ${addressLabel.value}`
      : addressLabel.value;
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Mint',
        },
        {
          type: 'address',
          address,
          label: `${amount} ${token}`,
        },
        {
          type: 'text',
          value: 'by',
        },
        {
          type: 'address',
          address: account,
        },
      ],
    };
  } else if (topic === toEventSelector(zora1155TokenPurchase)) {
    const decodedLog = decodeEventLog({
      abi: zora1155TokenAbi,
      topics: log.topics,
      data: log.data,
      strict: false,
    });
    if (!decodedLog) {
      return;
    }
    if (decodedLog.eventName !== 'Purchased') {
      return;
    }
    const address = log.address.toLowerCase() as Address;
    const addressLabel = getLabel(address);
    if (!addressLabel) {
      return;
    }
    const addressLabelType = addressLabel.type;
    if (!addressLabelType) {
      return;
    }
    if (addressLabelType.id !== 'zora-1155-token') {
      return;
    }
    const amount = decodedLog.args.quantity;
    if (!amount) {
      return;
    }
    const tokenId = decodedLog.args.tokenId;
    if (!tokenId) {
      return;
    }
    const account = decodedLog.args.sender?.toLowerCase() as
      | Address
      | undefined;
    if (!account) {
      return;
    }
    const token = addressLabel.namespace
      ? `${addressLabel.namespace.value}: ${addressLabel.value}`
      : addressLabel.value;
    return {
      icon: addressLabel.iconUrl,
      parts: [
        {
          type: 'text',
          value: 'Mint',
        },
        {
          type: 'address',
          address,
          label: `${amount} ${token} #${tokenId}`,
        },
        {
          type: 'text',
          value: 'by',
        },
        {
          type: 'address',
          address: account,
        },
      ],
    };
  }
}

export { getContractDeployment, getOp, getLogs };
export type { Item };
