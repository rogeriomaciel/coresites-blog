const fs = require('fs')

const workflowPath = './scripts/n8n/social-workflow.json'
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'))

const fbNode = workflow.nodes.find(n => n.name === 'Facebook Graph API')

if (fbNode) {
  fbNode.parameters = {
    httpRequestMethod: 'POST',
    // Remove graphApiVersion to let n8n use its supported default, or keep it if you want
    node: fbNode.parameters.node || '61591675503932',
    edge: 'photos', // Mudança CRUCIAL: para postar foto, o endpoint (edge) deve ser "photos", não "feed"
    sendBinaryData: true,
    binaryPropertyName: 'data', // Nome padrão que o Fetch Image usa
    options: {
      bodyParametersJson: "={{ JSON.stringify({ message: $('gemini facebook post').item.json.text || $('gemini facebook post').item.json.content?.parts?.[0]?.text || $('gemini facebook post').item.json.content || $('gemini facebook post').item.json.response || 'Veja nosso novo artigo!' }) }}"
    }
  }
}

// Aproveitar e arrumar o LinkedIn node que o usuário deixou, para usar o texto do gemini correto (usando $())
// Porque depois do Fetch Image, o $json não tem mais o texto!
const linkedinNode = workflow.nodes.find(n => n.name === 'LinkedIn (Mock)')
if (linkedinNode) {
  linkedinNode.parameters.text = "={{ $('gemini linkedin post').item.json.text || $('gemini linkedin post').item.json.content?.parts?.[0]?.text || $('gemini linkedin post').item.json.content || $('gemini linkedin post').item.json.response }}"
}

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2))
console.log('Workflow corrigido com o nó do Facebook configurado perfeitamente!')
