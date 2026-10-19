const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

content = content.replace(
  /isSyncing = true;\s*PlayerAdapter.play\(\);\s*setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g,
  `isSyncing = true;
        PlayerAdapter.play();
        if (syncSafetyTimer) clearTimeout(syncSafetyTimer);
        syncSafetyTimer = setTimeout(() => { finishProgrammaticSync(); }, 800);`
);

content = content.replace(
  /isSyncing = true;\s*PlayerAdapter.pause\(\);\s*setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g,
  `isSyncing = true;
        PlayerAdapter.pause();
        if (syncSafetyTimer) clearTimeout(syncSafetyTimer);
        syncSafetyTimer = setTimeout(() => { finishProgrammaticSync(); }, 800);`
);

content = content.replace(
  /if \(isProgrammaticSeeking\) \{\s*setTimeout\(\(\) => \{\s*finishProgrammaticSync\(\);\s*\}, 600\);\s*\}/g,
  `if (isProgrammaticSeeking) {
      if (syncSafetyTimer) clearTimeout(syncSafetyTimer);
      syncSafetyTimer = setTimeout(() => {
        finishProgrammaticSync();
      }, 600);
    }`
);

fs.writeFileSync('extension/content.js', content, 'utf8');
