import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api/chat': {
        target: 'https://automations.quind.io',
        changeOrigin: true,
        secure: false,
        rewrite: () => '/webhook/0b753b94-1a88-4a80-80a7-6a5ae4930f7c',
      },
    },
  },
})
