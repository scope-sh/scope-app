import type { Address, Hex } from 'viem';
import { slice } from 'viem';

import { decodeCallData as decodeAlchemyLightV2CallData } from './alchemyLightV2.js';
import { decodeCallData as decodeBiconomyV2CallData } from './biconomyV2.js';
import { decodeCallData as decodeDaimoCallData } from './daimo.js';
import { decodeCallData as decodeFunV1CallData } from './funV1.js';
import { decodeCallData as decodeKernelV2CallData } from './kernelV2.js';
import { decodeCallData as decodeKernelV3CallData } from './kernelV3.js';
import { decodeCallData as decodeSafeCoreCallData } from './safeCore.js';

interface Call {
  to: Address;
  value: bigint;
  data: Hex;
}

function decode(callData: Hex): Call[] | null {
  const selector = slice(callData, 0, 4);
  try {
    switch (selector) {
      // Kernel V3 `execute` function
      case '0xe9ae5c53':
        return decodeKernelV3CallData(callData);
      // Safe Core 4337 module
      case '0x541d63c8':
      case '0x7bb37428': {
        return decodeSafeCoreCallData(callData);
      }
      // Daimo "executeBatch" function
      case '0x34fcd5be':
        return decodeDaimoCallData(callData);
      // Biconomy V2
      case '0x0000189a':
      case '0x00004680':
      case '0x47e1da2a':
      case '0xb61d27f6':
        return decodeBiconomyV2CallData(callData);
      // Kernel V2
      case '0x51945447':
        return decodeKernelV2CallData(callData);
      // Alchemy Light V2
      case '0x18dfb3c7':
        return decodeAlchemyLightV2CallData(callData);
      // Fun V1
      case '0x80c5c7d0':
      case '0xe007fd8d':
        return decodeFunV1CallData(callData);
    }
  } catch {
    return null;
  }
  return null;
}

export { decode };
export type { Call };
