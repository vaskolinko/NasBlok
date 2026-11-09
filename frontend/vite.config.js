import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // zahtevki na /api gredo na backend, zato CORS v razvoju ni potreben
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
