const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

// Also check state.action === 'seek' early return path at the beginning
const targetSeek = `    // 1. AÇIK BİR KULLANICI SEEK'İ (action === 'seek')
    if (state.action === 'seek') {
      executeProgrammaticSync(targetTime, () => {
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying && videoElement.paused) PlayerAdapter.play();
        else if (!state.isPlaying && !videoElement.paused) PlayerAdapter.pause();
      });
      return;
    }`;

const replaceSeek = `    // 1. AÇIK BİR KULLANICI SEEK'İ (action === 'seek')
    if (state.action === 'seek') {
      executeProgrammaticSync(targetTime, () => {
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying && videoElement.paused) PlayerAdapter.play();
        else if (!state.isPlaying && !videoElement.paused) PlayerAdapter.pause();
      });
      isSyncing = false;
      return;
    }`;

if (content.includes(targetSeek)) {
  content = content.replace(targetSeek, replaceSeek);
  fs.writeFileSync('extension/content.js', content, 'utf8');
  console.log("Success Seek");
} else {
  console.log("Failed to match targetSeek");
}
