import fs from 'node:fs'
import path from 'node:path'

const API_URL = process.env.N8N_API_URL
const API_KEY = process.env.N8N_API_KEY
const WORKFLOW_PATH = path.join(process.cwd(), 'scripts', 'n8n', 'social-workflow.json')

if (!API_URL || !API_KEY) {
  console.error('❌ Erro: N8N_API_URL ou N8N_API_KEY não encontrados no .env')
  process.exit(1)
}

const action = process.argv[2] // 'push' or 'pull'
const workflowIdArg = process.argv[3] // optional id for pull

async function pushWorkflow() {
  if (!fs.existsSync(WORKFLOW_PATH)) {
    console.error(`❌ Erro: Arquivo não encontrado em ${WORKFLOW_PATH}`)
    process.exit(1)
  }

  const workflowData = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf-8'))
  const workflowId = workflowData.id // Se já tivermos o ID no JSON

  const url = workflowId ? `${API_URL}/workflows/${workflowId}` : `${API_URL}/workflows`
  const method = workflowId ? 'PUT' : 'POST'

  console.log(`🚀 Fazendo push (deploy) do workflow "${workflowData.name}" para o n8n...`)

  // Remover campos read-only antes de enviar
  const payload = {
    name: workflowData.name,
    nodes: workflowData.nodes,
    connections: workflowData.connections,
    settings: {
      executionOrder: workflowData.settings?.executionOrder || "v1"
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Status ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log(`✅ Sucesso! Workflow importado/atualizado com o ID: ${result.id}`)
    
    // Atualiza o JSON local com o ID retornado caso seja um novo fluxo
    if (!workflowId) {
      workflowData.id = result.id
      fs.writeFileSync(WORKFLOW_PATH, JSON.stringify(workflowData, null, 2))
      console.log('💾 ID do workflow salvo no arquivo local social-workflow.json')
    }

  } catch (error) {
    console.error('❌ Erro durante o push:', error instanceof Error ? error.message : error)
  }
}

async function pullWorkflow() {
  // Pega o ID do argumento ou do JSON local
  let idToPull = workflowIdArg
  
  if (!idToPull && fs.existsSync(WORKFLOW_PATH)) {
    const localData = JSON.parse(fs.readFileSync(WORKFLOW_PATH, 'utf-8'))
    idToPull = localData.id
  }

  if (!idToPull) {
    console.error('❌ Erro: Não foi possível identificar o ID do Workflow para baixar.')
    console.error('💡 Dica: Passe o ID como argumento: bun run scripts/sync-n8n.ts pull SeuIdAqui')
    process.exit(1)
  }

  console.log(`📥 Baixando workflow ID "${idToPull}" do n8n...`)

  try {
    const response = await fetch(`${API_URL}/workflows/${idToPull}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': API_KEY,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Status ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    
    // Removemos chaves somente leitura para manter o JSON limpo para IaC
    delete result.createdAt
    delete result.updatedAt
    if (result.meta) delete result.meta
    if (result.versionId) delete result.versionId

    fs.writeFileSync(WORKFLOW_PATH, JSON.stringify(result, null, 2))
    console.log(`✅ Sucesso! Workflow "${result.name}" baixado e salvo em social-workflow.json`)

  } catch (error) {
    console.error('❌ Erro durante o pull:', error instanceof Error ? error.message : error)
  }
}

if (action === 'push') {
  pushWorkflow()
} else if (action === 'pull') {
  pullWorkflow()
} else {
  console.log('Uso: bun run scripts/sync-n8n.ts <push|pull> [workflowId]')
  console.log('  push: Envia o json local para o n8n (cria ou atualiza)')
  console.log('  pull: Baixa o workflow do n8n e sobrescreve o json local')
}
