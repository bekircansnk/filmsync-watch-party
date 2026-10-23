const fs = require('fs');

let content = fs.readFileSync('extension/content.js', 'utf8');

// I need to add a catch-all timeout to release isSyncing if we just adjust playback rate or something else
// We can just add it before the end of the ensureVideoReady callback.

const targetEndCallback = `    if (!state.isPlaying && videoElement.paused) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
        });
      }
    }
  });
}`;

const replacementEndCallback = `    if (!state.isPlaying && videoElement.paused) {
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
