const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

// Rather than using `setTimeout` at the end which gets bypassed,
// we should just set `isSyncing = false` right before returning on these paths,
// OR since `isSyncing` is only used to prevent `sendMediaEvent` feedback loops,
// we could do `finally` block by wrapping the inner logic.

// A simpler way:
// Since ensureVideoReady takes a callback, we can wrap the whole callback in a try-finally if it was synchronous, but it's not (setTimeout for playbackRate). Wait, the playbackRate adjustments don't use setTimeout.

const targetBlock = `    // 4. NORMAL OYNATMA SIRASINDA DURUM (Her iki taraf da oynatıyor)
    if (state.isPlaying && !videoElement.paused) {
      if (drift > 6.5) {
        Logger.log(\`[FilmSync] Büyük sapma (\${drift.toFixed(1)}s), hard seek ile yetişiliyor.\`);
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
        });
        return;
      }

      // Dinamik sapma toleransı: Yüksek gecikmeli durumlarda toleransı artır (max 4.0s),
      // normal durumlarda daha sıkı tut (min 1.5s).
      const networkLatency = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt / 1000 : 0.5;
      const dynamicThreshold = Math.max(1.5, Math.min(4.0, 2.0 + networkLatency));

      if (drift <= dynamicThreshold) {
        if (!PlayerAdapter.isNetflix() && videoElement.playbackRate !== 1.0) {
          try { videoElement.playbackRate = 1.0; } catch (e) {}
        }
        return;
      }

      if (!PlayerAdapter.isNetflix()) {
        const rateFactor = 0.03;
        try {
          videoElement.playbackRate = (videoElement.currentTime < targetTime)
            ? (1.0 + rateFactor)
            : Math.max(0.95, 1.0 - rateFactor);
        } catch (e) {}
      }
      return;
    }

    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
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

const replaceBlock = `    // 4. NORMAL OYNATMA SIRASINDA DURUM (Her iki taraf da oynatıyor)
    if (state.isPlaying && !videoElement.paused) {
      if (drift > 6.5) {
        Logger.log(\`[FilmSync] Büyük sapma (\${drift.toFixed(1)}s), hard seek ile yetişiliyor.\`);
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
        });
        isSyncing = false;
        return;
      }

      // Dinamik sapma toleransı: Yüksek gecikmeli durumlarda toleransı artır (max 4.0s),
      // normal durumlarda daha sıkı tut (min 1.5s).
      const networkLatency = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt / 1000 : 0.5;
      const dynamicThreshold = Math.max(1.5, Math.min(4.0, 2.0 + networkLatency));

      if (drift <= dynamicThreshold) {
        if (!PlayerAdapter.isNetflix() && videoElement.playbackRate !== 1.0) {
          try { videoElement.playbackRate = 1.0; } catch (e) {}
        }
        isSyncing = false;
        return;
      }

      if (!PlayerAdapter.isNetflix()) {
        const rateFactor = 0.03;
        try {
          videoElement.playbackRate = (videoElement.currentTime < targetTime)
            ? (1.0 + rateFactor)
            : Math.max(0.95, 1.0 - rateFactor);
        } catch (e) {}
      }
      isSyncing = false;
      return;
    }

    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
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

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replaceBlock);
  fs.writeFileSync('extension/content.js', content, 'utf8');
  console.log("Success");
} else {
  console.log("Failed to match targetBlock");
}
