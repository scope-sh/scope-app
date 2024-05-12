import { Abi, Address, Hex } from 'viem';

import useEnv from '@/composables/useEnv';
import { Chain } from '@/utils/chains';

type LabelId =
  | 'wrapped'
  | 'erc20'
  | 'aave-v2-atoken'
  | 'aave-v2-variable-debt-token'
  | 'aave-v2-stable-debt-token'
  | 'aave-v3-atoken'
  | 'aave-v3-vtoken'
  | 'aave-v3-stoken'
  | 'biconomy-v2-account'
  | 'coinbase-smart-wallet-v1-account'
  | 'daimo-v1-account'
  | 'kernel-v2-account'
  | 'kernel-v3-account'
  | 'erc7579-module'
  | 'fun-v1-account'
  | 'light-v0.1-account'
  | 'light-v0.2-account'
  | 'patch-wallet-v1-account'
  | 'rhinestone-v1-module'
  | 'safe-v1.3.0-account'
  | 'safe-v1.4.1-account'
  | 'uniswap-v2-pool'
  | 'uniswap-v3-pool';

interface LabelType {
  id: LabelId;
  value: string;
}

interface LabelNamespace {
  id: string;
  value: string;
}

interface Label {
  value: string;
  namespace?: LabelNamespace;
  type?: LabelType;
  iconUrl?: string;
  metadata?: Record<string, unknown>;
}

type LabelWithAddress = Label & {
  address: Address;
};

interface Transaction {
  blockNumber: number;
  from: Address;
  gasPrice: Hex;
  hash: Hex;
  input: Hex;
  to: Address | undefined;
  transactionIndex: number;
  value: Hex;
  status: number;
}

interface Log {
  blockNumber: number;
  transactionHash: Hex;
  logIndex: number;
  address: Address;
  topics: Hex[];
  data: Hex;
}

type ContractLanguage = 'Solidity' | 'Vyper';
type ContractCompiler = 'solc' | 'vyper';
type Evm =
  | 'default'
  | 'byzantium'
  | 'constantinople'
  | 'petersburg'
  | 'istanbul'
  | 'berlin'
  | 'london'
  | 'shanghai'
  | 'istanbul';

interface SourceCode {
  name: string;
  entry: string;
  files: Record<string, string>;
  constructorArguments: string;
  evm: Evm;
  language: ContractLanguage;
  compiler: {
    type: ContractCompiler;
    version: string;
  };
  compilation: {
    optimization: {
      runs: number;
    } | null;
  };
}
type Contract = ProxyContract | StaticContract;
interface BaseContract {
  source: SourceCode;
  abi: Abi;
  isProxy: boolean;
}
interface ProxyContract extends BaseContract {
  isProxy: true;
  implementation: {
    address: Address;
    abi: Abi;
    source: SourceCode;
  } | null;
}
interface StaticContract extends BaseContract {
  isProxy: false;
}

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

  public async getContractSource(address: Address): Promise<Contract> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
      address,
    };
    const url = new URL(`${apiEndpoint}/contract/source`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    const source: Contract = await response.json();
    return source;
  }
}

export default Service;
export type { Label, LabelId, Log, Transaction, Contract, SourceCode };
