import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'http://localhost:8000', // Django backend running with Daphne
        changeOrigin: true,
        ws: true // Enable WebSocket proxying
      }
    }
  }
});
