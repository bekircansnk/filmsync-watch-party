const fs = require('fs');

let content = fs.readFileSync('extension/content.js', 'utf8');

// Inside applyRemoteState callback, since we already set isSyncing = true BEFORE the callback,
// we don't need to re-set it to true for the minor drift cases, but we do need to make sure we set it to false
// after our actions, or just rely on executeProgrammaticSync which does that via syncSafetyTimer / finishProgrammaticSync.

// Wait, if it goes to buffering state block:
// if (videoElement.seeking || videoElement.readyState < 2) {
//   ... wait ...
// }
// we should probably set isSyncing = false if we defer to onVideoPlayable.

const targetBufferingBlock = `    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      pendingState = state;`;

const replacementBufferingBlock = `    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      isSyncing = false;
      pendingState = state;`;

content = content.replace(targetBufferingBlock, replacementBufferingBlock);

// For the normal execution block (no big drift, just play/pause),
// it previously had:
// isSyncing = true; PlayerAdapter.play(); setTimeout(() => { isSyncing = false; }, 800);
// We can just leave those setTimeout(..., 800) because they will clear the flag, and we don't need to remove 'isSyncing = true' since it's harmless.
// However, there is one early return at the very bottom of applyRemoteState:

const targetEndApply = `      } else if (drift > dynamicThreshold) {
        Logger.log(\`[FilmSync] Küçük sapma (\${drift.toFixed(1)}s), hız değiştirilerek yetişiliyor.\`);
        // Yüksek sapmada hızı daha agresif artır/azalt
        const rateAdjustment = drift > 3.0 ? 0.25 : (drift > 2.0 ? 0.15 : 0.05);
        const newRate = targetTime > videoElement.currentTime ? (1.0 + rateAdjustment) : (1.0 - rateAdjustment);
        if (Math.abs(videoElement.playbackRate - newRate) > 0.01) {
          videoElement.playbackRate = newRate;
          if (playbackRateResetTimer) clearTimeout(playbackRateResetTimer);
          playbackRateResetTimer = setTimeout(() => {
            if (videoElement && videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
          }, drift > 3.0 ? 3000 : 2000);
        }
      } else {
        if (videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
      }
    }
  });
}`;

const replacementEndApply = `      } else if (drift > dynamicThreshold) {
        Logger.log(\`[FilmSync] Küçük sapma (\${drift.toFixed(1)}s), hız değiştirilerek yetişiliyor.\`);
        // Yüksek sapmada hızı daha agresif artır/azalt
        const rateAdjustment = drift > 3.0 ? 0.25 : (drift > 2.0 ? 0.15 : 0.05);
        const newRate = targetTime > videoElement.currentTime ? (1.0 + rateAdjustment) : (1.0 - rateAdjustment);
        if (Math.abs(videoElement.playbackRate - newRate) > 0.01) {
          videoElement.playbackRate = newRate;
          if (playbackRateResetTimer) clearTimeout(playbackRateResetTimer);
          playbackRateResetTimer = setTimeout(() => {
            if (videoElement && videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
          }, drift > 3.0 ? 3000 : 2000);
        }
      } else {
        if (videoElement.playbackRate !== 1.0) videoElement.playbackRate = 1.0;
      }
    }

    // Default fallback to clear isSyncing if no executeProgrammaticSync or early return with explicit clear happened
    setTimeout(() => { isSyncing = false; }, 800);
  });
}`;

content = content.replace(targetEndApply, replacementEndApply);

fs.writeFileSync('extension/content.js', content, 'utf8');
