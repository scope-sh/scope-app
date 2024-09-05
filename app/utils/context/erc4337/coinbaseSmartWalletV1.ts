import { decodeAbiParameters, type Hex } from 'viem';

interface DecodedSignature {
  ownerIndex: bigint;
  signatureData: Hex;
}

function decodeSignature(signature: Hex): DecodedSignature | null {
  const decoded = decodeAbiParameters(
    [
      {
        type: 'tuple',
        components: [
          {
            name: 'ownerIndex',
            type: 'uint256',
          },
          {
            name: 'signatureData',
            type: 'bytes',
          },
        ],
      },
    ],
    signature,
  );
  return decoded[0];
}

// eslint-disable-next-line import/prefer-default-export
export { decodeSignature };
