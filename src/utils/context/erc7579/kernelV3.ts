import { Address, Hex, slice, toBytes, toHex } from 'viem';

type ValidationMode = 'default' | 'enable' | 'install';
type ValidationType = 'root' | 'validator' | 'permission';

interface NonceDecoded {
  mode: ValidationMode;
  vType: ValidationType;
  identifier: Address;
}

function bitwiseAndHexStrings(hex1: Hex, hex2: Hex): Hex {
  const num1 = BigInt(`0x${hex1}`);
  const num2 = BigInt(`0x${hex2}`);
  const result = num1 & num2;
  return result.toString(16) as Hex;
}

function decodeNonce(nonce: bigint): NonceDecoded | null {
  function decodeValidationMode(modeIndex: Hex): ValidationMode | null {
    switch (modeIndex) {
      case '0x00':
        return 'default';
      case '0x01':
        return 'enable';
      case '0x02':
        return 'install';
      default:
        return null;
    }
  }
  function decodeValidationType(vType: Hex): ValidationType | null {
    switch (vType) {
      case '0x00':
        return 'root';
      case '0x01':
        return 'validator';
      case '0x02':
        return 'permission';
      default:
        return null;
    }
  }

  const nonceHex: Hex = toHex(toBytes(nonce, { size: 32 }));
  const modeIndex = slice(nonceHex, 0, 1);
  const vTypeIndex = slice(nonceHex, 1, 2);
  let identifier = slice(nonceHex, 2, 22);
  const mode = decodeValidationMode(modeIndex);
  const vType = decodeValidationType(vTypeIndex);
  if (mode === null || vType === null) {
    return null;
  }
  if (slice(nonceHex, 31, 32) === '0x02') {
    identifier = bitwiseAndHexStrings(
      identifier,
      '0xffffffffff000000000000000000000000000000000000000000000000000000',
    );
  }
  return { mode, vType, identifier };
}

// eslint-disable-next-line import/prefer-default-export
export { decodeNonce };
