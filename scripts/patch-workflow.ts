import fs from 'node:fs'

const file = 'scripts/n8n/social-workflow.json'
const data = JSON.parse(fs.readFileSync(file, 'utf-8'))

// 1. Create HTTP node
const httpNode = {
  "parameters": {
    "url": "={{ $('Webhook').item.json.body.cover_image_url }}",
    "responseFormat": "file",
    "options": {}
  },
  "id": "fetch-image-node",
  "name": "Fetch Image",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [900, 304]
}

// 2. Modify LinkedIn node
const lnNode = data.nodes.find((n: any) => n.name === 'LinkedIn (Mock)')
if (lnNode) {
  // Ajuste para garantir que a imagem seja postada como binario
  lnNode.parameters.shareMediaCategory = "IMAGE"
  lnNode.parameters.imageBinaryProperty = "data"
}

// Insert new node
if (!data.nodes.find((n: any) => n.name === 'Fetch Image')) {
  data.nodes.push(httpNode)
}

// 3. Fix Connections
data.connections["gemini linkedin post"] = {
  "main": [
    [
      {
        "node": "Fetch Image",
        "type": "main",
        "index": 0
      }
    ]
  ]
}

data.connections["Fetch Image"] = {
  "main": [
    [
      {
        "node": "LinkedIn (Mock)",
        "type": "main",
        "index": 0
      }
    ]
  ]
}

// Apagar activeVersion para forçar a UI a ler da nova estrutura principal
delete data.activeVersion

fs.writeFileSync(file, JSON.stringify(data, null, 2))
console.log('Workflow atualizado com sucesso!')
