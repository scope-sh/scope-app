import type { AbiConstructor, AbiError } from 'abitype';
import ky, { type KyInstance } from 'ky';
import type { Abi, AbiEvent, AbiFunction, Address, Hex } from 'viem';

import useEnv from '@/composables/useEnv';
import type { Chain } from '@/utils/chains.js';

type LabelTypeId = 'erc20' | 'erc721' | 'erc1155' | 'erc7579-module';

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
  delegation: {
    address: Address;
    abi: Abi | null;
    source: SourceCode | null;
  } | null;
}

interface ContractSelectors {
  address: Address;
  selectors: Hex[];
}

interface Deployment {
  deployer: Address;
  transactionHash: Hex;
}

type AbiRequests = Record<Address, AbiRequest>;

interface AbiRequest {
  constructors?: boolean;
  events?: Hex[];
  functions?: Hex[];
  functionNames?: Hex[];
  errors?: Hex[];
}

type Abis = Record<
  Address,
  {
    constructors: AbiConstructor[];
    functionNames: Record<Hex, string>;
    functions: Record<Hex, AbiFunction>;
    events: Record<Hex, AbiEvent>;
    errors: Record<Hex, AbiError>;
  }
>;

const { apiEndpoint } = useEnv();

class Service {
  chainId: Chain;
  client: KyInstance;

  constructor(chainId: Chain) {
    this.chainId = chainId;
    this.client = ky.create({
      prefixUrl: apiEndpoint,
      timeout: false,
    });
  }

  public async getAllAddressLabels(address: Address): Promise<Label[]> {
    const response = await this.client.get('label/all', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    return response.json<Label[]>();
  }

  public async getPrimaryAddressLabels(
    addresses: Address[],
  ): Promise<Record<Address, Label>> {
    const response = await this.client.post('label/primary', {
      searchParams: {
        chain: this.chainId,
      },
      json: {
        addresses,
      },
    });
    return response.json<Record<Address, Label>>();
  }

  public async searchLabels(query: string): Promise<LabelWithAddress[]> {
    const response = await this.client.get('label/search', {
      searchParams: {
        chain: this.chainId,
        query,
      },
    });
    return response.json<LabelWithAddress[]>();
  }

  public async getContract(address: Address): Promise<{
    source: Contract | null;
    deployment: Deployment | null;
  } | null> {
    const response = await this.client.get('contract/all', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    return response.json<{
      source: Contract | null;
      deployment: Deployment | null;
    } | null>();
  }

  public async getContractSource(address: Address): Promise<Contract> {
    const response = await this.client.get('contract/source', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    return response.json<Contract>();
  }

  public async getContractAbi(contracts: AbiRequests): Promise<Abis> {
    const response = await this.client.post('contract/abi', {
      searchParams: {
        chain: this.chainId,
      },
      json: {
        contracts,
      },
    });
    return response.json<Abis>();
  }

  public async getContractImplementation(address: Address): Promise<{
    address: Address | null;
  }> {
    const response = await this.client.get('contract/implementation', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    return response.json<{
      address: Address | null;
    }>();
  }

  public async getContractDeployment(
    address: Address,
  ): Promise<Deployment | null> {
    const response = await this.client.get('contract/deployment', {
      searchParams: {
        chain: this.chainId,
        address,
      },
    });
    return response.json<Deployment | null>();
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
  AbiRequests,
  AbiRequest,
  Deployment,
};
