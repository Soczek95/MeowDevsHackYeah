import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    basicSsl()
  ],
  server: {
host: true,
  https: true,
  proxy: {
    '/api': {
      target: 'http://10.228.116.4:8000', // Twój backend HTTP
      changeOrigin: true,
      secure: false,
    }
  }
}
})