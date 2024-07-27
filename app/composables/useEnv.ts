interface EnvironmentVariables {
  alchemyApiKey: string;
  apiEndpoint: string;
  appBaseUrl: string;
  appPassphrase: string;
  indexerEndpoint: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
    apiEndpoint: env.VITE_API_ENDPOINT || '',
    appBaseUrl: env.VITE_APP_BASE_URL || '',
    appPassphrase: env.VITE_APP_PASSPHRASE || '',
    indexerEndpoint: env.VITE_INDEXER_ENDPOINT || '',
  };
}

export default useEnv;
