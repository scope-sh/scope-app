const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'ModuleInstalled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'ModuleUninstalled',
    type: 'event',
  },
  {
    inputs: [],
    name: 'accountId',
    outputs: [
      {
        internalType: 'string',
        name: 'accountImplementationId',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'mode',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'executionCalldata',
        type: 'bytes',
      },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'mode',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'executionCalldata',
        type: 'bytes',
      },
    ],
    name: 'executeFromExecutor',
    outputs: [
      {
        internalType: 'bytes[]',
        name: 'returnData',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'initData',
        type: 'bytes',
      },
    ],
    name: 'installModule',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'additionalContext',
        type: 'bytes',
      },
    ],
    name: 'isModuleInstalled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'isValidSignature',
    outputs: [
      {
        internalType: 'bytes4',
        name: '',
        type: 'bytes4',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'encodedMode',
        type: 'bytes32',
      },
    ],
    name: 'supportsExecutionMode',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
    ],
    name: 'supportsModule',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'moduleTypeId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'deInitData',
        type: 'bytes',
      },
    ],
    name: 'uninstallModule',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export default abi;
