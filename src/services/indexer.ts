import { Address, Hex } from 'viem';

import { Chain } from '@/utils/chains';

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
  transactionHash: Hex;
  hash: Hex;
  paymaster: Address;
  bundler: Address;
  nonce: bigint;
}

class Service {
  endpointUrl: string;
  chainId: Chain;

  constructor(endpointUrl: string, chainId: Chain) {
    this.endpointUrl = endpointUrl;
    this.chainId = chainId;
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

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
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
        }
      ) {
        success
        entryPoint
        blockNumber
        transactionHash
        hash
        paymaster
        bundler
        nonce
      }
    }`;

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as UserOpsResponse;
    if (json.data.UserOp.length === 0) {
      return [];
    } else {
      return json.data.UserOp.map((userOp) => ({
        success: userOp.success,
        entryPoint: userOp.entryPoint as Address,
        blockNumber: userOp.blockNumber,
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
