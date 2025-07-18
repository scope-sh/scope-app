const abi = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'name', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'name', type: 'bytes32' },
      { name: 'coinType', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bytes' }],
  },
] as const;

export default abi;
