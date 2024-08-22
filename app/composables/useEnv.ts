interface EnvironmentVariables {
  alchemyApiKey: string;
  quicknodeAppName: string;
  quicknodeAppKey: string;
  apiEndpoint: string;
  appBaseUrl: string;
  indexerEndpoint: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
    quicknodeAppName: env.VITE_QUICKNODE_APP_NAME || '',
    quicknodeAppKey: env.VITE_QUICKNODE_APP_KEY || '',
    apiEndpoint: env.VITE_API_ENDPOINT || '',
    appBaseUrl: env.VITE_APP_BASE_URL || '',
    indexerEndpoint: env.VITE_INDEXER_ENDPOINT || '',
  };
}

export default useEnv;
