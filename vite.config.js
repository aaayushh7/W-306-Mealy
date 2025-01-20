import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'w-306-mealy',
        short_name: 'mealy',
        description: 'Tracking food in abode',
        theme_color: '#121212',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        exclude: [/firebase-messaging-sw\.js$/],
      }
    })
  ],
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: './index.html',
        'firebase-messaging-sw': './public/firebase-messaging-sw.js'
      }
    }
  }
});