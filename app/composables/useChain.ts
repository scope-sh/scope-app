import { createPublicClient, http, type PublicClient } from 'viem';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import useEnv from '@/composables/useEnv.js';
import useRoute from '@/composables/useRoute';
import {
  CHAINS,
  DEFAULT_CHAIN,
  getChainData,
  getChainName,
  getEndpointUrl,
} from '@/utils/chains.js';
import type { Chain } from '@/utils/chains.js';

interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

interface UseChain {
  id: Ref<Chain>;
  name: Ref<string>;
  client: Ref<PublicClient>;
  nativeCurrency: Ref<NativeCurrency>;
  isAvailable: Ref<boolean>;
}

function parseChain(value?: string | string[]): Chain | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return parseChain(value[0]);
  }
  const chain = parseInt(value) as Chain;
  if (isNaN(chain)) {
    return null;
  }
  if (!CHAINS.includes(chain)) {
    return null;
  }
  return chain;
}

function useChain(): UseChain {
  const route = useRoute();
  const { quicknodeAppName, quicknodeAppKey } = useEnv();
  const chain = computed(() => route.params.chain as string);

  const isAvailable = computed(() => {
    const id = parseChain(chain.value);
    return id !== null && CHAINS.includes(id);
  });
  const id = ref<Chain>(parseChain(chain.value) || DEFAULT_CHAIN);
  const name = computed(() => getChainName(id.value));

  watch(
    () => chain.value,
    (newChain) => {
      if (!newChain) {
        id.value = DEFAULT_CHAIN;
      } else {
        const newId = parseChain(newChain);
        if (newId) {
          id.value = newId;
        } else {
          id.value = DEFAULT_CHAIN;
        }
      }
    },
  );

  const client = computed(() =>
    createPublicClient({
      chain: getChainData(id.value),
      transport: http(
        getEndpointUrl(id.value, quicknodeAppName, quicknodeAppKey),
        {
          batch: true,
        },
      ),
    }),
  );

  const nativeCurrency = computed(() => {
    const chain = getChainData(id.value);
    return chain.nativeCurrency;
  });

  return { id, name, client, nativeCurrency, isAvailable };
}

export default useChain;
export type { NativeCurrency };
