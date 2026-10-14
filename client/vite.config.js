import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')
  const port = process.env.PORT || env.PORT || '3001'

  return {
    plugins: [react(), tailwindcss()],
    publicDir: '../public',
    server: {
      host: true,
      port: Number(process.env.CLIENT_PORT || 5173),
      strictPort: true,
      proxy: {
        '/api': `http://127.0.0.1:${port}`,
      },
    },
  }
})
