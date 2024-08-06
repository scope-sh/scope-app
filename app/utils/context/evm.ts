import type {
  Abi,
  AbiConstructor,
  AbiFallback,
  AbiFunction,
  AbiReceive,
} from 'abitype';
import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  InvalidAddressError,
} from 'viem';

interface FetchQueryError {
  type: 'fetch';
  message: string;
}

interface RevertQueryError {
  type: 'revert';
  reason?: string;
}

interface EnsQueryError {
  type: 'ens';
  name?: string;
}

interface UnknownQueryError {
  type: 'unknown';
}

type QueryError =
  | FetchQueryError
  | RevertQueryError
  | EnsQueryError
  | UnknownQueryError;

type AbiFragment = AbiFunction | AbiConstructor | AbiFallback | AbiReceive;

function getFragmentName(fragment: AbiFragment): string {
  if (fragment.type === 'constructor') {
    return 'constructor';
  }
  if (fragment.type === 'fallback') {
    return 'fallback';
  }
  if (fragment.type === 'receive') {
    return 'receive';
  }
  return fragment.name;
}

function getFunctions(abi: Abi): AbiFunction[] {
  return abi.filter(
    (fragment): fragment is AbiFunction => fragment.type === 'function',
  );
}

function getConstants(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const constants = functions.filter((f) => isConstant(f));
  return constants;
}
function getParamlessFunctions(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const paramlessFunctions = functions.filter((f) => isParamless(f));
  return paramlessFunctions;
}
function getReadFunctions(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const readFunctions = functions.filter((f) => isReadFunction(f));
  return readFunctions;
}
function getNonpayableFunctions(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const writeFunctions = functions.filter((f) => isNonpayable(f));
  return writeFunctions;
}
function getPayableFunctions(abi: Abi): AbiFunction[] {
  const functions = getFunctions(abi);
  const payableFunctions = functions.filter((f) => isPayable(f));
  return payableFunctions;
}

function isConstant(func: AbiFunction): boolean {
  return (
    isReadable(func) &&
    func.inputs.length === 0 &&
    func.name === func.name.toUpperCase()
  );
}
function isParamless(func: AbiFunction): boolean {
  return (
    isReadable(func) &&
    func.inputs.length === 0 &&
    func.name !== func.name.toUpperCase()
  );
}
function isReadFunction(func: AbiFunction): boolean {
  return isReadable(func) && !isConstant(func) && !isParamless(func);
}
function isNonpayable(func: AbiFunction): boolean {
  return func.stateMutability === 'nonpayable';
}
function isPayable(func: AbiFunction): boolean {
  return func.stateMutability === 'payable';
}
function isReadable(func: AbiFunction): boolean {
  return func.stateMutability === 'view' || func.stateMutability === 'pure';
}

function getQueryError(e: unknown): QueryError {
  if (!(e instanceof BaseError)) {
    return {
      type: 'unknown',
    };
  }
  const invalidAddressError = e.walk(
    (err) => err instanceof InvalidAddressError,
  );
  if (invalidAddressError) {
    const nameRegex = /Address "(.*.eth)" is invalid./;
    const match = e.shortMessage.match(nameRegex);
    const name = match ? match[1] : undefined;
    return {
      type: 'ens',
      name,
    };
  }
  const contractFunctionExecutionError = e.walk(
    (err) => err instanceof ContractFunctionExecutionError,
  );
  if (
    contractFunctionExecutionError instanceof ContractFunctionExecutionError
  ) {
    const revertCause = contractFunctionExecutionError.cause;
    const revertCauseError = revertCause.walk(
      (err) => err instanceof ContractFunctionRevertedError,
    );
    if (revertCauseError instanceof ContractFunctionRevertedError) {
      return {
        type: 'revert',
        reason: revertCauseError.reason || revertCauseError.data?.errorName,
      };
    }
    return {
      type: 'revert',
    };
  }
  return {
    type: 'unknown',
  };
}

export {
  isParamless,
  isPayable,
  isNonpayable,
  getQueryError,
  getFragmentName,
  getConstants,
  getParamlessFunctions,
  getReadFunctions,
  getNonpayableFunctions,
  getPayableFunctions,
};
export type { AbiFragment, FetchQueryError, RevertQueryError, QueryError };
