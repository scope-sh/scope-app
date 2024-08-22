declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_ALCHEMY_API_KEY?: string;
    VITE_QUICKNODE_APP_NAME?: string;
    VITE_QUICKNODE_APP_KEY?: string;
    VITE_APP_BASE_URL?: string;
    VITE_API_ENDPOINT?: string;
    VITE_INDEXER_ENDPOINT?: string;
    VITE_FEATURE_TRANSACTION_INTERNAL_CALLS?: string;
  };
}
