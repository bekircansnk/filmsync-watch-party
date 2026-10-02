const fs = require('fs');
let content = fs.readFileSync('extension/content.js', 'utf8');

const oldPlayerAdapter = `const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (videoElement) {
      videoElement.play();
    }
  },

  pause: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (videoElement) {
      videoElement.pause();
    }
  },

  seek: (seconds) => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (videoElement) {
      videoElement.currentTime = seconds;
    }
  }
};`;

const newPlayerAdapter = `const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      } else if (videoElement) {
        videoElement.play();
      }
    } catch (e) {
      Logger.error('[FilmSync] PlayerAdapter play hatası:', e);
    }
  },

  pause: () => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
      } else if (videoElement) {
        videoElement.pause();
      }
    } catch (e) {
      Logger.error('[FilmSync] PlayerAdapter pause hatası:', e);
    }
  },

  seek: (seconds) => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      } else if (videoElement) {
        videoElement.currentTime = seconds;
      }
    } catch (e) {
      Logger.error('[FilmSync] PlayerAdapter seek hatası:', e);
    }
  }
};`;

content = content.replace(oldPlayerAdapter, newPlayerAdapter);
fs.writeFileSync('extension/content.js', content, 'utf8');
