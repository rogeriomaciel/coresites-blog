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
    plugins: [
      react(),
      {
        name: 'html-inject-gtm',
        transformIndexHtml(html) {
          if (env.VITE_GTM_ID) {
            const gtmHead = `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${env.VITE_GTM_ID}');</script>
    <!-- End Google Tag Manager -->`
            const gtmBody = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${env.VITE_GTM_ID}"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`
            
            return html
              .replace('</head>', `${gtmHead}\n  </head>`)
              .replace('<body>', `<body>\n${gtmBody}`)
          }
          return html
        }
      }
    ],
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
