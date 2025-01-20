import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    // Copy firebase-messaging-sw.js to build output
    rollupOptions: {
      input: {
        app: './index.html',
        'firebase-messaging-sw': './public/firebase-messaging-sw.js'
      }
    }
  }
});