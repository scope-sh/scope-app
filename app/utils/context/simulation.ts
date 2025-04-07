import * as v from 'valibot';
import { type Address, type Hex, size, slice } from 'viem';

const AddressSchema = v.pipe(
  v.string(),
  v.regex(/^0x[0-9a-fA-F]{40}$/, 'Must be a valid Ethereum address'),
  v.transform((value) => value.toLowerCase() as Address),
);
const HexStringSchema = v.pipe(
  v.string(),
  v.regex(/^0x[0-9a-fA-F]*$/, 'Must be a valid hex string starting with 0x'),
  v.transform((value) => value.toLowerCase() as Hex),
);
// A string that represents a big integer
const BigIntSchema = v.pipe(
  v.string(),
  // v.regex(/^\d+$/, 'Must be a valid big integer'),
  v.regex(/^0x[0-9a-fA-F]+$/, 'Must be a valid hex string starting with 0x'),
  v.transform((value) => BigInt(value)),
);

const Op_0_6_Schema = v.pipe(
  v.object({
    sender: AddressSchema,
    nonce: BigIntSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    callGasLimit: BigIntSchema,
    verificationGasLimit: BigIntSchema,
    preVerificationGas: BigIntSchema,
    maxFeePerGas: BigIntSchema,
    maxPriorityFeePerGas: BigIntSchema,
    paymasterAndData: HexStringSchema,
    signature: HexStringSchema,
  }),
  v.transform((op) => {
    const initCodeUnpacked =
      size(op.initCode as Hex) > 0
        ? {
            factory: slice(op.initCode as Hex, 0, 20),
            factoryData: slice(op.initCode as Hex, 20),
          }
        : {
            factory: null,
            factoryData: null,
          };
    const paymasterDataUnpacked =
      size(op.paymasterAndData as Hex) > 0
        ? size(op.paymasterAndData as Hex) > 20
          ? {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 20, 36),
              ),
              paymasterPostOpGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 36, 52),
              ),
              paymasterData:
                size(op.paymasterAndData as Hex) > 52
                  ? slice(op.paymasterAndData as Hex, 52)
                  : '0x',
            }
          : {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: null,
              paymasterPostOpGasLimit: null,
              paymasterData: null,
            }
        : {
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
          };
    return {
      sender: op.sender.toLowerCase() as Address,
      nonce: op.nonce,
      factory: initCodeUnpacked.factory,
      factoryData: initCodeUnpacked.factoryData,
      callData: op.callData,
      paymaster: paymasterDataUnpacked.paymaster,
      paymasterVerificationGasLimit:
        paymasterDataUnpacked.paymasterVerificationGasLimit,
      paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
      paymasterData: paymasterDataUnpacked.paymasterData,
      signature: op.signature,
      preVerificationGas: op.preVerificationGas,
      verificationGasLimit: op.verificationGasLimit,
      callGasLimit: op.callGasLimit,
      maxFeePerGas: op.maxFeePerGas,
      maxPriorityFeePerGas: op.maxPriorityFeePerGas,
    } as OpSchema;
  }),
);

// Mirrors the UserOperation<'0.7'> type from viem
const Op_0_7_Schema = v.pipe(
  v.object({
    sender: AddressSchema,
    nonce: BigIntSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    accountGasLimits: BigIntSchema,
    preVerificationGas: BigIntSchema,
    gasFees: BigIntSchema,
    paymasterAndData: HexStringSchema,
    signature: HexStringSchema,
  }),
  v.transform((op) => {
    const initCodeUnpacked =
      size(op.initCode as Hex) > 0
        ? {
            factory: slice(op.initCode as Hex, 0, 20),
            factoryData: slice(op.initCode as Hex, 20),
          }
        : {
            factory: null,
            factoryData: null,
          };
    const paymasterDataUnpacked =
      size(op.paymasterAndData as Hex) > 0
        ? size(op.paymasterAndData as Hex) > 20
          ? {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 20, 36),
              ),
              paymasterPostOpGasLimit: BigInt(
                slice(op.paymasterAndData as Hex, 36, 52),
              ),
              paymasterData:
                size(op.paymasterAndData as Hex) > 52
                  ? slice(op.paymasterAndData as Hex, 52)
                  : '0x',
            }
          : {
              paymaster: slice(op.paymasterAndData as Hex, 0, 20),
              paymasterVerificationGasLimit: null,
              paymasterPostOpGasLimit: null,
              paymasterData: null,
            }
        : {
            paymaster: null,
            paymasterVerificationGasLimit: null,
            paymasterPostOpGasLimit: null,
            paymasterData: null,
          };
    const verificationGasLimit = BigInt(
      slice(`0x${op.accountGasLimits.toString(16)}`, 0, 16),
    );
    const callGasLimit = BigInt(
      slice(`0x${op.accountGasLimits.toString(16)}`, 16),
    );
    const maxPriorityFeePerGas = BigInt(
      slice(`0x${op.gasFees.toString(16)}`, 0, 16),
    );
    const maxFeePerGas = BigInt(slice(`0x${op.gasFees.toString(16)}`, 16));
    return {
      sender: op.sender.toLowerCase() as Address,
      nonce: op.nonce,
      factory: initCodeUnpacked.factory,
      factoryData: initCodeUnpacked.factoryData,
      callData: op.callData,
      paymaster: paymasterDataUnpacked.paymaster,
      paymasterVerificationGasLimit:
        paymasterDataUnpacked.paymasterVerificationGasLimit,
      paymasterPostOpGasLimit: paymasterDataUnpacked.paymasterPostOpGasLimit,
      paymasterData: paymasterDataUnpacked.paymasterData,
      signature: op.signature,
      preVerificationGas: op.preVerificationGas,
      verificationGasLimit: verificationGasLimit,
      callGasLimit: callGasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
    } as OpSchema;
  }),
);

const Op_0_8_Schema = Op_0_7_Schema;

const UnpackedOpSchema = v.object({
  callData: HexStringSchema,
  callGasLimit: BigIntSchema,
  factory: v.optional(v.nullable(AddressSchema)),
  factoryData: v.optional(v.nullable(HexStringSchema)),
  maxFeePerGas: BigIntSchema,
  maxPriorityFeePerGas: BigIntSchema,
  nonce: BigIntSchema,
  paymaster: v.optional(v.nullable(AddressSchema)),
  paymasterData: v.optional(v.nullable(HexStringSchema)),
  paymasterPostOpGasLimit: v.optional(v.nullable(BigIntSchema)),
  paymasterVerificationGasLimit: v.optional(v.nullable(BigIntSchema)),
  preVerificationGas: BigIntSchema,
  sender: AddressSchema,
  signature: HexStringSchema,
  verificationGasLimit: BigIntSchema,
});
type OpSchema = v.InferOutput<typeof UnpackedOpSchema>;

const OpUnionSchema = v.union([
  UnpackedOpSchema,
  Op_0_6_Schema,
  Op_0_7_Schema,
  Op_0_8_Schema,
]);

export {
  Op_0_6_Schema,
  Op_0_7_Schema,
  Op_0_8_Schema,
  OpUnionSchema,
  UnpackedOpSchema,
};
