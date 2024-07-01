import type { Abi, AbiEvent, AbiFunction, Address, Hex } from 'viem';

import useEnv from '@/composables/useEnv';
import type { Chain } from '@/utils/chains.js';

type LabelTypeId =
  | 'erc20'
  | 'erc721'
  | 'erc1155'
  | 'aave-v2-atoken'
  | 'aave-v2-variable-debt-token'
  | 'aave-v2-stable-debt-token'
  | 'aave-v3-atoken'
  | 'aave-v3-vtoken'
  | 'aave-v3-stoken'
  | 'alchemy-v1-multi-owner-modular-account'
  | 'alchemy-v1.0-light-account'
  | 'alchemy-v1.0-light-account'
  | 'alchemy-v1.1-light-account'
  | 'alchemy-v2-light-account'
  | 'alchemy-v2-multi-owner-light-account'
  | 'biconomy-v2-account'
  | 'coinbase-smart-wallet-v1-account'
  | 'daimo-v1-account'
  | 'entry-point-v0.6.0-account'
  | 'entry-point-v0.7.0-account'
  | 'kernel-v1-account'
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
  | 'thirdweb-v1-managed-account'
  | 'uniswap-v2-pool'
  | 'uniswap-v3-pool';

interface LabelType {
  id: LabelTypeId;
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
  constructorArguments: Hex;
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

interface Contract {
  abi: Abi | null;
  source: SourceCode | null;
  implementation: {
    address: Address;
    abi: Abi | null;
    source: SourceCode | null;
  } | null;
}

interface ContractSelectors {
  address: Address;
  selectors: Hex[];
}

type Abis = Record<
  Address,
  {
    functions: Record<Hex, AbiFunction>;
    events: Record<Hex, AbiEvent>;
  }
>;

const { apiEndpoint } = useEnv();

class Service {
  chainId: Chain;

  constructor(chainId: Chain) {
    this.chainId = chainId;
  }

  public async getAllAddressLabels(address: Address): Promise<Label[]> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
      address,
    };
    const url = new URL(`${apiEndpoint}/label/all`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url);
    const labels: Label[] = await response.json();
    return labels;
  }

  public async getPrimaryAddressLabels(
    addresses: Address[],
  ): Promise<Record<Address, Label>> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
    };
    const body = JSON.stringify({ addresses });
    const url = new URL(`${apiEndpoint}/label/primary`);
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

  public async getContractAbi(
    contracts: Record<
      Address,
      {
        events: Hex[];
        functions: Hex[];
      }
    >,
  ): Promise<Abis> {
    const params: Record<string, string> = {
      chain: this.chainId.toString(),
    };
    const url = new URL(`${apiEndpoint}/contract/abi`);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contracts }),
    });
    const abis: Abis = await response.json();
    return abis;
  }
}

export default Service;
export type {
  Label,
  LabelType,
  LabelTypeId,
  Log,
  Transaction,
  Contract,
  SourceCode,
  ContractSelectors,
  Abis,
};
