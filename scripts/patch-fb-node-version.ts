const fs = require('fs')

const workflowPath = './scripts/n8n/social-workflow.json'
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'))

const fbNode = workflow.nodes.find(n => n.name === 'Facebook Graph API')

if (fbNode) {
  fbNode.parameters.graphApiVersion = "v25.0"
}

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2))
console.log('graphApiVersion fixed!')
