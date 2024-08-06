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

export { getQueryError };
export type { FetchQueryError, RevertQueryError, QueryError };
