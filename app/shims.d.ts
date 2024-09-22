declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}

declare module '@fontsource-variable/inter' {}

interface ImportMeta {
  env: {
    VITE_QUICKNODE_APP_NAME?: string;
    VITE_QUICKNODE_APP_KEY?: string;
    VITE_APP_BASE_URL?: string;
    VITE_API_ENDPOINT?: string;
    VITE_INDEXER_ENDPOINT?: string;
  };
}
