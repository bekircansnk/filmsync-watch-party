const fs = require('fs');
const content = fs.readFileSync('extension/content.js', 'utf8');

const m = content.match(/function ensureVideoReady[^}]+\}\n/s);
console.log("MATCH", m[0]);
