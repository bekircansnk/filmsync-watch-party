// FilmSync Medya Senkronizasyon ve Firebase Motoru Modülü

let serverTimeOffset = 0;
let lastSentMediaState = { isPlaying: null, currentTime: -1, timestamp: 0 };
let lastSentServerTime = 0;
let isFirebaseInitialized = false;

function initializeFirebase(config) {
  if (!roomId) return;
  
  if (typeof firebase === 'undefined') {
    console.error('[FilmSync] Firebase kütüphanesi yüklenemedi!');
    return;
  }
  
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    db = firebase.database();
    isFirebaseInitialized = true;
    
    db.ref('.info/connected').on('value', (snap) => {
      const isConnected = snap.val();
      const statusDot = document.getElementById('filmsyncStatusDot');
      if (statusDot) {
        if (isConnected) {
          statusDot.classList.add('active');
        } else {
          statusDot.classList.remove('active');
        }
      }
    });

    const hasVideo = !!document.querySelector('video');
    const roomRef = db.ref(`rooms/${roomId}`);
    
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        hostId = roomData.hostId;
        hostOnly = roomData.hostOnly || false;
        
        if (roomData.hostId === userId && window === window.top && hasVideo) {
          db.ref(`rooms/${roomId}/lastState`).once('value').then((stateSnap) => {
            const currentState = stateSnap.val();
            if (currentState && currentState.url === window.location.href && currentState.currentTime > 0) {
              console.log('[FilmSync] Host yenileme algılandı, mevcut oda durumu korunuyor:', currentState);
            } else {
              const validUrl = (!isEmbedUrl(window.location.href) && checkIsMoviePage()) ? window.location.href : (currentState?.url || '');
              db.ref(`rooms/${roomId}/lastState`).update({
                url: validUrl,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                senderId: userId
              });
            }
          });
        }
      } else {
        if (window === window.top) {
          const initialUrl = (!isEmbedUrl(window.location.href) && checkIsMoviePage()) ? window.location.href : '';
          roomRef.set({
            password: password,
            hostId: userId,
            hostOnly: false,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: initialUrl,
              senderId: userId,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
        }
      }
      
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP, isBuffering: false, avatar: selectedAvatar });
      userRef.onDisconnect().remove();
      
      const sessionKey = `joined_${roomId}`;
      if (window === window.top && !sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, 'true');
        sendSystemMessage(`${username} odaya katıldı.`);
      }
      
      setupFirebaseListeners();
      forceSync();
      setTimeout(() => {
        isFirstSync = false;
      }, 1500);
    }).catch(err => {
      console.error('[FilmSync] Firebase bağlantı hatası:', err);
    });

  } catch (err) {
    console.error('[FilmSync] Firebase başlatılamadı:', err);
  }
}

function setupFirebaseListeners() {
  if (!db) return;

  db.ref(`rooms/${roomId}/hostId`).on('value', (snap) => {
    hostId = snap.val();
  });
  db.ref(`rooms/${roomId}/hostOnly`).on('value', (snap) => {
    hostOnly = snap.val();
  });

  db.ref('.info/serverTimeOffset').on('value', (snap) => {
    serverTimeOffset = snap.val() || 0;
  });

  db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    if (state.url && state.url !== window.location.href && !isEmbedUrl(state.url)) {
      showMovieRedirectBanner(state.url);
    }

    if (state.senderId === userId) return;

    if (isSyncing) {
      pendingState = state;
      return;
    }

    applyRemoteState(state);
  });

  db.ref(`rooms/${roomId}/messages`).limitToLast(50).off();
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    if (!msg || renderedMessageKeys.has(key)) return;
    renderedMessageKeys.add(key);

    appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });

    const msgAge = Date.now() - (msg.timestamp || 0);
    if (msgAge < 10000 && !msg.isSystem && msg.username !== username) {
      const isPanelActive = chatPanel && chatPanel.classList.contains('active');
      const isPanelHidden = chatPanel && chatPanel.style.opacity === '0';
      if (!isPanelActive || isPanelHidden) {
        showNotificationToast(msg.username, msg.message);
      }
    }
  });

  if (window === window.top) {
    db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
      const usersData = snapshot.val();
      const usersList = [];
      const bufferingUsers = [];

      if (usersData) {
        Object.values(usersData).forEach(u => {
          if (u.username) {
            usersList.push(u);
            if (u.isBuffering) bufferingUsers.push(u.username);
          }
        });
      }
      updateUsersDisplay(usersList);
    });
  }

  db.ref(`rooms/${roomId}/reactions`).limitToLast(5).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (data && data.emoji) {
      spawnFlyingEmoji(data.emoji);
    }
  });
}

