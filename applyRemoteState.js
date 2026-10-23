function applyRemoteState(state) {
  if (!state) return;
  lastKnownState = state;

  // Yönlendirme bildirimi (Sadece video adresi gerçekten farklı bir filme/bölüme aitse ve üst penceredeysek)
  // 1. Oda sahibi (host) kesinlikle yönlendirilmez ve bildirim görmez (Host serbestçe gezinir)
  // 2. Durumu güncelleyen kişi (senderId) kesinlikle yönlendirilmez
  const isHost = (userId && hostId && userId === hostId) || (!hostOnly && !hostId);
  const isSender = (state.senderId && state.senderId === userId);
  if (!isHost && !isSender && state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
    if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
      showMovieRedirectNotification(state.url, state.pageTitle);
      return;
    }
  }

  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) return;

    // Video buffering veya seeking halindeyse hard seek yapıp CDN buffer'ı tekrar çökertme
    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      pendingState = state;
      let playableTimer = null;
      const onVideoPlayable = () => {
        if (playableTimer) clearTimeout(playableTimer);
        if (!videoElement) return;
        videoElement.removeEventListener('canplay', onVideoPlayable);
        videoElement.removeEventListener('loadeddata', onVideoPlayable);
        if (pendingState) {
          const s = pendingState;
          pendingState = null;
          applyRemoteState(s);
        }
      };
      videoElement.addEventListener('canplay', onVideoPlayable, { once: true });
      videoElement.addEventListener('loadeddata', onVideoPlayable, { once: true });
      playableTimer = setTimeout(onVideoPlayable, 2000);
      return;
    }

    const now = getEstimatedServerTime();
    const timeDiff = state.isPlaying ? Math.max(0, (now - (state.lastUpdated || now)) / 1000) : 0;
    const targetTime = state.currentTime + timeDiff;
    const drift = Math.abs(videoElement.currentTime - targetTime);

    const needsPlay = state.isPlaying && videoElement.paused;
    const needsPause = !state.isPlaying && !videoElement.paused;

    // 1. AÇIK BİR KULLANICI SEEK'İ (action === 'seek')
    if (state.action === 'seek') {
      executeProgrammaticSync(targetTime, () => {
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying && videoElement.paused) PlayerAdapter.play();
        else if (!state.isPlaying && !videoElement.paused) PlayerAdapter.pause();
      });
      return;
    }

    // 2. PLAY EMRİ GELDİ (DURAKLATILMIŞTI, BAŞLATILIYOR)
    if (needsPlay) {
      if (drift > 4.5) {
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
          PlayerAdapter.play();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.play();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 3. PAUSE EMRİ GELDİ (OYNATILIYORDU, DURDURULUYOR)
    if (needsPause) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
          PlayerAdapter.pause();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.pause();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 4. NORMAL OYNATMA SIRASINDA DURUM (Her iki taraf da oynatıyor)
    if (state.isPlaying && !videoElement.paused) {
      if (drift > 6.5) {
        Logger.log(`[FilmSync] Büyük sapma (${drift.toFixed(1)}s), hard seek ile yetişiliyor.`);
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
  });
}

// Zorla Senkronize Et (Debounce korumalı ve akıllı eşitleme)
function forceSync() {
  if (forceSyncDebounceTimer) clearTimeout(forceSyncDebounceTimer);
  forceSyncDebounceTimer = setTimeout(() => {
    executeForceSync();
  }, 100);
}

function executeForceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;
    lastKnownState = state;

    const isHost = (userId && hostId && userId === hostId) || (!hostOnly && !hostId);
    const isSender = (state.senderId && state.senderId === userId);
    if (!isHost && !isSender && state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
      if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
        showMovieRedirectNotification(state.url, state.pageTitle);
        return;
      }
    }

    ensureVideoReady((isReady) => {
      if (!isReady || !videoElement) {
        isFirstSync = false;
        return;
      }

      // Oda sahibi isek ve video zaten ilerlemişse (> 5s) yerel konumu koru;
      // Ancak TR Dublaj / TR Altyazı kaynak değişimi nedeniyle yeni iframe 0. saniyeden başladıysa ve odada > 5s süre varsa odaya senkronize ol!
      if (userId === hostId && videoElement.currentTime > 5 && (!state.currentTime || Math.abs(videoElement.currentTime - state.currentTime) < 10)) {
        Logger.log('[FilmSync] Host için forceSync atlandı, yerel oynatma konumu korunuyor.');
        isFirstSync = false;
        return;
      }

      applyRemoteState(state);
      isFirstSync = false;
    });
  });
}

