const fs = require('fs')

const workflowPath = './scripts/n8n/social-workflow.json'
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'))

function fixFbNode(fbNode) {
  if (fbNode) {
    // Transforma o nó em um HTTP Request conforme feedback
    fbNode.type = 'n8n-nodes-base.httpRequest'
    fbNode.typeVersion = 4
    
    fbNode.parameters = {
      method: 'POST',
      url: 'https://graph.facebook.com/v25.0/61591675503932/photos',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'facebookGraphApi',
      sendBody: true,
      contentType: 'multipart-form-data',
      bodyParameters: {
        parameters: [
          {
            name: 'caption',
            value: "={{ $('gemini facebook post').item.json.text || $('gemini facebook post').item.json.content?.parts?.[0]?.text || $('gemini facebook post').item.json.content || $('gemini facebook post').item.json.response || 'Veja nosso novo artigo!' }}"
          }
        ]
      },
      sendBinaryData: true,
      binaryPropertyName: 'data',
      options: {}
    }

    // Configurar credencial para HTTP Node
    fbNode.credentials = {
      facebookGraphApi: {
        id: '1oXnn2Wk5wbvKjeW',
        name: 'Facebook Graph account'
      }
    }
  }
}

// Consertar no array principal
fixFbNode(workflow.nodes.find(n => n.name === 'Facebook Graph API'))

// Consertar no array activeVersion (se existir)
if (workflow.activeVersion && workflow.activeVersion.nodes) {
  fixFbNode(workflow.activeVersion.nodes.find(n => n.name === 'Facebook Graph API'))
}

// Aproveitar e arrumar o LinkedIn node que o usuário deixou, para usar o texto do gemini correto (usando $())
function fixLinkedinNode(linkedinNode) {
  if (linkedinNode) {
    linkedinNode.parameters.text = "={{ $('gemini linkedin post').item.json.text || $('gemini linkedin post').item.json.content?.parts?.[0]?.text || $('gemini linkedin post').item.json.content || $('gemini linkedin post').item.json.response }}"
  }
}

fixLinkedinNode(workflow.nodes.find(n => n.name === 'LinkedIn (Mock)'))
if (workflow.activeVersion && workflow.activeVersion.nodes) {
  fixLinkedinNode(workflow.activeVersion.nodes.find(n => n.name === 'LinkedIn (Mock)'))
}

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2))
console.log('Workflow corrigido com o nó do Facebook configurado como HTTP Request!')
