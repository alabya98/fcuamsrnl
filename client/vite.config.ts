import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        // Bypass Vite's static file middleware so it never tries to
        // serve /storage files from the local filesystem — instead
        // always forwards them to Laravel at 127.0.0.1:8000
        bypass(req) {
          req.url = req.url ?? '';
          return null;
        },
      },
    },
    fs: {
      // Restrict Vite from serving any file outside the client src folder
      // This prevents Vite's static middleware from intercepting /storage
      // requests before the proxy gets a chance to forward them
      strict: true,
    },
  },
})