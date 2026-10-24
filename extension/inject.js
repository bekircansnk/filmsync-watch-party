// Film Partisi Page Injected Hook Script (Runs in page main world context across all video platforms)
(function() {
  if (window.__filmsyncInjectLoaded) return;
  window.__filmsyncInjectLoaded = true;

  try {
    if (document.documentElement) {
      document.documentElement.setAttribute('data-filmsync-inject-loaded', 'true');
    }
  } catch (e) {}


  const host = window.location.host.toLowerCase();
  const isNetflix = host.includes('netflix.com');
  const isDisney = host.includes('disneyplus.com');
  const isYouTube = host.includes('youtube.com');
  const isPrime = host.includes('primevideo.com') || host.includes('amazon.');

  // --- 🛡️ KATMAN 1: EVRENSEL TAM EKRAN <VIDEO> SARMALAYICI KORUMASI ---
  // Bazı oynatıcılar doğrudan <video>.requestFullscreen() çağırır.
  // <video> etiketinin içine <div> (sohbet baloncuğu) eklenemediği için, tam ekran isteğini
  // videonun üst kapsayıcısına (parentElement) veya üst pencereye yönlendirerek sohbet baloncuğunun daima üstte kalmasını sağlıyoruz.
  try {
    const origRequestFs = Element.prototype.requestFullscreen || Element.prototype.webkitRequestFullscreen;
    const origVideoRequestFs = HTMLVideoElement.prototype.requestFullscreen || HTMLVideoElement.prototype.webkitRequestFullscreen;
    if (origRequestFs) {
      const wrappedRequestFs = function(...args) {
        if (window !== window.top && document.documentElement.getAttribute('data-filmsync-room-active') === 'true') {
          try {
            window.top.postMessage({ type: 'filmsync-iframe-fullscreen-request' }, '*');
          } catch (err) {}
        }
        if (this && this.tagName === 'VIDEO' && document.documentElement.getAttribute('data-filmsync-room-active') === 'true') {
          const parent = this.parentElement;
          if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
            return origRequestFs.apply(parent, args);
          }
        }
        return origRequestFs.apply(this, args);
      };
      if (Element.prototype.requestFullscreen) Element.prototype.requestFullscreen = wrappedRequestFs;
      if (Element.prototype.webkitRequestFullscreen) Element.prototype.webkitRequestFullscreen = wrappedRequestFs;
      if (origVideoRequestFs) {
        HTMLVideoElement.prototype.requestFullscreen = wrappedRequestFs;
      }
    }
  } catch (e) {}

  // --- 🛡️ KATMAN 2: ANA DÜNYA (MAIN WORLD) KLAVYE KISAYOL İZOLASYONU ---
  // YouTube, JWPlayer, Plyr, Video.js, Vidmoly, Prime Video ve Netflix oynatıcılarının
  // M (sessize alma), F (tam ekran), K/J/L, C (altyazı), 0-9 (atlama) kısayollarını
  // oda aktifken sayfa bağlamında engeller; böylece her tuş doğrudan sohbete yazılır.
  function isRoomActiveInPage() {
    return document.documentElement.getAttribute('data-filmsync-room-active') === 'true' ||
           Boolean(document.documentElement.getAttribute('data-filmsync-room'));
  }

  function isExternalTextInput(el) {
    if (!el) return false;
    if (el.id === 'filmsyncMsgInput' || (el.closest && el.closest('#filmsync-root'))) return false;
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      const type = (el.type || 'text').toLowerCase();
      return !['range', 'button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'color', 'image', 'hidden'].includes(type);
    }
    if (el.isContentEditable) return true;
    return false;
  }

  function shouldInterceptForFilmSyncChat(e) {
    if (!e || !isRoomActiveInPage()) return false;
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const activeEl = document.activeElement;
    if (isExternalTextInput(activeEl)) return false;

    const isChatOpen = document.documentElement.getAttribute('data-filmsync-chat-open') === 'true';
    const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
    const isArrow = (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown');

    if (e.key === 'Escape') return false;
    if (isArrow) {
      const msgInput = document.getElementById('filmsyncMsgInput');
      return !!(isChatOpen && msgInput && msgInput.value && msgInput.value.length > 0);
    }
    if (isChatOpen) return true;
    if (isSpace) return false;
    if (e.key === 'Enter' || e.key === 'Backspace' || (e.key && e.key.length === 1)) return true;
    return false;
  }

  try {
    const origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if ((type === 'keydown' || type === 'keyup' || type === 'keypress') && typeof listener === 'function' && !listener.__filmsyncWrapped) {
        const wrappedListener = function(e) {
          if (shouldInterceptForFilmSyncChat(e)) {
            const targetEl = e && e.target;
            const isInsideFilmSync = targetEl && (targetEl.id === 'filmsyncMsgInput' || (targetEl.closest && targetEl.closest('#filmsync-root')));
            if (!isInsideFilmSync) {
              return;
            }
          }
          return listener.apply(this, arguments);
        };
        wrappedListener.__filmsyncWrapped = true;
        return origAddEventListener.call(this, type, wrappedListener, options);
      }
      return origAddEventListener.call(this, type, listener, options);
    };
  } catch (e) {}

  function interceptMainWorldKey(e) {
    if (!shouldInterceptForFilmSyncChat(e)) return;
    const targetEl = e && e.target;
    const isInsideFilmSync = targetEl && (targetEl.id === 'filmsyncMsgInput' || (targetEl.closest && targetEl.closest('#filmsync-root')));
    if (isInsideFilmSync) return;

    if (e.type === 'keydown') {
      try {
        (window.top || window).postMessage({
          type: 'filmsync-mainworld-keydown',
          key: e.key,
          code: e.code,
          shiftKey: e.shiftKey
        }, '*');
      } catch (err) {
        window.postMessage({
          type: 'filmsync-mainworld-keydown',
          key: e.key,
          code: e.code,
          shiftKey: e.shiftKey
        }, '*');
      }
    }
    e.stopPropagation();
  }

  window.addEventListener('keydown', interceptMainWorldKey, false);
  window.addEventListener('keyup', interceptMainWorldKey, false);
  window.addEventListener('keypress', interceptMainWorldKey, false);

  // --- 🎬 NETFLIX OYNATICI API'SİNE ERİŞİM ---
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

  // --- 🏰 DISNEY+ OYNATICI API'SİNE ERİŞİM ---
  function getDisneyPlayer() {
    try {
      const hostEl = document.querySelector("disney-web-player");
      return hostEl ? hostEl.mediaPlayer : null;
    } catch (e) {
      console.error('[FilmSync Inject] Disney+ player eldesi başarısız:', e);
      return null;
    }
  }

  function handleDisneyDOMFallback(action, value) {
    try {
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
          
          const eventOpts = { pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX: clickX, clientY: clickY, view: window };
          seekbar.dispatchEvent(new PointerEvent("pointerdown", eventOpts));
          seekbar.dispatchEvent(new PointerEvent("pointerup", eventOpts));
        }
      }
    } catch (err) {
      console.error('[FilmSync Inject] Disney+ DOM Fallback hatası:', err);
    }
  }

  // --- ▶️ YOUTUBE OYNATICI API'SİNE ERİŞİM ---
  function getYouTubePlayer() {
    try {
      const url = window.location.href;
      if (url.includes("/shorts/")) {
        return document.querySelector("#shorts-player") || document.querySelector("#movie_player");
      }
      return document.querySelector("#movie_player") || document.querySelector(".html5-video-player");
    } catch (e) {
      console.error('[FilmSync Inject] YouTube player eldesi başarısız:', e);
      return null;
    }
  }

  // --- 🌐 GENEL OYNAYICI (JWPLAYER / VIDEOJS / PLYR / HTML5) YARDIMCISI ---
  function executeUniversalPlayerCommand(action, value) {
    try {
      // 1. JWPlayer API varsa (Vidmoly, Rapidrame, HDFilmCehennemi, FullHDFilmizlesene, Dizipal)
      if (typeof window.jwplayer === 'function') {
        const jw = window.jwplayer();
        if (jw && typeof jw.getState === 'function') {
          if (action === 'play') jw.play(true);
          else if (action === 'pause') jw.pause(true);
          else if (action === 'seek' && typeof value === 'number') jw.seek(value);
          return true;
        }
      }
      // 2. Video.js API varsa
      if (typeof window.videojs === 'function' && window.videojs.players) {
        const players = Object.values(window.videojs.players).filter(Boolean);
        if (players.length > 0) {
          const vjs = players[0];
          if (action === 'play' && typeof vjs.play === 'function') vjs.play();
          else if (action === 'pause' && typeof vjs.pause === 'function') vjs.pause();
          else if (action === 'seek' && typeof vjs.currentTime === 'function') vjs.currentTime(value);
          return true;
        }
      }
    } catch (e) {}
    return false;
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
    if (typeof player.isReady === 'function' && !player.isReady()) {
      return false;
    }
    if (typeof player.getBusy === 'function') {
      const busy = player.getBusy();
      if (busy !== null && busy !== false) {
        return false;
      }
    }
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
    if (!window.location.pathname.includes('/watch')) return false;
    checkSkipSupplemental();
    const player = getNetflixPlayer();
    if (player && isNetflixPlayerReady(player)) {
      if (!netflixReadyNotified || forceResend) {
        netflixReadyNotified = true;
                window.postMessage({ source: 'filmsync-inject', action: 'player-ready', platform: 'netflix' }, '*');
      }
      processNetflixCommandQueue();
      return true;
    }
    return false;
  }

  if (isNetflix) {
    setInterval(() => {
      if (document.hidden || !window.location.pathname.includes('/watch')) return;
      if (!netflixReadyNotified || netflixCommandQueue.length > 0) {
        notifyNetflixReadyIfAvailable();
      }
    }, 1000);
  }

  function enqueueNetflixAction(action, value) {
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
      return;
    }

    if (!isNetflixPlayerReady(player)) {
      if (netflixBusyRetryTimer) clearTimeout(netflixBusyRetryTimer);
      netflixBusyRetryTimer = setTimeout(processNetflixCommandQueue, 150);
      return;
    }

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
        try {
          const dur = typeof player.getDuration === 'function' ? player.getDuration() : (player.duration || 0);
          if (dur > 0 && targetMs >= dur) {
            targetMs = Math.max(0, dur - 500);
          }
        } catch (ignoreDur) {}

        let skipSeek = false;
        try {
          const currentMs = typeof player.getCurrentTime === 'function' ? player.getCurrentTime() : -1;
          if (currentMs >= 0 && Math.abs(currentMs - targetMs) < 1500) {
            skipSeek = true;
          }
        } catch (ignoreErr) {}

        if (!skipSeek) {
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
      if (isNetflix) {
        notifyNetflixReadyIfAvailable(true);
      } else {
        window.postMessage({ source: 'filmsync-inject', action: 'player-ready', platform: 'universal' }, '*');
      }
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
            player.seek(value * 1000);
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
            player.seekTo(value, true);
          }
        } catch (err) {
          console.error('[FilmSync Inject] YouTube player komut hatası:', err);
        }
      }
    }
    // Diğer tüm siteler (JWPlayer, Video.js, Prime Video, FullHDFilmizlesene, HDFilmCehennemi, Dizipal vb.)
    else {
      executeUniversalPlayerCommand(action, value);
    }
  });
})();
