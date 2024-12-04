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

import entryPoint070Abi from '@/abi/entryPointV0_7_0';
import erc20Abi from '@/abi/erc20';
import type { Label } from '@/services/api';
import type { OpUnpacked } from '@/utils/context/erc4337/entryPoint';

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
  const entryPointAccountDeployment = getAbiItem({
    abi: entryPoint070Abi,
    name: 'AccountDeployed',
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
  }
}

export { getContractDeployment, getOp, getLogs };
export type { Item };
