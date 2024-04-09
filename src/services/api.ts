import { Address } from 'viem';

import useEnv from '@/composables/useEnv';
import { Chain } from '@/utils/chains';
import { Label } from 'scope-registry';

const { apiEndpoint } = useEnv();

type LabelWithAddress = Label & {
  address: string;
};

class Service {
  chainId: Chain;

  constructor(chainId: Chain) {
    this.chainId = chainId;
  }

  public async getLabel(address: Address): Promise<LabelWithAddress | null> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
      address,
    };
    const url = new URL(`${apiEndpoint}/label/one`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    const label: LabelWithAddress | null = await response.json();
    return label;
  }

  public async getLabels(
    addresses: Address[],
  ): Promise<Record<Address, Label>> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
    };
    const body = JSON.stringify({ addresses });
    const url = new URL(`${apiEndpoint}/label/many`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const labels: Record<Address, Label> = await response.json();
    return labels;
  }

  public async searchLabels(query: string): Promise<LabelWithAddress[]> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
      query,
    };
    const url = new URL(`${apiEndpoint}/label/search`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    const labels: LabelWithAddress[] = await response.json();
    return labels;
  }
}

export default Service;
export type { Label };
