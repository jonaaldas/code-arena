import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/tailwind.css'],
  sourcemap: { server: false, client: false },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    build: {
      sourcemap: false,
      target: 'esnext',
    },
  },
  nitro: {
    minify: true,
    // libsql uses conditional requires that @vercel/nft can't trace — force-include them
    externals: {
      inline: [
        '@libsql/client',
        '@libsql/hrana-client',
        '@libsql/isomorphic-ws',
        '@libsql/isomorphic-fetch',
      ],
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})
