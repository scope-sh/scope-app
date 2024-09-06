const abi = [
  {
    inputs: [],
    name: 'AccountAccessUnauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AccountInitializationFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AddingInvalidGuardian',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AddingInvalidOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AlreadySignedProposal',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CannotRemoveLastValidator',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ExecutionFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FallbackInvalidCallType',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'currentHook',
        type: 'address',
      },
    ],
    name: 'HookAlreadyInstalled',
    type: 'error',
  },
  {
    inputs: [],
    name: 'HookPostCheckFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'InvalidFallbackCaller',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'module',
        type: 'address',
      },
    ],
    name: 'InvalidModule',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProposal',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LinkedList_AlreadyInitialized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'entry',
        type: 'address',
      },
    ],
    name: 'LinkedList_EntryAlreadyInList',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'entry',
        type: 'address',
      },
    ],
    name: 'LinkedList_InvalidEntry',
    type: 'error',
  },
  {
    inputs: [],
    name: 'LinkedList_InvalidPage',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
    ],
    name: 'NoFallbackHandler',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotEnoughGuardians',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyGuardian',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyOwnerOrGuardianOrSelf',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyOwnerOrSelf',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyProxy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProposalResolved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProposalTimelocked',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ProposalUnresolved',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RemovingInvalidGuardian',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RemovingInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'CallType',
        name: 'callType',
        type: 'bytes1',
      },
    ],
    name: 'UnsupportedCallType',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'ExecType',
        name: 'execType',
        type: 'bytes1',
      },
    ],
    name: 'UnsupportedExecType',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'moduleType',
        type: 'uint256',
      },
    ],
    name: 'UnsupportedModuleType',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WalletNeedsOwner',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newGuardian',
        type: 'address',
      },
    ],
    name: 'GuardianAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'removedGuardian',
        type: 'address',
      },
    ],
    name: 'GuardianRemoved',
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
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnerAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'removedOwner',
        type: 'address',
      },
    ],
    name: 'OwnerRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'discardedBy',
        type: 'address',
      },
    ],
    name: 'ProposalDiscarded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newOwnerProposed',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'proposer',
        type: 'address',
      },
    ],
    name: 'ProposalSubmitted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newOwnerProposed',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'approvalCount',
        type: 'uint256',
      },
    ],
    name: 'QuorumNotReached',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'batchExecutionindex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'result',
        type: 'bytes',
      },
    ],
    name: 'TryExecuteUnsuccessful',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [],
    name: 'accountId',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newGuardian',
        type: 'address',
      },
    ],
    name: 'addGuardian',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'addOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newTimelock',
        type: 'uint256',
      },
    ],
    name: 'changeProposalTimelock',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'discardCurrentProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'entryPoint',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'ModeCode',
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
        internalType: 'ModeCode',
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
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'bytes32',
            name: 'accountGasLimits',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'gasFees',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'paymasterAndData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct PackedUserOperation',
        name: 'userOp',
        type: 'tuple',
      },
    ],
    name: 'executeUserOp',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'functionSig',
        type: 'bytes4',
      },
    ],
    name: 'getActiveFallbackHandler',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'handler',
            type: 'address',
          },
          {
            internalType: 'CallType',
            name: 'calltype',
            type: 'bytes1',
          },
          {
            internalType: 'address[]',
            name: 'allowedCallers',
            type: 'address[]',
          },
        ],
        internalType: 'struct ModuleManager.FallbackHandler',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveHook',
    outputs: [
      {
        internalType: 'address',
        name: 'hook',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'cursor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'getExecutorsPaginated',
    outputs: [
      {
        internalType: 'address[]',
        name: 'array',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'next',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_proposalId',
        type: 'uint256',
      },
    ],
    name: 'getProposal',
    outputs: [
      {
        internalType: 'address',
        name: 'ownerProposed_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'approvalCount_',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'guardiansApproved_',
        type: 'address[]',
      },
      {
        internalType: 'bool',
        name: 'resolved_',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'proposedAt_',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'cursor',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'size',
        type: 'uint256',
      },
    ],
    name: 'getValidatorPaginated',
    outputs: [
      {
        internalType: 'address[]',
        name: 'array',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: 'next',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guardianCosign',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'guardianCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newOwner',
        type: 'address',
      },
    ],
    name: 'guardianPropose',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'implementation',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'initializeAccount',
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
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'isGuardian',
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
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'isOwner',
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
    inputs: [],
    name: 'ownerCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalTimelock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_guardian',
        type: 'address',
      },
    ],
    name: 'removeGuardian',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'removeOwner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'ModeCode',
        name: 'mode',
        type: 'bytes32',
      },
    ],
    name: 'supportsExecutionMode',
    outputs: [
      {
        internalType: 'bool',
        name: 'isSupported',
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
        name: 'modulTypeId',
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
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'initCode',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'callData',
            type: 'bytes',
          },
          {
            internalType: 'bytes32',
            name: 'accountGasLimits',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'preVerificationGas',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'gasFees',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'paymasterAndData',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct PackedUserOperation',
        name: 'userOp',
        type: 'tuple',
      },
      {
        internalType: 'bytes32',
        name: 'userOpHash',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'missingAccountFunds',
        type: 'uint256',
      },
    ],
    name: 'validateUserOp',
    outputs: [
      {
        internalType: 'uint256',
        name: 'validSignature',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

export default abi;
