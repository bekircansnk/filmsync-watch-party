// Film Partisi Page Injected Hook Script (Runs in page context)
(function() {
  console.log('[FilmSync Inject] Platform hook scripti yüklendi.');

  const isNetflix = window.location.host.includes('netflix.com');
  const isDisney = window.location.host.includes('disneyplus.com');
  const isYouTube = window.location.host.includes('youtube.com');

  // Netflix oynatıcı API'sine erişim
  function getNetflixPlayer() {
    try {
      const netflixObj = window.netflix;
      if (netflixObj) {
        const videoPlayer = netflixObj.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
        if (videoPlayer) {
          const sessionIds = videoPlayer.getAllPlayerSessionIds();
          if (sessionIds && sessionIds.length > 0) {
            // watch- ile başlayan veya watch içeren en güncel aktif oturum ID'sini bul (yeni bölümlerde geriye doğru tara)
            let watchSessionId = null;
            for (let i = sessionIds.length - 1; i >= 0; i--) {
              if (sessionIds[i] && (sessionIds[i].includes('watch') || sessionIds[i].indexOf('watch-') === 0)) {
                watchSessionId = sessionIds[i];
                break;
              }
            }
            if (!watchSessionId) {
              watchSessionId = sessionIds[sessionIds.length - 1];
            }
            let activeVideoPlayer = videoPlayer.getVideoPlayerBySessionId(watchSessionId);
            if (!activeVideoPlayer && sessionIds.length > 0) {
              activeVideoPlayer = videoPlayer.getVideoPlayerBySessionId(sessionIds[sessionIds.length - 1]);
            }
            if (activeVideoPlayer) return activeVideoPlayer;
          }
        }
      }

      // React Fiber Fallback (Teleparty desenli derin API eldesi)
      const watchVideoWrapper = document.querySelector('.watch-video') || document.querySelector('div[data-uia="player"]') || document.querySelector('video');
      if (watchVideoWrapper) {
        const keys = Object.keys(watchVideoWrapper);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
        if (fiberKey) {
          let node = watchVideoWrapper[fiberKey];
          let depth = 0;
          while (node && depth < 35) {
            // 1. stateNode kontrolleri
            if (node.stateNode) {
              if (typeof node.stateNode.getVideoPlayer === 'function') {
                const vp = node.stateNode.getVideoPlayer();
                if (vp) return vp;
              }
              if (node.stateNode?.playerApp?.getAPI()?.videoPlayer) {
                const vp = node.stateNode.playerApp.getAPI().videoPlayer;
                const sIds = vp.getAllPlayerSessionIds();
                if (sIds && sIds.length > 0) {
                  return vp.getVideoPlayerBySessionId(sIds[sIds.length - 1]);
                }
              }
            }
            // 2. memoizedProps kontrolleri (React 18 functional component desteği)
            if (node.memoizedProps) {
              if (typeof node.memoizedProps.getVideoPlayer === 'function') {
                const vp = node.memoizedProps.getVideoPlayer();
                if (vp) return vp;
              }
              if (node.memoizedProps?.playerApp?.getAPI()?.videoPlayer) {
                const vp = node.memoizedProps.playerApp.getAPI().videoPlayer;
                const sIds = vp.getAllPlayerSessionIds();
                if (sIds && sIds.length > 0) {
                  return vp.getVideoPlayerBySessionId(sIds[sIds.length - 1]);
                }
              }
            }
            node = node.return;
            depth++;
          }
        }
      }
      return null;
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

  // Netflix Supplemental / Pre-play Atlama Desteği (Teleparty standardı)
  function getWrapperStateNode() {
    try {
      const watchVideoWrapper = document.querySelector('.watch-video') || document.querySelector('div[data-uia="player"]');
      if (watchVideoWrapper) {
        const keys = Object.keys(watchVideoWrapper);
        const fiberKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
        if (fiberKey) {
          let node = watchVideoWrapper[fiberKey];
          let depth = 0;
          while (node && depth < 8) {
            if (node.stateNode && (typeof node.stateNode.handleFinishPrePlay === 'function' || node.stateNode.state?.activeVideoMetadata)) {
              return node.stateNode;
            }
            node = node.return;
            depth++;
          }
        }
      }
    } catch (e) {}
    return null;
  }

  let hasSkippedSupplemental = false;
  function checkSkipSupplemental() {
    try {
      const wrapperNode = getWrapperStateNode();
      const isSupplemental = wrapperNode && wrapperNode.state?.activeVideoMetadata?._video?.type === 'supplemental';
      if (isSupplemental) {
        if (!hasSkippedSupplemental) {
          hasSkippedSupplemental = true;
          console.log('[FilmSync Inject] Netflix supplemental/pre-play tespit edildi, tek seferlik atlanıyor.');
          if (typeof wrapperNode.handleFinishPrePlay === 'function') {
            wrapperNode.handleFinishPrePlay();
          }
        }
      } else {
        hasSkippedSupplemental = false;
      }
    } catch (e) {}
  }

  // Netflix Cadmium Oynatıcısının Gerçekten Komut Almaya Hazır Olup Olmadığını Doğrulayan Motor
  function isNetflixPlayerReady(player) {
    if (!player) return false;
    if (typeof player.seek !== 'function' || typeof player.play !== 'function' || typeof player.pause !== 'function') {
      return false;
    }
    // 1. Cadmium isReady kontrolü (Başlatma evresindeyken false döner)
    if (typeof player.isReady === 'function' && !player.isReady()) {
      return false;
    }
    // 2. Cadmium getBusy kontrolü (Buffer yüklerken veya seeking halindeyken true/nesne döner)
    if (typeof player.getBusy === 'function') {
      const busy = player.getBusy();
      if (busy !== null && busy !== false) {
        return false;
      }
    }
    // 3. Cadmium getDuration kontrolü (Stream manifest çözülmeden önce duration 0 veya tanımsızdır)
    try {
      const dur = typeof player.getDuration === 'function' ? player.getDuration() : (player.duration || 0);
      if (typeof dur === 'number' && dur <= 0) {
        return false;
      }
    } catch (e) {}

    return true;
  }

  // Netflix Hazır Olma Takibi ve Sağlam Komut Kuyruğu (DOM Fallback İptali)
  const netflixCommandQueue = [];
  let isProcessingQueue = false;
  let netflixBusyRetryTimer = null;
  let netflixReadyNotified = false;
  let lastExecutedAction = null;
  let lastActionTimestamp = 0;

  function notifyNetflixReadyIfAvailable(forceResend = false) {
    checkSkipSupplemental();
    const player = getNetflixPlayer();
    if (player && isNetflixPlayerReady(player)) {
      if (!netflixReadyNotified || forceResend) {
        netflixReadyNotified = true;
        console.log('[FilmSync Inject] Netflix oynatıcı API tam hazır, sinyal gönderildi.');
        window.postMessage({ source: 'filmsync-inject', action: 'player-ready', platform: 'netflix' }, '*');
      }
      processNetflixCommandQueue();
      return true;
    }
    return false;
  }

  if (isNetflix) {
    const readyInterval = setInterval(() => {
      notifyNetflixReadyIfAvailable();
    }, 500);
  }

  function enqueueNetflixAction(action, value) {
    // Eğer kuyrukta bekleyen birden fazla seek varsa, sadece en sonuncusunu tut (coalescing)
    if (action === 'seek') {
      for (let i = netflixCommandQueue.length - 1; i >= 0; i--) {
        if (netflixCommandQueue[i].action === 'seek') {
          netflixCommandQueue.splice(i, 1);
        }
      }
    }
    netflixCommandQueue.push({ action, value });
    processNetflixCommandQueue();
  }

  function processNetflixCommandQueue() {
    if (isProcessingQueue || netflixCommandQueue.length === 0) return;

    const player = getNetflixPlayer();
    if (!player) {
      // Player henüz hazır değil, kuyrukta beklet
      return;
    }

    // Player tam olarak hazır değilse veya meşgulse bekle (Siyah ekran / kırmızı çark kilitlenmesini engelle)
    if (!isNetflixPlayerReady(player)) {
      if (netflixBusyRetryTimer) clearTimeout(netflixBusyRetryTimer);
      netflixBusyRetryTimer = setTimeout(processNetflixCommandQueue, 150);
      return;
    }

    // Eğer son komut seek idiyse ve üzerinden 300ms geçmediyse Cadmium'a nefes payı ver (Seek/Pause çakışmasını önle)
    const now = Date.now();
    if (lastExecutedAction === 'seek' && now - lastActionTimestamp < 300) {
      if (netflixBusyRetryTimer) clearTimeout(netflixBusyRetryTimer);
      netflixBusyRetryTimer = setTimeout(processNetflixCommandQueue, 300 - (now - lastActionTimestamp));
      return;
    }

    isProcessingQueue = true;
    const item = netflixCommandQueue.shift();
    const { action, value } = item;

    try {
      if (action === 'play') {
        if (typeof player.isPaused === 'function' && !player.isPaused()) {
          // Zaten oynatılıyor
        } else {
          player.play();
          lastExecutedAction = 'play';
          lastActionTimestamp = Date.now();
        }
      } else if (action === 'pause') {
        if (typeof player.isPaused === 'function' && player.isPaused()) {
          // Zaten duraklatılmış
        } else {
          player.pause();
          lastExecutedAction = 'pause';
          lastActionTimestamp = Date.now();
        }
      } else if (action === 'seek') {
        let targetMs = Math.max(0, Math.round(value * 1000));
        // Süre aşımını engelle
        try {
          const dur = typeof player.getDuration === 'function' ? player.getDuration() : (player.duration || 0);
          if (dur > 0 && targetMs >= dur) {
            targetMs = Math.max(0, dur - 500);
          }
        } catch (ignoreDur) {}

        // Netflix keyframe sınırları gereği 1500ms altındaki mikro-seek çağrılarını atla (CDN buffer silinmesini engelle)
        let skipSeek = false;
        try {
          const currentMs = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : -1;
          if (currentMs >= 0 && Math.abs(currentMs - targetMs) < 1500) {
            skipSeek = true;
          }
        } catch (ignoreErr) {}

        if (!skipSeek) {
          // Teleparty standardı: keyframe geri çekme payı (-100ms)
          const seekTime = Math.max(0, targetMs > 100 ? targetMs - 100 : targetMs);
          player.seek(seekTime);
          lastExecutedAction = 'seek';
          lastActionTimestamp = Date.now();
        }
      }
    } catch (err) {
      console.error('[FilmSync Inject] Netflix player komut hatası:', err);
    } finally {
      isProcessingQueue = false;
      if (netflixCommandQueue.length > 0) {
        setTimeout(processNetflixCommandQueue, lastExecutedAction === 'seek' ? 250 : 100);
      }
    }
  }

  // Content script'ten gelen postMessage olaylarını dinleme
  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') {
      return;
    }

    const { action, value } = event.data;

    if (action === 'ping-player') {
      notifyNetflixReadyIfAvailable(true);
      return;
    }

    // Netflix Kontrolleri
    if (isNetflix) {
      enqueueNetflixAction(action, value);
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
