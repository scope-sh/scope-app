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

  vite: {
    css: {
      transformer: 'lightningcss',
    },
  },

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
          content: 'block explorer for aa builders',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://alpha.scope.sh/' },
        { property: 'og:title', content: 'scope' },
        {
          property: 'og:description',
          content: 'block explorer for aa builders',
        },
        { property: 'og:image', content: 'https://alpha.scope.sh/social.png' },
        { property: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:url', content: 'https://alpha.scope.sh/' },
        { property: 'twitter:title', content: 'scope' },
        {
          property: 'twitter:description',
          content: 'block explorer for aa builders',
        },
        {
          property: 'twitter:image',
          content: 'https://alpha.scope.sh/social.png',
        },
      ],
    },
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