// Bağlantı Temizleme
function cleanupFirebase(isExplicitLeave = false) {
  if (videoTrackingInterval) { clearInterval(videoTrackingInterval); videoTrackingInterval = null; }
  if (driftCorrectionInterval) { clearInterval(driftCorrectionInterval); driftCorrectionInterval = null; }
  if (uiKeeperInterval) { clearInterval(uiKeeperInterval); uiKeeperInterval = null; }
  if (iframeKeeperInterval) { clearInterval(iframeKeeperInterval); iframeKeeperInterval = null; }
  if (netflixButtonObserver) { netflixButtonObserver.disconnect(); netflixButtonObserver = null; }
  if (netflixButtonDebounceTimer) { clearTimeout(netflixButtonDebounceTimer); netflixButtonDebounceTimer = null; }
  if (bufferingDebounceTimer) { clearTimeout(bufferingDebounceTimer); bufferingDebounceTimer = null; }
  if (userSeekDebounceTimer) { clearTimeout(userSeekDebounceTimer); userSeekDebounceTimer = null; }
  if (syncSafetyTimer) { clearTimeout(syncSafetyTimer); syncSafetyTimer = null; }
  if (forceSyncDebounceTimer) { clearTimeout(forceSyncDebounceTimer); forceSyncDebounceTimer = null; }
  stopHeartbeat();
  isProgrammaticSeeking = false;

  if (db && roomId && userId) {
    if (window === window.top && isExplicitLeave) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }

    if (isExplicitLeave) {
      db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
        db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
          const users = snapshot.val();
          if (!users || Object.keys(users).length === 0) {
            db.ref(`rooms/${roomId}`).remove();
          }
        });
      });
    }

    db.ref(`rooms/${roomId}/lastState`).off();
    db.ref(`rooms/${roomId}/messages`).off();
    db.ref(`rooms/${roomId}/users`).off();
    db.ref(`rooms/${roomId}/reactions`).off();
    db.ref('.info/serverTimeOffset').off();

    renderedMessageKeys.clear();
  }
}

