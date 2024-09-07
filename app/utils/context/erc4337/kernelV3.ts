import type { Hex } from 'viem';

import { decodeCallData as decode } from '../erc7579/kernelV3.js';

import type { Call } from './callData.js';

function decodeCallData(callData: Hex): Call[] | null {
  const decoded = decode(callData);
  if (!decoded) {
    return null;
  }
  if (decoded.type === 'single') {
    return [decoded.execution];
  }
  if (decoded.type === 'batch') {
    return decoded.executions;
  }
  return null;
}

// eslint-disable-next-line import/prefer-default-export
export { decodeCallData };
