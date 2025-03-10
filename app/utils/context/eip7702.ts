import {
  type Address,
  type Hex,
  type Signature,
  type ExactPartial,
  size,
  slice,
} from 'viem';

type Authorization<uint32 = number, signed extends boolean = false> = {
  contractAddress: Address;
  chainId: uint32;
  nonce: uint32;
} & (signed extends true ? Signature : ExactPartial<Signature>);
type AuthorizationList<
  uint32 = number,
  signed extends boolean = false,
> = readonly Authorization<uint32, signed>[];

type SignedAuthorization<uint32 = number> = Authorization<uint32, true>;
type SignedAuthorizationList<uint32 = number> =
  readonly SignedAuthorization<uint32>[];

function isDelegating(bytecode: Hex | null): boolean {
  if (!bytecode) {
    return false;
  }
  return size(bytecode) === 23 && slice(bytecode, 0, 3) === '0xef0100';
}

function getDelegation(bytecode: Hex | null): Address | null {
  if (!bytecode) {
    return null;
  }
  if (!isDelegating(bytecode)) {
    return null;
  }
  return slice(bytecode, 3, 23) as Address;
}

export { isDelegating, getDelegation };
export type {
  Authorization,
  AuthorizationList,
  SignedAuthorization,
  SignedAuthorizationList,
};