function cleanupFirebase() {
  if (db && roomId) {
    try {
      db.ref(`rooms/${roomId}/lastState`).off();
      db.ref(`rooms/${roomId}/messages`).off();
      db.ref(`rooms/${roomId}/users`).off();
      db.ref(`rooms/${roomId}/reactions`).off();
    } catch (e) {
      console.error('[FilmSync] Firebase dinleyici temizleme hatası:', e);
    }
    renderedMessageKeys.clear();
  }
}

function leaveRoom() {
  if (db && roomId && userId) {
    if (window === window.top) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    db.ref(`rooms/${roomId}/users/${userId}`).remove().catch(err => console.error('[FilmSync] User remove hatası:', err));
    cleanupFirebase();
    removeChatUI();
  }
}

function applyRemoteState(state) {
  if (!state) return;
  
  if (state.url && state.url !== window.location.href && window === window.top) {
    showMovieRedirectBanner(state.url);
    return;
  }

  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) {
      releaseSyncLock();
      return;
    }

    setSyncLock(1000);
    try {
      const currentServerTime = Date.now() + serverTimeOffset;
      const timeDiff = state.isPlaying ? Math.max(0, (currentServerTime - state.lastUpdated) / 1000) : 0;
      const targetTime = state.currentTime + timeDiff;

      let neededChange = false;

      if (state.isPlaying && videoElement.paused) {
        PlayerAdapter.seek(targetTime);
        PlayerAdapter.play();
        neededChange = true;
      } else if (!state.isPlaying && !videoElement.paused) {
        PlayerAdapter.seek(state.currentTime);
        PlayerAdapter.pause();
        neededChange = true;
      } else if (Math.abs(videoElement.currentTime - targetTime) > 1.5) {
        PlayerAdapter.seek(targetTime);
        neededChange = true;
      }
      
      if (!neededChange) {
        releaseSyncLock();
        if (pendingState) {
          const nextState = pendingState;
          pendingState = null;
          applyRemoteState(nextState);
        }
        return;
      }
    } catch (e) {
      console.error('[FilmSync] Medya eşileme hatası:', e);
      releaseSyncLock();
    }
  });
}

function forceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    if (state.url && state.url !== window.location.href && window === window.top) {
      showMovieRedirectBanner(state.url);
      return;
    }

    ensureVideoReady((isReady) => {
      if (!isReady || !videoElement) {
        releaseSyncLock();
        return;
      }

      setSyncLock(1000);
      try {
        const currentServerTime = Date.now() + serverTimeOffset;
        const timeDiff = state.isPlaying ? Math.max(0, (currentServerTime - state.lastUpdated) / 1000) : 0;
        const targetTime = state.currentTime + timeDiff;

        PlayerAdapter.seek(targetTime);
        if (state.isPlaying) {
          PlayerAdapter.play();
        } else {
          PlayerAdapter.pause();
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
}

function sendMediaEvent(isPlaying, currentTime, isSeek = false) {
  if (!db || !roomId || isSyncing) return;
  isFirstSync = false;
  
  const activeVideo = document.querySelector('video');
  if (!activeVideo) return;

  if (activeVideo.readyState < 1 || isNaN(activeVideo.duration) || activeVideo.duration === 0) return;

  const now = Date.now();
  const isSameState = (lastSentMediaState.isPlaying === isPlaying);
  const timeDiff = Math.abs(lastSentMediaState.currentTime - currentTime);
  const elapsed = now - lastSentMediaState.timestamp;

  if (!isSeek && isSameState && timeDiff < 1.5 && elapsed < 2500) {
    return;
  }

  if (isSeek && elapsed < 300) {
    return;
  }

  lastSentMediaState = { isPlaying, currentTime, timestamp: now };
  lastSentServerTime = Date.now() + serverTimeOffset;

  const updatePayload = {
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  if (window === window.top && !isEmbedUrl(window.location.href)) {
    updatePayload.url = window.location.href;
  }

  db.ref(`rooms/${roomId}/lastState`).update(updatePayload).then(() => {
    const formattedTime = formatTime(currentTime);
    let msgText = '';
    
    if (isSeek) {
      msgText = `${username} filmi ${formattedTime} süresine sardı.`;
    } else {
      msgText = isPlaying 
        ? `${username} filmi başlattı. (Kaldığı yer: ${formattedTime})`
        : `${username} filmi duraklattı.`;
    }
    
    sendSystemMessage(msgText);
  }).catch(err => console.error('[FilmSync] Medya durum yazma hatası:', err));
}

function startVideoTracking() {
  if (window.filmsyncVideoTrackingInterval) clearInterval(window.filmsyncVideoTrackingInterval);
  window.filmsyncVideoTrackingInterval = setInterval(() => {
    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
      
      console.log('[FilmSync] Video tespit edildi. Eşitleme yapılıyor.');
      forceSync();

      if (!document.getElementById('filmsync-root') && window === window.top) {
        createChatUI();
        startUIKeeper();
      }
      
      if (window !== window.top) {
        initializeFirebase(firebaseConfig);
      }
    }
  }, 1000);
}

function startDriftCorrection() {
  if (window.filmsyncDriftInterval) clearInterval(window.filmsyncDriftInterval);
  window.filmsyncDriftInterval = setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing) return;
    if (videoElement.readyState < 3) return;

    db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
      const state = snapshot.val();
      if (!state) return;

      if (state.senderId === userId || (!state.senderId && userId === hostId)) {
        if (!videoElement.paused) {
          db.ref(`rooms/${roomId}/lastState`).transaction((currentState) => {
            if (currentState && (currentState.senderId === userId || (!currentState.senderId && userId === hostId))) {
              currentState.currentTime = videoElement.currentTime;
              currentState.isPlaying = true;
              currentState.lastUpdated = firebase.database.ServerValue.TIMESTAMP;
              return currentState;
            }
            return;
          });
        }
        return;
      }

      if (isSyncing) return;

      if (Date.now() - lastSentMediaState.timestamp < 3000) {
        return;
      }

      const currentServerTime = Date.now() + serverTimeOffset;
      const timeDiff = state.isPlaying ? Math.max(0, (currentServerTime - state.lastUpdated) / 1000) : 0;
      const expectedTime = state.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - expectedTime);

      const playStateMismatch = state.isPlaying !== !videoElement.paused;

      if (playStateMismatch || drift > 2.5) {
        console.log(`[FilmSync Auto-Sync] Sapma veya durum uyumsuzluğu düzeltiliyor. Sapma: ${drift.toFixed(1)}sn`);
        setSyncLock(1500);
        
        PlayerAdapter.seek(expectedTime);
        if (state.isPlaying && videoElement.paused) {
          PlayerAdapter.play();
        } else if (!state.isPlaying && !videoElement.paused) {
          PlayerAdapter.pause();
        }
      }
    });
  }, 4000);
}

function setupVideoListeners() {
  if (!videoElement) return;
  videoElement.addEventListener('play', handlePlayEvent);
  videoElement.addEventListener('pause', handlePauseEvent);
  videoElement.addEventListener('seeked', handleSeekEvent);
  videoElement.addEventListener('waiting', handleWaitingEvent);
  videoElement.addEventListener('playing', handlePlayingEvent);
}

function removeVideoListeners() {
  if (!videoElement) return;
  videoElement.removeEventListener('play', handlePlayEvent);
  videoElement.removeEventListener('pause', handlePauseEvent);
  videoElement.removeEventListener('seeked', handleSeekEvent);
  videoElement.removeEventListener('waiting', handleWaitingEvent);
  videoElement.removeEventListener('playing', handlePlayingEvent);
}

function handlePlayEvent(e) {
  if (isSyncing) return;
  isFirstSync = false;
  sendMediaEvent(true, videoElement.currentTime);
}

function handlePauseEvent(e) {
  if (isSyncing) return;
  isFirstSync = false;
  sendMediaEvent(false, videoElement.currentTime);
}

function handleSeekEvent(e) {
  if (isSyncing) return;
  isFirstSync = false;
  sendMediaEvent(!videoElement.paused, videoElement.currentTime, true);
}

function handleWaitingEvent() {
  if (!db || !roomId || !userId) return;
  db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: true });
}

function handlePlayingEvent() {
  if (!db || !roomId || !userId) return;
  db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: false });
}
