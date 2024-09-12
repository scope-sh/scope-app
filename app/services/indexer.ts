import ky, { type KyInstance } from 'ky';
import type { Address, Hex } from 'viem';

import type { Chain } from '@/utils/chains.js';

interface HashOpResponse {
  data: {
    UserOp: {
      transactionHash: Hex;
    }[];
  };
}

interface OpsResponse {
  data: {
    UserOp: {
      success: boolean;
      entryPoint: string;
      blockNumber: number;
      blockTimestamp: number;
      transactionHash: string;
      hash: string;
      paymaster: string;
      bundler: string;
      nonce: string;
    }[];
  };
}

interface Op {
  success: boolean;
  entryPoint: Address;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: Hex;
  hash: Hex;
  paymaster: Address;
  bundler: Address;
  nonce: bigint;
}

class Service {
  chainId: Chain;
  client: KyInstance;

  constructor(endpointUrl: string, chainId: Chain) {
    this.chainId = chainId;
    this.client = ky.create({
      prefixUrl: endpointUrl,
    });
  }

  public async getTxHashByOpHash(hash: Hex): Promise<Hex | null> {
    const query = `{
      UserOp(where: {
        id: {
          _eq: "${this.chainId}-${hash}"
        }
      }
      ) {
        transactionHash
      }
    }`;

    const response = await this.client.post('', {
      json: { query },
    });

    const json = (await response.json()) as HashOpResponse;
    if (json.data.UserOp.length === 0) {
      return null;
    } else {
      const userOp = json.data.UserOp[0];
      if (!userOp) {
        return null;
      }
      return userOp.transactionHash;
    }
  }

  public async getOpsByAddress(
    address: Address,
    offset: number,
    limit: number,
  ): Promise<Op[]> {
    const query = `{
      UserOp(
        limit: ${limit},
        offset: ${offset},
        where: {
          chainId: {
            _eq: ${this.chainId}
          },
          sender: {
            _eq: "${address}"
          }
        },
        order_by: {
          blockTimestamp: desc
        }
      ) {
        success
        entryPoint
        blockNumber
        blockTimestamp
        transactionHash
        hash
        paymaster
        bundler
        nonce
      }
    }`;

    const response = await this.client.post('', {
      json: { query },
    });

    const json = (await response.json()) as OpsResponse;
    if (json.data.UserOp.length === 0) {
      return [];
    } else {
      return json.data.UserOp.map((userOp) => ({
        success: userOp.success,
        entryPoint: userOp.entryPoint as Address,
        blockNumber: userOp.blockNumber,
        blockTimestamp: userOp.blockTimestamp,
        transactionHash: userOp.transactionHash as Hex,
        hash: userOp.hash as Hex,
        paymaster: userOp.paymaster as Address,
        bundler: userOp.bundler as Address,
        nonce: BigInt(userOp.nonce),
      }));
    }
  }
}

export default Service;
export type { Op };
