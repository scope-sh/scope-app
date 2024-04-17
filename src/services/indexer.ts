import { Address, Hex } from 'viem';

import { Chain } from '@/utils/chains';

interface HashUserOpResponse {
  data: {
    UserOp: {
      txHash: Hex;
    }[];
  };
}

interface AddressUserOpsResponse {
  data: {
    UserOp: {
      blockNumber: string;
      hash: string;
      txHash: string;
      entryPoint: string;
      nonce: string;
      success: boolean;
    }[];
  };
}

interface AddressUserOp {
  blockNumber: number;
  hash: Hex;
  txHash: Hex;
  entryPoint: Address;
  nonce: number;
  success: boolean;
}

const ENDPOINT_URL = 'https://indexer.bigdevenergy.link/e64d4f6/v1/graphql';

class Service {
  chainId: Chain;

  constructor(chainId: Chain) {
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
        txHash
      }
    }`;

    const response = await fetch(ENDPOINT_URL, {
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
      return userOp.txHash;
    }
  }

  public async getAddressUserOps(sender: Address): Promise<AddressUserOp[]> {
    const query = `{
      UserOp(
        limit: 10,
        where: {
          chainId: {_eq: ${this.chainId}},
          sender: {_eq: "${sender}"}
        }
      ) {
        hash
        txHash
        entryPoint
        nonce
        success
      }
    }`;

    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const json = (await response.json()) as AddressUserOpsResponse;
    return json.data.UserOp.map((userOp) => ({
      blockNumber: parseInt(userOp.blockNumber),
      hash: userOp.hash as Hex,
      txHash: userOp.txHash as Hex,
      entryPoint: userOp.entryPoint as Address,
      nonce: parseInt(userOp.nonce),
      success: userOp.success,
    }));
  }
}

export default Service;
