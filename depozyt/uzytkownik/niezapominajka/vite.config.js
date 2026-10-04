import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    https: false,
    proxy: {
      '/api': {
        target: 'http://10.228.116.4:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})