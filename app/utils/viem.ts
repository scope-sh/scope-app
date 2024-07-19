import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type PublicActions,
  type ReadContractParameters,
  type ReadContractReturnType,
  type RpcSchema,
  type Transport,
} from 'viem';

type EnsActions = {
  readContractWithNames: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
    args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
  >(
    parameters: ReadContractParameters<abi, functionName, args>,
  ) => Promise<ReadContractReturnType<abi, functionName, args>>;
};

function ensActions() {
  return <
    transport extends Transport,
    chain extends Chain | undefined = Chain | undefined,
    account extends Account | undefined = Account | undefined,
    rpcSchema extends RpcSchema | undefined = RpcSchema | undefined,
    extended extends PublicActions = PublicActions,
  >(
    client: Client<transport, chain, account, rpcSchema, extended>,
  ): EnsActions => {
    return {
      readContractWithNames: (parameters) =>
        readContractWithNames(client, parameters),
    };
  };
}

// Resolves ENS names to addresses.
// Calls a read-only function on a contract, and returns the response.
async function readContractWithNames<
  chain extends Chain | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'pure' | 'view'>,
  const args extends ContractFunctionArgs<abi, 'pure' | 'view', functionName>,
>(
  client: Client<
    Transport,
    chain,
    Account | undefined,
    undefined,
    PublicActions
  >,
  parameters: ReadContractParameters<abi, functionName, args>,
): Promise<ReadContractReturnType<abi, functionName, args>> {
  // Get the list of all ENS names
  const ensNames = parameters.args
    ? (parameters.args as unknown[]).map((arg) => getEnsNames(arg)).flat()
    : [];
  const uniqueEnsNames = [...new Set(ensNames)];
  // Resolve each ENS name to an address
  const resolvedAddresses = await Promise.all(
    uniqueEnsNames.map((name) => client.getEnsAddress({ name })),
  );
  const nameMap = uniqueEnsNames.reduce(
    (acc, name, index) => {
      const resolvedAddres = resolvedAddresses[index];
      if (resolvedAddres) {
        acc[name] = resolvedAddres;
      }
      return acc;
    },
    {} as Record<string, Address>,
  );
  // Replace the ENS names with the resolved addresses
  const resolvedArgs = parameters.args
    ? replaceEnsNames(parameters.args, nameMap)
    : [];
  parameters.args = resolvedArgs as ContractFunctionArgs<
    abi,
    'pure' | 'view',
    functionName
  >;
  // Call the original readContract method
  return await client.readContract(parameters);
}

function getEnsNames(arg: unknown): string[] {
  function isEnsName(value: string): boolean {
    const nameRegex = /.+\.eth$/;
    return !!value.match(nameRegex);
  }

  // If it's an array, map over it and call getEnsNames on each element
  if (Array.isArray(arg)) {
    return arg.map(getEnsNames).flat();
  }
  // If it's an object, call getEnsNames on each value
  if (typeof arg === 'object') {
    if (arg === null) {
      return [];
    }
    return Object.values(arg).map(getEnsNames).flat();
  }
  // If it's a string, check if it's an ENS name
  if (typeof arg === 'string') {
    return isEnsName(arg) ? [arg] : [];
  }
  return [];
}

function replaceEnsNames(
  arg: unknown,
  nameMap: Record<string, Address>,
): unknown {
  if (Array.isArray(arg)) {
    return arg.map((value) => replaceEnsNames(value, nameMap));
  }
  if (typeof arg === 'object') {
    if (arg === null) {
      return null;
    }
    return Object.fromEntries(
      Object.entries(arg).map(([key, value]) => [
        key,
        replaceEnsNames(value, nameMap),
      ]),
    );
  }
  if (typeof arg === 'string') {
    return nameMap[arg] || arg;
  }
  return arg;
}

// eslint-disable-next-line import/prefer-default-export
export { ensActions };
