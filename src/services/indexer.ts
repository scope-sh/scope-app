import { Hex } from 'viem';

import { Chain } from '@/utils/chains';

interface HashUserOpResponse {
  data: {
    UserOp: {
      txHash: Hex;
    }[];
  };
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
}

export default Service;
