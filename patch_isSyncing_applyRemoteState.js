const fs = require('fs');

let content = fs.readFileSync('extension/content.js', 'utf8');

// The replacement above had an issue with default fallback. I will restore content.js and do it differently.
// Wait, I can just do git checkout extension/content.js
