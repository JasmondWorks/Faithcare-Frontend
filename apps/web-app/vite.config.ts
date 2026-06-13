import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const apiOrigin = (() => {
    try {
      return env.VITE_API_URL ? new URL(env.VITE_API_URL).origin : null
    } catch {
      return null
    }
  })()

  return {
    base: "/",
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: apiOrigin
            ? [
                {
                  urlPattern: new RegExp(`^${apiOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'api-get-cache',
                    expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
                    networkTimeoutSeconds: 5,
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
              ]
            : [],
        },
        devOptions: {
          enabled: true
        },
        manifest: {
          name: 'FaithCare Dashboard',
          short_name: 'FaithCare',
          description: 'Design FaithCare Dashboard UI',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/pwa-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-icon-1024x1024.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-icon-1024x1024.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: "/desktop-home.png",
              sizes: "1895x909",
              type: "image/png",
              form_factor: "wide"
            },
            {
              src: "/mobile-home.png",
              sizes: "449x799",
              type: "image/png"
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@faithcare/ui': path.resolve(__dirname, '../../shared/index.ts'),
      },

      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },


    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
