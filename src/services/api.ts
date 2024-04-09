import { Address } from 'viem';

import useEnv from '@/composables/useEnv';
import { Chain } from '@/utils/chains';

type LabelType =
  | 'wrapped'
  | 'erc20'
  | 'aave-v2-atoken'
  | 'aave-v2-variable-debt-token'
  | 'aave-v2-stable-debt-token'
  | 'aave-v3-atoken'
  | 'aave-v3-vtoken'
  | 'aave-v3-stoken'
  | 'biconomy-v2-account'
  | 'kernel-v2-account'
  | 'rhinestone-v1-module'
  | 'safe-v1.3.0-account'
  | 'safe-v1.4.1-account'
  | 'uniswap-v2-pool'
  | 'uniswap-v3-pool';

interface Label {
  value: string;
  namespace?: string;
  type?: LabelType;
  metadata?: Record<string, unknown>;
}

type LabelWithAddress = Label & {
  address: string;
};

const { apiEndpoint } = useEnv();

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
