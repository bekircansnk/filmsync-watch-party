const fs = require('fs');
const path = 'extension/content.js';
let content = fs.readFileSync(path, 'utf8');

const escapeFn = `
// HTML Escape Helper
function escapeHTML(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---`;

content = content.replace('// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---', escapeFn);

content = content.replace(
  '      "${roomName}" Odasına Katılınıyor...',
  '      "${escapeHTML(roomName)}" Odasına Katılınıyor...'
);

content = content.replace(
  '      <div style="font-size: 0.85rem; color: #66fcf1; margin-bottom: 20px;">"${roomName}" odasına katılacaksınız.</div>',
  '      <div style="font-size: 0.85rem; color: #66fcf1; margin-bottom: 20px;">"${escapeHTML(roomName)}" odasına katılacaksınız.</div>'
);

fs.writeFileSync(path, content, 'utf8');
