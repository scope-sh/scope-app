import { createPublicClient, http, type PublicClient } from 'viem';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import useEnv from '@/composables/useEnv.js';
import {
  CHAINS,
  DEFAULT_CHAIN,
  getChainData,
  getChainName,
  getEndpointUrl,
} from '@/utils/chains.js';
import type { Chain } from '@/utils/chains.js';

interface UseChain {
  id: Ref<Chain>;
  name: Ref<string>;
  client: Ref<PublicClient>;
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

  const id = ref<Chain>(parseChain(route.params.chain) || DEFAULT_CHAIN);
  const name = computed(() => getChainName(id.value));

  watch(
    () => route.params.chain,
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
      ),
    }),
  );

  return { id, name, client };
}

export default useChain;
