declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

interface ImportMeta {
  env: {
    VITE_ALCHEMY_API_KEY?: string;
    VITE_API_ENDPOINT?: string;
    VITE_APP_PASSPHRASE?: string;
    VITE_INDEXER_ENDPOINT?: string;
  };
}
