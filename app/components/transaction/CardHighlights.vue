<template>
  <BaseCard
    v-if="items.length > 0"
    :items
  />
</template>

<script setup lang="ts">
import {
  getContractAddress,
  size,
  type Address,
  type Transaction,
  type Log,
  getAbiItem,
  toEventSelector,
  decodeEventLog,
  formatUnits,
} from 'viem';
import { computed } from 'vue';

import aerodromeV1PoolAbi from '@/abi/aerodromeV1Pool';
import erc20Abi from '@/abi/erc20';
import uniswapV2PoolAbi from '@/abi/uniswapV2Pool';
import uniswapV3PoolAbi from '@/abi/uniswapV3Pool';
import type { Item } from '@/components/__common/CardHighlights.vue';
import BaseCard from '@/components/__common/CardHighlights.vue';
import useLabels from '@/composables/useLabels';

const { getLabel } = useLabels();

const props = defineProps<{
  transaction: Transaction;
  logs: Log[];
}>();

const items = computed<Item[]>(() => {
  const contractDeployment = getContractDeployment();
  const logItems = getLogItems(props.logs);
  return [...contractDeployment, ...logItems];
});

function getContractDeployment(): Item[] {
  const toAddress = props.transaction.to;
  const input = props.transaction.input;
  if (!toAddress && size(input) > 0) {
    const from = props.transaction.from;
    const nonce = BigInt(props.transaction.nonce);
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

function getLogItems(logs: Log[]): Item[] {
  const items: Item[] = [];
  for (const log of logs) {
    const logItem = getLogItem(log);
    if (logItem) {
      items.push(logItem);
    }
  }
  return items;
}

function getLogItem(log: Log): Item | undefined {
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
  if (topic === toEventSelector(erc20Transfer)) {
    const decodedLog = decodeEventLog({
      abi: erc20Abi,
      topics: log.topics,
      data: log.data,
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
    const amount = formatUnits(decodedLog.args.value, decimals);
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
          address: decodedLog.args.from.toLowerCase() as Address,
        },
        {
          type: 'text',
          value: 'to',
        },
        {
          type: 'address',
          address: decodedLog.args.to.toLowerCase() as Address,
        },
      ],
    };
  } else if (topic === toEventSelector(uniV2SwapTransfer)) {
    const decodedLog = decodeEventLog({
      abi: uniswapV2PoolAbi,
      topics: log.topics,
      data: log.data,
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
    const is0To1 = decodedLog.args.amount0In > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? decodedLog.args.amount0In : decodedLog.args.amount1In,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? decodedLog.args.amount1Out : decodedLog.args.amount0Out,
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
    const is0To1 = decodedLog.args.amount0 > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? decodedLog.args.amount0 : decodedLog.args.amount1,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? -decodedLog.args.amount1 : -decodedLog.args.amount0,
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
    const is0To1 = decodedLog.args.amount0In > 0n;
    const tokenIn = is0To1 ? token0 : token1;
    const tokenOut = is0To1 ? token1 : token0;
    const tokenInSymbol = is0To1 ? token0Symbol : token1Symbol;
    const tokenOutSymbol = is0To1 ? token1Symbol : token0Symbol;
    const tokenInDecimals = is0To1 ? token0Decimals : token1Decimals;
    const tokenOutDecimals = is0To1 ? token1Decimals : token0Decimals;
    const tokenInAmount = formatUnits(
      is0To1 ? decodedLog.args.amount0In : decodedLog.args.amount1In,
      tokenInDecimals,
    );
    const tokenOutAmount = formatUnits(
      is0To1 ? decodedLog.args.amount1Out : decodedLog.args.amount0Out,
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
  }
}
</script>
