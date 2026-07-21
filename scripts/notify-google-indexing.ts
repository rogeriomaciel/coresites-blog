import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function loadEnv() {
  const envPath = path.join(process.cwd(), '..', '.env')
  const envCorePath = path.join(process.cwd(), '.env')
  
  const envFile = fs.existsSync(envPath) ? envPath : (fs.existsSync(envCorePath) ? envCorePath : null)
  const env: Record<string, string> = {}

  if (envFile) {
    const content = fs.readFileSync(envFile, 'utf-8')
    content.split('\n').forEach(line => {
      const [key, ...val] = line.split('=')
      if (key && val.length > 0) {
        let cleanVal = val.join('=').trim()
        cleanVal = cleanVal.replace(/^["']|["']$/g, '')
        env[key.trim()] = cleanVal
      }
    })
  }
  return env
}

function base64url(str: string | Buffer): string {
  const base64 = (typeof str === 'string' ? Buffer.from(str) : str).toString('base64')
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function getAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedClaimSet = base64url(JSON.stringify(claimSet))
  const unsignedToken = `${encodedHeader}.${encodedClaimSet}`

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsignedToken)
  const signature = signer.sign(serviceAccount.private_key)
  const encodedSignature = base64url(signature)

  const jwt = `${unsignedToken}.${encodedSignature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Falha ao obter Access Token da Google API: ${res.status} ${errText}`)
  }

  const data = await res.json() as { access_token: string }
  return data.access_token
}

async function run() {
  const env = loadEnv()
  const credsFile = env.GOOGLE_APPLICATION_CREDENTIALS
  const siteUrl = env.VITE_SITE_URL || 'https://blog.coreautocrm.com.br'

  if (!credsFile || !fs.existsSync(credsFile)) {
    console.error(`❌ Erro: Arquivo de credenciais GOOGLE_APPLICATION_CREDENTIALS não encontrado: ${credsFile}`)
    process.exit(1)
  }

  console.log(`🔑 Carregando credenciais da Service Account...`)
  const serviceAccount = JSON.parse(fs.readFileSync(credsFile, 'utf-8'))
  console.log(`👤 Service Account Email: ${serviceAccount.client_email}`)

  // 1. Ler URLs do sitemap.xml
  const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap.xml')
  const coreSitemapPath = path.join(process.cwd(), 'core', 'dist', 'sitemap.xml')
  const actualSitemap = fs.existsSync(sitemapPath) ? sitemapPath : (fs.existsSync(coreSitemapPath) ? coreSitemapPath : null)

  if (!actualSitemap) {
    console.error('❌ dist/sitemap.xml não encontrado. Execute "bun run build" primeiro.')
    process.exit(1)
  }

  const xmlContent = fs.readFileSync(actualSitemap, 'utf-8')
  const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g) || []
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, '').trim())

  console.log(`\n📋 Encontradas ${urls.length} URLs no sitemap para notificação.`)

  // 2. Autenticar no Google
  let accessToken = ''
  try {
    accessToken = await getAccessToken(serviceAccount)
    console.log(`✅ Token de Acesso do Google gerado com sucesso!`)
  } catch (err) {
    console.error(`❌ Erro de Autenticação Google Indexing API:`, err instanceof Error ? err.message : err)
    console.log(`\n⚠️  LEMBRE-SE: Adicione o e-mail '${serviceAccount.client_email}' como PROPRIETÁRIO (Owner) no Google Search Console!`)
    process.exit(1)
  }

  // 3. Notificar Google Indexing API
  console.log(`\n🚀 Notificando Google Indexing API (URL_UPDATED)...`)
  let successGoogle = 0
  let failGoogle = 0

  for (const url of urls) {
    try {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      })

      if (response.ok) {
        console.log(`  ✅ Google notificado: ${url}`)
        successGoogle++
      } else {
        const errorText = await response.text()
        console.warn(`  ⚠️  Google recusou (${response.status}): ${url} - ${errorText.substring(0, 100)}`)
        failGoogle++
      }
    } catch (e) {
      console.error(`  ❌ Erro ao enviar ${url}:`, e instanceof Error ? e.message : e)
      failGoogle++
    }
  }

  // 4. Notificar IndexNow (Bing / Buscadores)
  console.log(`\n🚀 Notificando protocolo IndexNow (Bing / Yahoo)...`)
  const host = new URL(siteUrl).hostname
  const indexNowKey = 'coreautocrm2026indexnowkey'
  
  // Garantir que a chave exista na pasta public/ e dist/
  const keyFileName = `${indexNowKey}.txt`
  const publicKeyPath = path.join(process.cwd(), 'public', keyFileName)
  const distKeyPath = path.join(process.cwd(), 'dist', keyFileName)
  
  if (!fs.existsSync(publicKeyPath)) {
    fs.writeFileSync(publicKeyPath, indexNowKey, 'utf-8')
  }
  if (fs.existsSync(path.dirname(distKeyPath)) && !fs.existsSync(distKeyPath)) {
    fs.writeFileSync(distKeyPath, indexNowKey, 'utf-8')
  }

  try {
    const indexNowRes = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: host,
        key: indexNowKey,
        keyLocation: `${siteUrl}/${keyFileName}`,
        urlList: urls
      })
    })

    if (indexNowRes.ok || indexNowRes.status === 202) {
      console.log(`  ✅ IndexNow (Bing) recebeu ${urls.length} URLs em lote! (HTTP ${indexNowRes.status})`)
    } else {
      console.warn(`  ⚠️ IndexNow retornou status ${indexNowRes.status}`)
    }
  } catch (e) {
    console.error(`  ❌ Erro ao chamar IndexNow:`, e instanceof Error ? e.message : e)
  }

  console.log(`\n========================================`)
  console.log(`🎉 Relatório de Reindexação Finalizado!`)
  console.log(`   - Google API: ${successGoogle} enviadas com sucesso, ${failGoogle} falhas.`)
  console.log(`   - IndexNow (Bing): ${urls.length} URLs submetidas em lote.`)
  console.log(`========================================\n`)
}

run()
