import { createPublicClient, http } from 'viem';
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
import { ensActions } from '@/utils/viem.js';

interface UseChain {
  id: Ref<Chain>;
  name: Ref<string>;
  client: Ref<ReturnType<typeof createClient>>;
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
  const { alchemyApiKey } = useEnv();

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

  const client = computed(() => createClient(id.value, alchemyApiKey));

  return { id, name, client };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createClient(chainId: Chain, alchemyApiKey: string) {
  return createPublicClient({
    chain: getChainData(chainId),
    transport: http(getEndpointUrl(chainId, alchemyApiKey)),
  }).extend(ensActions());
}

export default useChain;
