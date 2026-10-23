const fs = require('fs');
let c = fs.readFileSync('extension/content.js', 'utf8');
const startIdx = c.indexOf('    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA');
const endIdx = c.indexOf('// Senkronizasyon Döngüsü (Auto-Sync)', startIdx);
console.log(c.substring(startIdx, endIdx));
