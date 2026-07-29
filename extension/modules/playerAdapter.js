// Oynatıcı Adaptörü (Farklı Web Sitelerini ve Custom HTML5 Oynatıcıları Çapraz Kontrol Eder)

const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      } else if (videoElement) {
        const p = videoElement.play();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {
      console.warn('[FilmSync PlayerAdapter] Play hatası:', e);
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
      console.warn('[FilmSync PlayerAdapter] Pause hatası:', e);
    }
  },

  seek: (seconds) => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      } else if (videoElement && !isNaN(seconds) && isFinite(seconds) && seconds >= 0) {
        videoElement.currentTime = seconds;
      }
    } catch (e) {
      console.warn('[FilmSync PlayerAdapter] Seek hatası:', e);
    }
  }
};
