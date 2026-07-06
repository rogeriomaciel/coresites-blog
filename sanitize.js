const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'scripts', 'n8n', 'social-workflow.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));

delete data.activeVersion;
delete data.activeVersionId;
delete data.workflowPublishHistory;
delete data.shared;
delete data.versionCounter;
delete data.triggerCount;

fs.writeFileSync(p, JSON.stringify(data, null, 2));
