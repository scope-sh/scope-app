import type { Address, PublicClient } from 'viem';
import { createPublicClient, http } from 'viem';

import { ETHEREUM, getChainData, getEndpointUrl } from '@/utils/chains';

class Service {
  ethereumClient: PublicClient;

  constructor(alchemyApiKey: string) {
    this.ethereumClient = createPublicClient({
      chain: getChainData(ETHEREUM),
      transport: http(getEndpointUrl(ETHEREUM, alchemyApiKey)),
    });
  }

  public async resolveEns(name: string): Promise<Address | null> {
    return await this.ethereumClient.getEnsAddress({ name });
  }
}

export default Service;
