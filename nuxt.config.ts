export default defineNuxtConfig({
  devtools: { enabled: true },

  imports: {
    autoImport: false,
  },

  future: {
    compatibilityVersion: 4,
  },

  devServer: {
    port: 5173,
  },

  ssr: false,

  nitro: {
    preset: 'vercel',
    vercel: {
      regions: ['fra1'],
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', type: 'image/png', href: '/favicon.png' },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon.png',
          sizes: '180x180',
        },
      ],
      title: 'scope',
      meta: [
        { name: 'title', content: 'scope' },
        {
          name: 'description',
          content: 'evm wallet explorer',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://scope.sh/' },
        { property: 'og:title', content: 'scope' },
        {
          property: 'og:description',
          content: 'evm wallet explorer',
        },
        { property: 'og:image', content: 'https://scope.sh/social.png' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://scope.sh/' },
        { property: 'twitter:title', content: 'scope' },
        {
          property: 'twitter:description',
          content: 'evm wallet explorer',
        },
        {
          property: 'twitter:image',
          content: 'https://scope.sh/social.png',
        },
      ],
      script: [
        { async: true, src: 'https://cdn.metrical.xyz/script.js', type: 'text/javascript' },
        { innerHTML: 'window.metrical = { "app": "QjX4GqlXkK"}', type: 'text/javascript', body: true },
      ],
    },
  },

  posthog: {
    // Disable tracking on dev environment
    disabled: process.env.NODE_ENV === 'development',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/eslint',
    'nuxt-shiki',
    'nuxt-posthog',
  ],
  compatibilityDate: '2024-07-16',
});
