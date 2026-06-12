import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Archivos extra que el service worker debe pre-cachear
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],

      manifest: {
        name: 'Mis Gastos',
        short_name: 'Mis Gastos',
        description: 'Registro de gastos e ingresos personales',
        lang: 'es',
        display: 'standalone',
        theme_color: '#101714',
        background_color: '#101714',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            // purpose 'any': ícono normal
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            // purpose 'maskable': Android puede recortarlo en círculo/squircle
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Patrones de archivos a pre-cachear (assets del build)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        runtimeCaching: [
          {
            // Las llamadas a Supabase NUNCA se cachean: siempre van a la red.
            // NetworkOnly = ignora el caché completamente para estas URLs.
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
