const fs = require('fs');
const path = 'extension/popup.js';
let content = fs.readFileSync(path, 'utf8');

const escapeFn = `// HTML Escape Helper
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

// Evo ve Beko Film Partisi Popup JS 🍿`;

content = content.replace('// Evo ve Beko Film Partisi Popup JS 🍿', escapeFn);

content = content.replace(
  "const userNames = validUserEntries.map(([_, u]) => u.username || 'Üye').join(', ');",
  "const userNames = validUserEntries.map(([_, u]) => escapeHTML(u.username || 'Üye')).join(', ');"
);

fs.writeFileSync(path, content, 'utf8');
