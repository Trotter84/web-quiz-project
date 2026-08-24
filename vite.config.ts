import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // Intercept any request starting with /api and forward it to Express
      '/api': {
        target: 'http://localhost:3000', // Match your Express server port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
