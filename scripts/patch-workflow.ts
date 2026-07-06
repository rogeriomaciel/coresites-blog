const fs = require('fs')

const workflowPath = './scripts/n8n/social-workflow.json'
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'))

// Create Switch Node
const switchNode = {
  parameters: {
    dataType: 'string',
    value1: '={{ $json.body.network }}',
    rules: {
      rules: [
        { value2: 'linkedin', output: 0 },
        { value2: 'facebook', output: 1 },
        { value2: 'instagram', output: 2 }
      ]
    }
  },
  id: 'switch-router',
  name: 'Roteador (Switch)',
  type: 'n8n-nodes-base.switch',
  typeVersion: 1,
  position: [400, 304]
}

// Relocate existing Gemini for LinkedIn
const geminiLinkedin = workflow.nodes.find(n => n.name === 'gemini linkedin post')
geminiLinkedin.position = [640, 100]

// Clone Gemini for Facebook
const geminiFacebook = JSON.parse(JSON.stringify(geminiLinkedin))
geminiFacebook.id = 'gemini-facebook'
geminiFacebook.name = 'gemini facebook post'
geminiFacebook.position = [640, 304]
geminiFacebook.parameters.messages.values[0].content = "={{ 'Você é um social media expert. Crie um post engajador para o Facebook promovendo o seguinte artigo.\\n\\nTítulo: ' + $json.body.title + '\\nURL: ' + $json.body.url + '\\nResumo: ' + $json.body.excerpt + '\\n\\nREGRAS:\\n1. Retorne APENAS o texto.\\n2. Tom coloquial e amigável, convidando para ler e comentar.\\n3. Termine com a URL do artigo.' }}"

// Clone Gemini for Instagram
const geminiInstagram = JSON.parse(JSON.stringify(geminiLinkedin))
geminiInstagram.id = 'gemini-instagram'
geminiInstagram.name = 'gemini instagram post'
geminiInstagram.position = [640, 500]
geminiInstagram.parameters.messages.values[0].content = "={{ 'Você é um social media expert. Crie uma legenda para o Instagram promovendo o artigo.\\n\\nTítulo: ' + $json.body.title + '\\nURL: ' + $json.body.url + '\\nResumo: ' + $json.body.excerpt + '\\n\\nREGRAS:\\n1. Retorne APENAS o texto.\\n2. Muito engajador, com emojis e CTA visual (Acesse o link na bio / Leia mais). Mande a URL também.\\n3. Hashtags virais no final.' }}"

// Find existing fetch and linkedin node
const fetchLinkedin = workflow.nodes.find(n => n.name === 'Fetch Image')
fetchLinkedin.position = [850, 100]
fetchLinkedin.name = 'Fetch Image (LinkedIn)'
// Use the output of the Webhook for URL, since Gemini doesn't pass it through natively unless we use $item
fetchLinkedin.parameters.url = "={{ $('Webhook').item.json.body.cover_image_url }}"

const linkedinNode = workflow.nodes.find(n => n.name === 'LinkedIn (Mock)')
linkedinNode.position = [1100, 100]

// Fetch image for FB
const fetchFb = JSON.parse(JSON.stringify(fetchLinkedin))
fetchFb.id = 'fetch-fb'
fetchFb.name = 'Fetch Image (Facebook)'
fetchFb.position = [850, 304]

// Fetch image for IG
const fetchIg = JSON.parse(JSON.stringify(fetchLinkedin))
fetchIg.id = 'fetch-ig'
fetchIg.name = 'Fetch Image (Instagram)'
fetchIg.position = [850, 500]

// Dummy nodes for FB and IG
const fbNode = {
  parameters: {
    notice: 'Conecte sua conta do Facebook Pages aqui e configure o campo de imagem e texto!'
  },
  id: 'fb-node',
  name: 'Facebook Pages',
  type: 'n8n-nodes-base.noOp',
  typeVersion: 1,
  position: [1100, 304]
}

const igNode = {
  parameters: {
    notice: 'Conecte sua conta do Instagram for Business aqui!'
  },
  id: 'ig-node',
  name: 'Instagram',
  type: 'n8n-nodes-base.noOp',
  typeVersion: 1,
  position: [1100, 500]
}

workflow.nodes.push(switchNode, geminiFacebook, geminiInstagram, fetchFb, fetchIg, fbNode, igNode)

// Rebuild connections
workflow.connections = {
  "Webhook": {
    "main": [ [ { "node": "Roteador (Switch)", "type": "main", "index": 0 } ] ]
  },
  "Roteador (Switch)": {
    "main": [
      [ { "node": "gemini linkedin post", "type": "main", "index": 0 } ],
      [ { "node": "gemini facebook post", "type": "main", "index": 0 } ],
      [ { "node": "gemini instagram post", "type": "main", "index": 0 } ]
    ]
  },
  "gemini linkedin post": {
    "main": [ [ { "node": "Fetch Image (LinkedIn)", "type": "main", "index": 0 } ] ]
  },
  "gemini facebook post": {
    "main": [ [ { "node": "Fetch Image (Facebook)", "type": "main", "index": 0 } ] ]
  },
  "gemini instagram post": {
    "main": [ [ { "node": "Fetch Image (Instagram)", "type": "main", "index": 0 } ] ]
  },
  "Fetch Image (LinkedIn)": {
    "main": [ [ { "node": "LinkedIn (Mock)", "type": "main", "index": 0 } ] ]
  },
  "Fetch Image (Facebook)": {
    "main": [ [ { "node": "Facebook Pages", "type": "main", "index": 0 } ] ]
  },
  "Fetch Image (Instagram)": {
    "main": [ [ { "node": "Instagram", "type": "main", "index": 0 } ] ]
  }
}

fs.writeFileSync('./scripts/n8n/social-workflow-v2.json', JSON.stringify(workflow, null, 2))
console.log('Workflow v2 gerado com sucesso!')
