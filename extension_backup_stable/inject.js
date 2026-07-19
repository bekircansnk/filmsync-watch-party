// FilmSync Page Injected Hook Script (Runs in page context)
(function() {
  console.log('[FilmSync Inject] Platform hook scripti yüklendi.');

  const isNetflix = window.location.host.includes('netflix.com');
  const isDisney = window.location.host.includes('disneyplus.com');
  const isYouTube = window.location.host.includes('youtube.com');

  // Netflix oynatıcı API'sine erişim
  function getNetflixPlayer() {
    try {
      const netflixObj = window.netflix;
      if (!netflixObj) return null;

      const videoPlayer = netflixObj.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
      if (!videoPlayer) return null;

      const sessionIds = videoPlayer.getAllPlayerSessionIds();
      if (!sessionIds || sessionIds.length === 0) return null;

      // watch- ile başlayan aktif oturum ID'sini bul
      const watchSessionId = sessionIds.find(id => id.indexOf('watch-') === 0) || sessionIds[0];
      return videoPlayer.getVideoPlayerBySessionId(watchSessionId);
    } catch (e) {
      console.error('[FilmSync Inject] Netflix player eldesi başarısız:', e);
      return null;
    }
  }

  // Disney+ oynatıcı API'sine erişim
  function getDisneyPlayer() {
    try {
      const host = document.querySelector("disney-web-player");
      return host ? host.mediaPlayer : null;
    } catch (e) {
      console.error('[FilmSync Inject] Disney+ player eldesi başarısız:', e);
      return null;
    }
  }

  // Disney+ MediaPlayer bulunamazsa Shadow DOM fallback mekanizması
  function handleDisneyDOMFallback(action, value) {
    try {
      // Kontrolleri tetiklemek için ana oynatıcı elementine tıkla
      const player = document.querySelector(".btm-media-player") || document.querySelector("disney-web-player");
      if (player) {
        player.click();
      }

      if (action === 'play') {
        const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
        const playBtn = toggleBtn?.shadowRoot?.querySelector(".play-button");
        if (playBtn) {
          playBtn.click();
        }
      } else if (action === 'pause') {
        const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
        const pauseBtn = toggleBtn?.shadowRoot?.querySelector(".pause-button");
        if (pauseBtn) {
          pauseBtn.click();
        }
      } else if (action === 'seek') {
        const progressBar = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("progress-bar");
        const seekbar = progressBar?.shadowRoot?.querySelector(".progress-bar__seekable-range");
        if (seekbar) {
          const maxTime = Number(seekbar.getAttribute("aria-valuemax")) || 1;
          const minTime = Number(seekbar.getAttribute("aria-valuemin")) || 0;
          const progress = value / (maxTime - minTime);
          
          const seekBounds = seekbar.getBoundingClientRect();
          const clickX = (progress * seekbar.offsetWidth) + seekBounds.left;
          const clickY = seekBounds.top + (seekBounds.height / 2);
          
          // PointerEvent simülasyonu ile seek barı tıklat
          const eventOpts = { pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX: clickX, clientY: clickY, view: window };
          seekbar.dispatchEvent(new PointerEvent("pointerdown", eventOpts));
          seekbar.dispatchEvent(new PointerEvent("pointerup", eventOpts));
        }
      }
    } catch (err) {
      console.error('[FilmSync Inject] Disney+ DOM Fallback hatası:', err);
    }
  }

  // YouTube oynatıcı API'sine erişim
  function getYouTubePlayer() {
    try {
      const url = window.location.href;
      if (url.includes("/shorts/")) {
        return document.querySelector("#shorts-player");
      }
      if (url.includes("/watch")) {
        return document.querySelector("#movie_player");
      }
      return null;
    } catch (e) {
      console.error('[FilmSync Inject] YouTube player eldesi başarısız:', e);
      return null;
    }
  }

  // Content script'ten gelen postMessage olaylarını dinleme
  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') {
      return;
    }

    const { action, value } = event.data;

    // Netflix Kontrolleri
    if (isNetflix) {
      const player = getNetflixPlayer();
      if (player) {
        try {
          if (action === 'play') {
            player.play();
          } else if (action === 'pause') {
            player.pause();
          } else if (action === 'seek') {
            player.seek(value * 1000); // Netflix API milisaniye cinsinden seek alır
          }
        } catch (err) {
          console.error('[FilmSync Inject] Netflix player komut hatası:', err);
        }
      } else {
        console.warn('[FilmSync Inject] Netflix player objesi bulunamadı.');
      }
    }
    // Disney+ Kontrolleri
    else if (isDisney) {
      const player = getDisneyPlayer();
      if (player) {
        try {
          if (action === 'play') {
            player.play();
          } else if (action === 'pause') {
            player.pause();
          } else if (action === 'seek') {
            player.seek(value * 1000); // Disney+ API milisaniye cinsinden seek alır
          }
        } catch (err) {
          console.error('[FilmSync Inject] Disney+ player komut hatası:', err);
          handleDisneyDOMFallback(action, value);
        }
      } else {
        handleDisneyDOMFallback(action, value);
      }
    }
    // YouTube Kontrolleri
    else if (isYouTube) {
      const player = getYouTubePlayer();
      if (player) {
        try {
          if (action === 'play' && typeof player.playVideo === 'function') {
            player.playVideo();
          } else if (action === 'pause' && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
          } else if (action === 'seek' && typeof player.seekTo === 'function') {
            player.seekTo(value, true); // YouTube API saniye cinsinden seek alır
          }
        } catch (err) {
          console.error('[FilmSync Inject] YouTube player komut hatası:', err);
        }
      } else {
        console.warn('[FilmSync Inject] YouTube player objesi bulunamadı.');
      }
    }
  });
})();
