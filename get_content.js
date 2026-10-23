const fs = require('fs');
let c = fs.readFileSync('extension/content.js', 'utf8');
const startIdx = c.indexOf('function applyRemoteState(state) {');
const endIdx = c.indexOf('// 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA', startIdx);
console.log(c.substring(startIdx, endIdx));
