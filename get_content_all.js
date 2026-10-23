const fs = require('fs');
let c = fs.readFileSync('extension/content.js', 'utf8');
const startIdx = c.indexOf('function applyRemoteState(state) {');
const endIdx = c.indexOf('function setupVideoListeners() {');
fs.writeFileSync('applyRemoteState.js', c.substring(startIdx, endIdx));
