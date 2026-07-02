import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const hasClientEnv = fs.existsSync(path.resolve(__dirname, '../.env'))
  const isHeadless = hasClientEnv // Se tem .env do cliente, assumimos arquitetura headless
  const envDirectory = isHeadless ? '..' : process.cwd()

  // Se for headless e o cliente tiver a pasta public, servimos a pasta public dele
  const clientPublic = path.resolve(__dirname, '../public')
  const hasClientPublic = isHeadless && fs.existsSync(clientPublic)
  const publicDirectory = hasClientPublic ? clientPublic : 'public'

  const env = loadEnv(mode, envDirectory, '')
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    base: basePath,
    envDir: envDirectory,
    publicDir: publicDirectory,
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
