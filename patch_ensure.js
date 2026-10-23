const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

// 1. Move isSyncing = true before ensureVideoReady
const targetEnsureVideoReadyBlock = `  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) return;

    // Video buffering veya seeking halindeyse hard seek yapıp CDN buffer'ı tekrar çökertme
    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      pendingState = state;`;

const replacementEnsureVideoReadyBlock = `  isSyncing = true;
  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) {
      isSyncing = false;
      return;
    }

    // Video buffering veya seeking halindeyse hard seek yapıp CDN buffer'ı tekrar çökertme
    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      isSyncing = false;
      pendingState = state;`;

content = content.replace(targetEnsureVideoReadyBlock, replacementEnsureVideoReadyBlock);

// Remove the `isSyncing = true` which were inside applyRemoteState since we set it before ensureVideoReady
// and they just clutter the logic
content = content.replace(/isSyncing = true;\s+PlayerAdapter.play\(\);\s+setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g, `PlayerAdapter.play();\n        setTimeout(() => { isSyncing = false; }, 800);`);
content = content.replace(/isSyncing = true;\s+PlayerAdapter.pause\(\);\s+setTimeout\(\(\) => \{ isSyncing = false; \}, 800\);/g, `PlayerAdapter.pause();\n        setTimeout(() => { isSyncing = false; }, 800);`);

// For cases like early return where executeProgrammaticSync handles it or we need a catch-all timeout,
// actually `executeProgrammaticSync` sets `isSyncing = true` internally, but that's fine, it will just override.
// `executeProgrammaticSync` clears it after 2500ms via `finishProgrammaticSync`.
// For the 4th case (drift <= 6.5, just playbackRate adjustment), there is no `executeProgrammaticSync` or `setTimeout`.
// So we need to ensure isSyncing is set to false in the 4th case.

const targetCase4End = `      } else {
        if (videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
      }
    }
  });`;

const replacementCase4End = `      } else {
        if (videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
      }
      setTimeout(() => { isSyncing = false; }, 800);
    }
  });`;

content = content.replace(targetCase4End, replacementCase4End);

fs.writeFileSync('extension/content.js', content, 'utf8');
