import type { Chain } from '@/utils/chains';

interface EnvironmentVariables {
  quicknodeAppName: string;
  quicknodeAppKey: string;
  apiEndpoint: string;
  appBaseUrl: string;
  indexerEndpoint: string;
  hideChains: Chain[];
  showChains: Chain[];
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    quicknodeAppName: env.VITE_QUICKNODE_APP_NAME || '',
    quicknodeAppKey: env.VITE_QUICKNODE_APP_KEY || '',
    apiEndpoint: env.VITE_API_ENDPOINT || '',
    appBaseUrl: env.VITE_APP_BASE_URL || '',
    indexerEndpoint: env.VITE_INDEXER_ENDPOINT || '',
    hideChains: env.VITE_HIDE_CHAINS?.split(',').map(Number) || [],
    showChains: env.VITE_SHOW_CHAINS?.split(',').map(Number) || [],
  };
}

export default useEnv;
