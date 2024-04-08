interface EnvironmentVariables {
  alchemyApiKey: string;
  apiEndpoint: string;
}

function useEnv(): EnvironmentVariables {
  const env = (import.meta as ImportMeta).env;
  return {
    alchemyApiKey: env.VITE_ALCHEMY_API_KEY || '',
    apiEndpoint: env.VITE_API_ENDPOINT || '',
  };
}

export default useEnv;
