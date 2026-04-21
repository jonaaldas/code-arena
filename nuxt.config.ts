import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  components: [
    {
      path: '~/components',
      extensions: ['vue'],
    },
  ],
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
    experimental: {
      websocket: true
    }
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