// Medya Olayını Gönderme
function sendMediaEvent(isPlaying, currentTime, action = 'event') {
  if (isSyncing) return;

  // Eğer alt iframe içindeysek ve CSP / üçüncü parti çerez kısıtlaması nedeniyle db veya roomId henüz hazır değilse,
  // medya olayını (seek, play, pause) doğrudan üst pencereye (window.top) röle et!
  if ((!db || !roomId) && window !== window.top) {
    try {
      window.top.postMessage({
        type: 'filmsync-iframe-media-event',
        isPlaying,
        currentTime,
        action
      }, '*');
    } catch (e) {}
    return;
  }
  if (!db || !roomId) return;

  // Sadece host kontrolü aktifse ve ben host değilsem engelle
  if (hostOnly && userId !== hostId) {
    Logger.log('[FilmSync] Medya kontrolü engellendi: Sadece oda sahibi kontrol edebilir.');
    // Misafir yetkisiz işlem yaptığında videoyu oda durumuna geri döndür
    if (lastKnownState) {
      setTimeout(() => applyRemoteState(lastKnownState), 200);
    }
    return;
  }

  const hasActiveVideo = !!findBestVideoElement() || hasChildFrameVideo;
  const isBrowseExclusion = window.location.href.includes('netflix.com/browse') ||
                            window.location.href.includes('netflix.com/title') ||
                            window.location.href.includes('youtube.com/feed');
  if (isBrowseExclusion || (!isMovieWatchUrl(window.location.href) && !hasActiveVideo)) {
    Logger.log('[FilmSync] Video izleme sayfası olmayan sayfadan medya olayı gönderilmesi engellendi.');
    return;
  }

  const activeVideo = videoElement || findBestVideoElement();
  // Seek eyleminde readyState < 1 olsa bile (kullanıcı henüz yüklenen noktanın ilerisine sardığında) olayı engelleme!
  if (action !== 'seek' && activeVideo && (activeVideo.readyState < 1 || isNaN(activeVideo.duration) || activeVideo.duration === 0)) {
    Logger.log('[FilmSync] Video henüz hazır değil, medya olayı atlanıyor.');
    return;
  }

  // Yeni açılan oynatıcı veya TR Dublaj/Altyazı kaynak değişimi sırasında 0. saniyedeki otomatik pause/play olayının
  // odadaki ilerlemiş süreyi (> 5s) sıfırlamasını engelle!
  if (isFirstSync && currentTime < 2.0 && lastKnownState && lastKnownState.currentTime > 5.0 && action !== 'seek') {
    Logger.log('[FilmSync] İlk yüklemede 0s sıfırlaması engellendi, mevcut oda süresine senkronize ediliyor.');
    applyRemoteState(lastKnownState);
    return;
  }
  isFirstSync = false;

  if (PlayerAdapter.isNetflix() && !isPlatformPlayerReady) {
    return;
  }

  const updatePayload = {
    action,
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  // URL güncellemesi: Oda sahibi veya serbest modda (!hostOnly) katılımcı ana pencerede izliyorsa URL ve başlığı günceller
  if ((userId === hostId || !hostOnly) && window === window.top && (isMovieWatchUrl(window.location.href) || hasActiveVideo) && !isEmbedUrl(window.location.href) && !isBrowseExclusion) {
    updatePayload.url = normalizeMovieUrl(window.location.href);
    const title = getCleanPageTitle();
    if (title) updatePayload.pageTitle = title;
    updatePayload.platformName = detectPlatformName(window.location.href);
  } else if ((userId === hostId || !hostOnly) && window !== window.top) {
    // Oynatıcı bir iframe içindeyse (Dizipal, HDFilmCehennemi, FullHDFilmizlesene vb.),
    // ana pencereye sinyal göndererek ana sayfa URL'sinin ve başlığının Firebase'e yazılmasını sağla!
    try {
      window.top.postMessage({ type: 'filmsync-iframe-sync-top-url' }, '*');
    } catch (e) {}
  }

  const formattedTime = formatTime(currentTime);
  const now = Date.now();
  let msgText = null;

  if (action === 'pause') {
    if (lastSentPlayPauseAction !== 'pause' || (now - lastSentPlayPauseTimestamp > 2000)) {
      msgText = `${username} filmi duraklattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'pause';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'play') {
    const isRightAfterSeek = (now - lastSentSeekTimestamp) < 1000;
    if (!isRightAfterSeek && (lastSentPlayPauseAction !== 'play' || (now - lastSentPlayPauseTimestamp > 2000))) {
      msgText = `${username} filmi başlattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'play';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'seek') {
    const timeDiff = Math.abs(currentTime - lastSentSeekTime);
    if (timeDiff >= 1.0 || (now - lastSentSeekTimestamp > 1500)) {
      msgText = `${username} ${formattedTime} süresine atladı.`;
      lastSentSeekTime = currentTime;
      lastSentSeekTimestamp = now;
    }
  }

  if (msgText) {
    sendSystemMessage(msgText);
  }

  db.ref(`rooms/${roomId}/lastState`).update(updatePayload).catch(err => Logger.error('[FilmSync] Medya durum yazma hatası:', err));
}

// Videolu Sayfalarda UI ve SPA Geçiş Motoru
function startVideoTracking() {
  if (videoTrackingInterval) clearInterval(videoTrackingInterval);

  let iframeEmptyScanCount = 0;

  videoTrackingInterval = setInterval(() => {
    // Arka plandaki gizli sekmelerde gereksiz DOM taraması yapıp MacBook M4 işlemcisini yorma
    if (document.hidden && videoElement) return;

    // Alt iframelerde (reklam, analitik, boş çerçeveler) 8 deneme sonunda video yoksa ve embed URL değilse döngüyü sonlandır
    if (window !== window.top && !videoElement) {
      iframeEmptyScanCount++;
      if (iframeEmptyScanCount > 8 && !isEmbedUrl(window.location.href) && !isMovieWatchUrl(window.location.href)) {
        clearInterval(videoTrackingInterval);
        videoTrackingInterval = null;
        return;
      }
    }

    // SPA URL Değişimi Kontrolü (YouTube, Netflix, Prime Video, Dizipal bölüm geçişleri vb.)
    if (window.location.href !== lastTrackedLocationHref) {
      const oldHref = lastTrackedLocationHref;
      lastTrackedLocationHref = window.location.href;
      Logger.log('[FilmSync] SPA URL değişimi tespit edildi:', lastTrackedLocationHref);
      if (PlayerAdapter.isNetflix()) {
        isPlatformPlayerReady = false;
        window.postMessage({ source: 'filmsync-content', action: 'ping-player' }, '*');
      }
      // Eğer kullanıcı aktif odadayken yeni bir bölüme/videoya geçtiyse ve yetkiliyse (host veya !hostOnly)
      if (window === window.top && db && roomId && (userId === hostId || !hostOnly)) {
        const isBrowseExclusion = lastTrackedLocationHref.includes('netflix.com/browse') ||
                                  lastTrackedLocationHref.includes('netflix.com/title') ||
                                  lastTrackedLocationHref.includes('youtube.com/feed');
        if (!isBrowseExclusion && isMovieWatchUrl(lastTrackedLocationHref) && !isEmbedUrl(lastTrackedLocationHref)) {
          const cleanNewUrl = normalizeMovieUrl(lastTrackedLocationHref);
          if (!areUrlsSameMovie(oldHref, cleanNewUrl)) {
            setTimeout(() => {
              const title = getCleanPageTitle();
              db.ref(`rooms/${roomId}/lastState`).update({
                url: cleanNewUrl,
                pageTitle: title,
                platformName: detectPlatformName(cleanNewUrl),
                currentTime: 0,
                isPlaying: true,
                action: 'url_change',
                senderId: userId,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
              });
              sendSystemMessage(`${username} yeni bölüme/videoya geçti${title ? ': ' + title : '.'}`);
            }, 600);
          }
        }
      }
    }

    // Eğer videoElement zaten bulunduysa ve DOM içinde hala aktif/geçerliyse, her saniye tüm DOM/ShadowDOM ağacını yeniden tarama! (M4 CPU Optimizasyonu)
    let bestVideo = null;
    if (videoElement && videoElement.isConnected && (videoElement.readyState >= 1 || videoElement.src || videoElement.currentSrc)) {
      bestVideo = videoElement;
    } else {
      bestVideo = findBestVideoElement();
    }

    const hasActiveVideo = !!bestVideo;
    const isBrowseExclusion = window.location.href.includes('netflix.com/browse') ||
                              window.location.href.includes('netflix.com/title') ||
                              window.location.href.includes('youtube.com/feed');
    const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo || hasChildFrameVideo);

    // Ana pencerede oda aktifse sohbet baloncuğu her zaman hazır olmalı;
    // Yalnızca davet/arama sayfalarında baloncuğu temizle!
    if (window === window.top && roomId) {
      if ((shouldShowChatUIInTop() || isWatchPage) && !document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
      } else if (!shouldShowChatUIInTop() && !isWatchPage && document.getElementById('filmsync-root')) {
        removeChatUI();
      }
    }

    if (!isWatchPage) {
      if (videoElement) {
        removeVideoListeners();
        videoElement = null;
      }
      return;
    }

    if (bestVideo && bestVideo !== videoElement) {
      removeVideoListeners();
      videoElement = bestVideo;
      lastTrustedMuted = videoElement.muted;
      lastTrustedVolume = videoElement.volume;
      lastTrackedVideoTime = typeof videoElement.currentTime === 'number' ? videoElement.currentTime : -1;
      lastTrackedVideoTimestamp = Date.now();
      setupVideoListeners();

      Logger.log('[FilmSync] Yeni video elementi tespit edildi.');

      // Sayfa yenilendiyse ve otomatik oynatma koruması aktifse videoyu anında duraklat
      if (isReloadPauseGuardActive && Date.now() < reloadPauseGuardUntil) {
        PlayerAdapter.pause();
      }

      // Eğer iframe içindeysek ana pencereye "bu sayfada aktif video var" sinyali gönder
      if (window !== window.top) {
        try {
          window.top.postMessage({
            type: 'filmsync-iframe-has-video',
            frameUrl: window.location.href,
            currentTime: videoElement.currentTime || 0
          }, '*');
        } catch (e) {}
      }

      ensureVideoReady((ready) => {
        if (ready) forceSync();
      });

      if (!document.getElementById('filmsync-root') && window === window.top) {
        createChatUI();
        startUIKeeper();
      }

      if (window !== window.top) {
        initializeFirebase(firebaseConfig);
      }
    }
  }, 1500);
}

// Akıllı Eşitleme ve Sağlık Denetleyicisi (Heartbeat & Soft Auto-Sync)
function startDriftCorrection() {
  if (driftCorrectionInterval) clearInterval(driftCorrectionInterval);

  driftCorrectionInterval = setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing || isProgrammaticSeeking) return;
    if (videoElement.readyState < 3 || videoElement.seeking) return;

    // Oda sahibi (veya serbest modda aktif oynatıcı) durumu periyodik günceller
    if (userId === hostId) {
      if (!videoElement.paused) {
        db.ref(`rooms/${roomId}/lastState`).update({
          action: 'heartbeat',
          isPlaying: true,
          currentTime: videoElement.currentTime,
          senderId: userId,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      }
      return;
    }

    // Oda üyesi isek (host değilsek), mevcut oynatıcı durumunu lastKnownState ile karşılaştır.
    // Toleransı (threshold) ağ gecikmesine göre dinamik olarak hesapla.
    if (lastKnownState && lastKnownState.isPlaying) {
      const now = getEstimatedServerTime();
      const timeDiff = Math.max(0, (now - (lastKnownState.lastUpdated || now)) / 1000);
      const targetTime = lastKnownState.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - targetTime);

      const networkLatency = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt / 1000 : 0.5;
      const dynamicThreshold = Math.max(1.5, Math.min(4.0, 2.5 + networkLatency)); // Default was approx 2.5s conceptually, now dynamic

      if (drift > dynamicThreshold) {
        console.log(`[FilmSync] Auto-Sync tetiklendi, sapma: ${drift.toFixed(1)}s, eşik: ${dynamicThreshold.toFixed(1)}s`);
        forceSync();
      } else if (lastKnownState.isPlaying && videoElement.paused) {
        // Play state mismatch
        forceSync();
      }
    } else if (lastKnownState && !lastKnownState.isPlaying && !videoElement.paused) {
       forceSync();
    }
  }, 5000);
}
