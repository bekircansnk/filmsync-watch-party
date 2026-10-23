const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

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

const targetEndCallback = `    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
    if (!state.isPlaying && videoElement.paused) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
        });
      }
    }
  });
}`;

const replacementEndCallback = `    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
    if (!state.isPlaying && videoElement.paused) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
        });
      }
    }

    // Güvenlik için, eğer executeProgrammaticSync veya diğer özel durumlar çalışmadıysa isSyncing'i temizle
    setTimeout(() => { isSyncing = false; }, 800);
  });
}`;

content = content.replace(targetEndCallback, replacementEndCallback);

fs.writeFileSync('extension/content.js', content, 'utf8');
