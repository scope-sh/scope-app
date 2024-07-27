import ky, { type KyInstance } from 'ky';
import type { Address, Hex } from 'viem';

import type { Chain } from '@/utils/chains.js';

interface HashUserOpResponse {
  data: {
    UserOp: {
      transactionHash: Hex;
    }[];
  };
}

interface UserOpsResponse {
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

interface UserOp {
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

  public async getTxHashByUserOpHash(hash: Hex): Promise<Hex | null> {
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

    const json = (await response.json()) as HashUserOpResponse;
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

  public async getUserOpsByAddress(
    address: Address,
    offset: number,
    limit: number,
  ): Promise<UserOp[]> {
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

    const json = (await response.json()) as UserOpsResponse;
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
export type { UserOp };
