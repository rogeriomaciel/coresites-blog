import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const hasClientEnv = fs.existsSync(path.resolve(__dirname, '../.env'))
  const envDirectory = hasClientEnv ? '..' : process.cwd()

  const env = loadEnv(mode, envDirectory, '')
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    base: basePath,
    envDir: envDirectory,
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
