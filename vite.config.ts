import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    base: basePath,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.md'],
    server: {
      fs: {
        // Permite que o Vite (no submódulo) leia a pasta content do projeto cliente (nível acima)
        allow: ['..'],
      },
    },
  }
})
