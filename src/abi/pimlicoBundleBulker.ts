const abi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint32', name: 'id', type: 'uint32' },
      {
        indexed: false,
        internalType: 'contract IInflator',
        name: 'inflator',
        type: 'address',
      },
    ],
    name: 'InflatorRegistered',
    type: 'event',
  },
  { stateMutability: 'nonpayable', type: 'fallback' },
  {
    inputs: [],
    name: 'ENTRY_POINT',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    name: 'idToInflator',
    outputs: [
      { internalType: 'contract IInflator', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: 'compressed', type: 'bytes' }],
    name: 'inflate',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'sender', type: 'address' },
          { internalType: 'uint256', name: 'nonce', type: 'uint256' },
          { internalType: 'bytes', name: 'initCode', type: 'bytes' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
          { internalType: 'uint256', name: 'callGasLimit', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'verificationGasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          { internalType: 'uint256', name: 'maxFeePerGas', type: 'uint256' },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          { internalType: 'bytes', name: 'paymasterAndData', type: 'bytes' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct UserOperation[]',
        name: 'ops',
        type: 'tuple[]',
      },
      { internalType: 'address payable', name: 'beneficiary', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'contract IInflator', name: '', type: 'address' }],
    name: 'inflatorToID',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint32', name: 'inflatorId', type: 'uint32' },
      { internalType: 'contract IInflator', name: 'inflator', type: 'address' },
    ],
    name: 'registerInflator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default abi;
