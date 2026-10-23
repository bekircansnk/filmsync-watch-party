const fs = require('fs');

let content = fs.readFileSync('applyRemoteState.js', 'utf8');

const regexPlay = /isSyncing = true;\s+PlayerAdapter.play\(\);\s+setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g;
console.log(regexPlay.test(content));
