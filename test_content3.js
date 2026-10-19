const fs = require('fs');
const content = fs.readFileSync('extension/content.js', 'utf8');

const regex = /isSyncing = true;\s*PlayerAdapter.(play|pause)\(\);\s*setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log("Found:", match[0]);
}
