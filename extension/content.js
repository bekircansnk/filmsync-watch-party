// FilmSync Content Script - Gelişmiş Zaman Senkronizasyonu, Kararlı WebRTC Sesli Sohbet, Skip Intro & Host Lock Watch Party Motoru
let db = null;
let videoElement = null;
let isSyncing = false;
let roomId = null;
let username = null;
let password = null;
let userId = null;

// Gelişmiş Ayarlar
let skipIntroTime = 0;
let hostOnly = false;
let hostId = null;
let introSkipped = false;
let reactionsEnabled = true;

// UI Bileşenleri
let chatBubble = null;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;
let voiceBtn = null;

// WebRTC Sesli Sohbet Değişkenleri
let localStream = null;
let peerConnections = {};
const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
let isVoiceActive = false;

// Firebase Canlı Yapılandırması (Kullanıcının veritabanı)
const firebaseConfig = {
  apiKey: "AIzaSyBckyDBVxN6xFC5bBKkiyxNvww5seXRM1U",
  authDomain: "movieparty-af87f.firebaseapp.com",
  databaseURL: "https://movieparty-af87f-default-rtdb.firebaseio.com",
  projectId: "movieparty-af87f",
  storageBucket: "movieparty-af87f.firebasestorage.app",
  messagingSenderId: "563223702114",
  appId: "1:563223702114:web:00815dcbe7645d83b83f3b",
  measurementId: "G-4KR5X5Y4ZS"
};

// Sayfa yüklendiğinde başlat
init();

function init() {
  // GİTHUB DAVET LİNKİ KONTROLÜ (İsim Giriş Modal Destekli)
  if (window === window.top && window.location.href.includes('github.com/bekircansnk/filmsync-watch-party')) {
    const urlParams = new URLSearchParams(window.location.search);
    const joinRoom = urlParams.get('join');
    const joinPass = urlParams.get('pass') || '';

    if (joinRoom) {
      showNamePromptModal(joinRoom, (enteredName) => {
        showAutoJoinOverlay(joinRoom);
        const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ roomId: joinRoom, username: enteredName, password: joinPass, userId: newUserId }, () => {
          if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
          const tempDb = firebase.database();
          tempDb.ref(`rooms/${joinRoom}/lastState`).once('value').then((snapshot) => {
            const state = snapshot.val();
            if (state && state.url) {
              setTimeout(() => {
                chrome.runtime.sendMessage({ type: 'redirect-tab', url: state.url });
              }, 1000);
            } else {
              alert('Bu odada aktif bir film izlenmiyor veya oda bulunamadı.');
              document.getElementById('filmsync-autojoin-overlay')?.remove();
            }
          });
        });
      });
      return;
    }
  }

  // Normal Başlatma
  chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'skipIntroTime', 'reactionsEnabled'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      skipIntroTime = parseInt(result.skipIntroTime) || 0;
      introSkipped = false;
      reactionsEnabled = result.reactionsEnabled !== false;
      
      if (result.userId) {
        userId = result.userId;
      } else {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ userId });
      }
      
      console.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
      
      initializeFirebase(firebaseConfig);
      startVideoTracking();
      startDriftCorrection();
      setupFullscreenListener();
    } else {
      removeChatUI();
    }
  });
}

// Storage ve Popup Mesaj Dinleyicileri
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings-updated') {
    cleanupFirebase();
    removeChatUI();
    init();
    sendResponse({ status: 'success' });
  } else if (message.type === 'force-sync') {
    forceSync();
    sendResponse({ status: 'success' });
  }
});

// Firebase SDK Başlatma
function initializeFirebase(config) {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    db = firebase.database();
    
    const roomRef = db.ref(`rooms/${roomId}`);
    
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      
      if (roomData) {
        if (roomData.password && roomData.password !== password) {
          alert('[FilmSync Hata] Hatalı oda şifresi!');
          removeChatUI();
          cleanupFirebase();
          return;
        }
      } else {
        if (window === window.top) {
          roomRef.set({
            password: password,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: window.location.href,
              hostOnly: false,
              hostId: null,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
        }
      }
      
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP });
      userRef.onDisconnect().remove();
      
      if (window === window.top) {
        sendSystemMessage(`${username} odaya katıldı.`);
        db.ref(`rooms/${roomId}/lastState/url`).set(window.location.href);
      }
      
      setupFirebaseListeners();
    }).catch(err => {
      console.error('[FilmSync] Firebase bağlantı hatası:', err);
    });

  } catch (err) {
    console.error('[FilmSync] Firebase başlatılamadı:', err);
  }
}

// Firebase Olay Dinleyicileri
function setupFirebaseListeners() {
  if (!db) return;

  // 1. Medya Durumunu Dinle
  db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state || !videoElement || isSyncing) return;

    // Oda Kilitleme ve Kurucu Bilgisini güncelle
    hostOnly = state.hostOnly || false;
    hostId = state.hostId || null;

    if (state.senderId === userId) return;

    // Yönlendirme kilidi bildirimi
    if (state.url && state.url !== window.location.href && window === window.top) {
      showMovieRedirectNotification(state.url);
      return;
    }

    const timeDiff = (Date.now() - state.lastUpdated) / 1000;
    isSyncing = true;
    try {
      if (state.isPlaying && videoElement.paused) {
        videoElement.currentTime = state.currentTime + (timeDiff > 0 ? timeDiff : 0);
        videoElement.play().catch(e => console.log('Oynatma etkileşim bekliyor.', e));
      } else if (!state.isPlaying && !videoElement.paused) {
        videoElement.currentTime = state.currentTime;
        videoElement.pause();
      } else if (Math.abs(videoElement.currentTime - state.currentTime) > 2) {
        videoElement.currentTime = state.currentTime;
      }
    } catch (e) {
      console.error('[FilmSync] Medya eşitleme hatası:', e);
    }
    setTimeout(() => { isSyncing = false; }, 300);
  });

  // 2. Sohbet Mesajlarını Dinle
  if (window === window.top) {
    let isHistoryLoaded = false;
    db.ref(`rooms/${roomId}/messages`).limitToLast(1).once('value').then(() => {
      isHistoryLoaded = true;
    });

    db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        appendMessage(msg);
        
        if (isHistoryLoaded && !msg.isSystem && msg.username !== username && window === window.top) {
          const isPanelActive = chatPanel && chatPanel.classList.contains('active');
          if (!isPanelActive) {
            showNotificationToast(msg.username, msg.message);
          }
        }
      }
    });
  }

  // 3. Aktif Kullanıcıları Dinle
  if (window === window.top) {
    db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
      const usersData = snapshot.val();
      const activeUsers = [];
      if (usersData) {
        Object.values(usersData).forEach(u => {
          if (u.username) activeUsers.push(u.username);
        });
      }
      updateUsersDisplay(activeUsers);
    });
  }

  // 4. WebRTC Sinyalleşme Dinleyicisi
  if (window === window.top) {
    setupVoiceSignaling();
  }

  // 5. Eğlenceli Reaksiyonları Dinle (Canlı Animasyonlar)
  if (window === window.top) {
    db.ref(`rooms/${roomId}/reactions`).limitToLast(10).on('child_added', (snapshot) => {
      const reaction = snapshot.val();
      if (!reaction || !reactionsEnabled) return;
      
      // Çok eski reaksiyonları canlandırma (son 5 saniye)
      if (Date.now() - reaction.timestamp > 5000) return;

      playReactionAnim(reaction);
    });
  }
}

// Zorla Senkronize Et
function forceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    const video = document.querySelector('video');
    if (video) videoElement = video;

    if (videoElement) {
      isSyncing = true;
      try {
        videoElement.currentTime = state.currentTime;
        if (state.isPlaying) {
          videoElement.play().catch(e => console.log('Oynatma engellendi.', e));
        } else {
          videoElement.pause();
        }
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => { isSyncing = false; }, 300);
    }
  });
}

// Bağlantı ve Dinleyicileri Temizleme + Boş Oda Silme
function cleanupFirebase() {
  if (db && roomId && userId) {
    if (window === window.top) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    stopVoiceCall();

    db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
      db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
        const users = snapshot.val();
        if (!users || Object.keys(users).length === 0) {
          console.log(`[FilmSync] Odada kimse kalmadı. "${roomId}" odası siliniyor.`);
          db.ref(`rooms/${roomId}`).remove();
        }
      });
    });

    db.ref(`rooms/${roomId}/lastState`).off();
    if (window === window.top) {
      db.ref(`rooms/${roomId}/messages`).off();
      db.ref(`rooms/${roomId}/users`).off();
      db.ref(`rooms/${roomId}/calls`).off();
    }
  }
}

// Medya Olayını Gönderme
function sendMediaEvent(isPlaying, currentTime) {
  if (!db || !roomId || isSyncing) return;
  db.ref(`rooms/${roomId}/lastState`).update({
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  });
}

// --- ⚙️ KESİNTİSİZ VİDEO TAKİP VE SADECE VİDEOLU SAYFALARDA UI MOTORU ---
function startVideoTracking() {
  setInterval(() => {
    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
      
      console.log('[FilmSync] Video tespit edildi. İlk otomatik eşitleme çalıştırılıyor.');
      forceSync();

      // Sadece videolu sayfada arayüz oluştur
      if (window === window.top && !document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
      }
    }
    
    // SKIP INTRO (Jeneriği Atlatma Logic'i)
    if (videoElement && skipIntroTime > 0 && !introSkipped && videoElement.currentTime < skipIntroTime) {
      videoElement.currentTime = skipIntroTime;
      introSkipped = true;
      showNotificationToast('FilmSync', 'Jenerik otomatik atlatıldı! ⏩');
    }
  }, 1000);
}

// Zaman Kayması Kontrol Motoru (Drift Correction)
function startDriftCorrection() {
  setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing || videoElement.paused) return;
    
    db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
      const state = snapshot.val();
      if (!state || state.senderId === userId || !state.isPlaying) return;

      const timeDiff = (Date.now() - state.lastUpdated) / 1000;
      const expectedTime = state.currentTime + (timeDiff > 0 ? timeDiff : 0);
      const localTime = videoElement.currentTime;

      if (Math.abs(localTime - expectedTime) > 2) {
        console.log(`[FilmSync] Zaman sapması tespit edildi (${Math.abs(localTime - expectedTime)}sn). Otomatik eşitleniyor.`);
        isSyncing = true;
        videoElement.currentTime = expectedTime;
        setTimeout(() => { isSyncing = false; }, 300);
      }
    });
  }, 3000);
}

function setupVideoListeners() {
  if (!videoElement) return;
  videoElement.addEventListener('play', handlePlayEvent);
  videoElement.addEventListener('pause', handlePauseEvent);
  videoElement.addEventListener('seeked', handleSeekEvent);
}

function removeVideoListeners() {
  if (!videoElement) return;
  videoElement.removeEventListener('play', handlePlayEvent);
  videoElement.removeEventListener('pause', handlePauseEvent);
  videoElement.removeEventListener('seeked', handleSeekEvent);
}

// Olay tetikleyicileri (Host Lock Kilidi Kontrolü Eklendi!)
function handlePlayEvent() {
  if (isSyncing) return;
  
  if (hostOnly && hostId !== userId) {
    // Oda kilitli ve biz host değiliz, işlemi engelle ve host süresine geri dön!
    console.log('[FilmSync] Oda kilitli, oynatma isteği engellendi.');
    videoElement.pause();
    forceSync();
    showNotificationToast('Sistem', 'Bu oda kilitli, sadece kurucu kontrol edebilir. 🔒');
    return;
  }
  
  sendMediaEvent(true, videoElement.currentTime);
}

function handlePauseEvent() {
  if (isSyncing) return;
  
  if (hostOnly && hostId !== userId) {
    console.log('[FilmSync] Oda kilitli, durdurma isteği engellendi.');
    videoElement.play().catch(e => console.log(e));
    forceSync();
    showNotificationToast('Sistem', 'Bu oda kilitli, sadece kurucu kontrol edebilir. 🔒');
    return;
  }
  
  sendMediaEvent(false, videoElement.currentTime);
}

function handleSeekEvent() {
  if (isSyncing) return;
  
  if (hostOnly && hostId !== userId) {
    console.log('[FilmSync] Oda kilitli, süre sarma isteği engellendi.');
    forceSync();
    showNotificationToast('Sistem', 'Bu oda kilitli, sadece kurucu kontrol edebilir. 🔒');
    return;
  }
  
  sendMediaEvent(!videoElement.paused, videoElement.currentTime);
}


// --- 📞 WEBRTC SESLİ SOHBET MOTORU (Sıfır Gürültü ve Yankı Engelleme) ---

function setupVoiceSignaling() {
  if (!db) return;

  // Odadaki yeni aramaları dinle
  db.ref(`rooms/${roomId}/calls`).on('child_added', (snapshot) => {
    const callerId = snapshot.key;
    const callData = snapshot.val();

    if (callerId === userId || !isVoiceActive) return;

    if (callData.offer) {
      console.log(`[FilmSync WebRTC] ${callerId} kullanıcısından gelen arama kabul ediliyor.`);
      handleIncomingCall(callerId, callData.offer);
    }
  });

  // SDP Yanıtlarını ve ICE Adaylarını dinle
  db.ref(`rooms/${roomId}/calls`).on('child_changed', (snapshot) => {
    const peerId = snapshot.key;
    const callData = snapshot.val();

    if (peerId === userId || !peerConnections[peerId]) return;

    if (callData.answer && !peerConnections[peerId].currentRemoteDescription) {
      console.log(`[FilmSync WebRTC] ${peerId} kullanıcısından SDP Yanıtı (Answer) alındı, setRemoteDescription yapılıyor.`);
      const desc = new RTCSessionDescription(callData.answer);
      peerConnections[peerId].setRemoteDescription(desc).catch(e => console.log(e));
    }

    if (callData.iceCandidates) {
      Object.values(callData.iceCandidates).forEach(candidate => {
        peerConnections[peerId].addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.log(e));
      });
    }
  });
}

function toggleVoiceCall() {
  if (isVoiceActive) {
    stopVoiceCall();
  } else {
    startVoiceCall();
  }
}

function startVoiceCall() {
  // Gürültü bastırma ve yankı giderme filtreleriyle mikrofonu başlat
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  };

  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    localStream = stream;
    isVoiceActive = true;
    voiceBtn.textContent = '🎙️ Mikrofonu Kapat';
    voiceBtn.style.background = 'linear-gradient(135deg, #ff4757, #ff6b81)';
    voiceBtn.style.color = '#fff';
    
    sendSystemMessage(`${username} sesli sohbete katıldı.`);
    showNotificationToast('Sesli Sohbet', 'Bağlantı kuruluyor. Yankıyı önlemek için kulaklık kullanmanız önerilir! 🎧');

    // Diğer odadaki aktif çağrıları temizle ve sıfırdan bağlantı kur
    db.ref(`rooms/${roomId}/calls/${userId}`).remove().then(() => {
      db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
        const users = snapshot.val();
        if (!users) return;

        Object.keys(users).forEach(targetUserId => {
          if (targetUserId === userId) return;
          createPeerConnection(targetUserId, true);
        });
      });
    });

  }).catch((err) => {
    console.error('[FilmSync] Mikrofon erişim hatası:', err);
    alert('Mikrofon erişimi engellendi. Konuşabilmek için adres satırındaki kilit ikonuna tıklayıp mikrofona izin verin!');
    isVoiceActive = false;
  });
}

function stopVoiceCall() {
  isVoiceActive = false;
  if (voiceBtn) {
    voiceBtn.textContent = '🎙️ Mikrofonu Aç';
    voiceBtn.style.background = 'rgba(255, 255, 255, 0.05)';
    voiceBtn.style.color = '#fff';
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  Object.keys(peerConnections).forEach(peerId => {
    peerConnections[peerId].close();
    delete peerConnections[peerId];
  });

  if (db && roomId && userId) {
    db.ref(`rooms/${roomId}/calls/${userId}`).remove();
  }
}

function createPeerConnection(targetUserId, isInitiator) {
  const pc = new RTCPeerConnection(rtcConfig);
  peerConnections[targetUserId] = pc;

  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  pc.ontrack = (event) => {
    let remoteAudio = document.getElementById(`audio_${targetUserId}`);
    if (!remoteAudio) {
      remoteAudio = document.createElement('audio');
      remoteAudio.id = `audio_${targetUserId}`;
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);
    }
    remoteAudio.srcObject = event.streams[0];
  };

  pc.onicecandidate = (event) => {
    if (event.candidate && db) {
      db.ref(`rooms/${roomId}/calls/${userId}/iceCandidates`).push(event.candidate.toJSON());
    }
  };

  if (isInitiator) {
    pc.createOffer().then((offer) => {
      return pc.setLocalDescription(offer);
    }).then(() => {
      if (db) {
        db.ref(`rooms/${roomId}/calls/${userId}/offer`).set(pc.localDescription.toJSON());
      }
    });
  }

  return pc;
}

function handleIncomingCall(callerId, offer) {
  const pc = createPeerConnection(callerId, false);
  const desc = new RTCSessionDescription(offer);
  pc.setRemoteDescription(desc).then(() => {
    return pc.createAnswer();
  }).then((answer) => {
    return pc.setLocalDescription(answer);
  }).then(() => {
    if (db) {
      db.ref(`rooms/${roomId}/calls/${callerId}/answer`).set(pc.localDescription.toJSON());
    }
  });
}


// --- 🎨 EN YENİ SOHBET PANELİ VE BALONCUK ARAYÜZÜ ---

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  if (!document.querySelector('video')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.setAttribute('style', 'position: fixed !important; z-index: 2147483647 !important; bottom: 0; right: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  const style = document.createElement('style');
  style.textContent = `
    #filmsync-chat-bubble {
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #45f3ff, #66fcf1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(69, 243, 255, 0.4);
      z-index: 2147483647 !important;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #filmsync-chat-bubble:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow: 0 12px 30px rgba(69, 243, 255, 0.6);
    }
    #filmsync-chat-bubble svg {
      width: 24px;
      height: 24px;
      fill: #0b0c10;
    }

    #filmsync-chat-panel {
      position: fixed !important;
      top: 0 !important;
      right: -330px !important;
      width: 320px;
      height: 100vh;
      background: rgba(11, 12, 16, 0.92);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2147483646 !important;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
    }
    #filmsync-chat-panel.active {
      right: 0 !important;
    }

    .filmsync-header {
      padding: 18px 15px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .filmsync-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filmsync-header-title {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
    }
    .filmsync-header-title span {
      color: #45f3ff;
    }
    .filmsync-close-btn {
      background: transparent;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 1.3rem;
      line-height: 1;
    }
    .filmsync-close-btn:hover {
      color: #ff4757;
    }

    .filmsync-voice-btn {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 5px;
      transition: all 0.3s ease;
    }
    .filmsync-voice-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .filmsync-users {
      font-size: 0.75rem;
      color: #66fcf1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    #filmsync-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filmsync-msg-row {
      display: flex;
      flex-direction: column;
      max-width: 85%;
    }
    .filmsync-msg-row.self { align-self: flex-end; }
    .filmsync-msg-row.other { align-self: flex-start; }
    .filmsync-msg-row.system { align-self: center; max-width: 90%; }

    .filmsync-msg-sender {
      font-size: 0.7rem;
      color: #888;
      margin-bottom: 2px;
      margin-left: 4px;
    }
    .filmsync-msg-row.self .filmsync-msg-sender {
      text-align: right;
      margin-right: 4px;
    }

    .filmsync-msg-bubble {
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.35;
      word-break: break-word;
    }
    .filmsync-msg-row.self .filmsync-msg-bubble {
      background: rgba(69, 243, 255, 0.15);
      border: 1px solid rgba(69, 243, 255, 0.25);
      color: #fff;
      border-bottom-right-radius: 2px;
    }
    .filmsync-msg-row.other .filmsync-msg-bubble {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #fff;
      border-bottom-left-radius: 2px;
    }
    .filmsync-msg-row.system .filmsync-msg-bubble {
      background: transparent;
      border: none;
      color: #ffb86c;
      font-size: 0.75rem;
      text-align: center;
      font-style: italic;
    }

    .filmsync-input-area {
      padding: 12px 15px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 10px;
    }
    .filmsync-input-area input {
      flex: 1;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }
    .filmsync-input-area input:focus {
      outline: none;
      border-color: #45f3ff;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 10px rgba(69, 243, 255, 0.15);
    }
    .filmsync-send-btn {
      padding: 10px 16px;
      background: linear-gradient(135deg, #45f3ff, #66fcf1);
      border: none;
      border-radius: 8px;
      color: #0b0c10;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    .filmsync-toast {
      position: fixed !important;
      top: 20px !important;
      right: -320px !important;
      width: 280px;
      background: rgba(31, 40, 51, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 12px 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2147483647 !important;
      cursor: pointer;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .filmsync-toast.active { right: 20px !important; }
    .filmsync-toast-header {
      font-size: 0.75rem;
      font-weight: 700;
      color: #45f3ff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filmsync-toast-body {
      font-size: 0.85rem;
      color: #fff;
    }

    /* REAKSİYON ANİMASYONLARI */
    @keyframes filmsyncFloatUp {
      0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
      50% { transform: translateY(-150px) scale(1.3) rotate(15deg); opacity: 0.9; }
      100% { transform: translateY(-300px) scale(0.8) rotate(-15deg); opacity: 0; }
    }
    @keyframes filmsyncClickBurst {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
      50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
    }
    .filmsync-reaction-float {
      position: fixed;
      bottom: 80px;
      font-size: 2.2rem;
      pointer-events: none;
      z-index: 2147483647 !important;
      animation: filmsyncFloatUp 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .filmsync-reaction-click {
      position: fixed;
      font-size: 2.5rem;
      pointer-events: none;
      z-index: 2147483647 !important;
      animation: filmsyncClickBurst 1s ease-out forwards;
    }
    .filmsync-reaction-bar {
      display: flex;
      gap: 12px;
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      justify-content: center;
    }
    .filmsync-reaction-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .filmsync-reaction-btn:hover {
      transform: scale(1.2) translateY(-2px);
      background: rgba(69, 243, 255, 0.2);
      border-color: rgba(69, 243, 255, 0.4);
    }
  `;

  root.innerHTML = `
    <div id="filmsync-chat-bubble" title="Sohbeti Aç">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
      </svg>
    </div>
    
    <div id="filmsync-chat-panel">
      <div class="filmsync-header">
        <div class="filmsync-header-top">
          <div class="filmsync-header-title">FilmSync <span>Party</span> 🍿</div>
          <button class="filmsync-close-btn" id="filmsyncCloseBtn">×</button>
        </div>
        <div class="filmsync-users" id="filmsyncUserList">Üyeler yükleniyor...</div>
        <button class="filmsync-voice-btn" id="filmsyncVoiceBtn">🎙️ Mikrofonu Aç</button>
      </div>
      <div id="filmsync-messages"></div>
      <div class="filmsync-reaction-bar" id="filmsyncReactionBar">
        <button class="filmsync-reaction-btn" data-emoji="❤️">❤️</button>
        <button class="filmsync-reaction-btn" data-emoji="😂">😂</button>
        <button class="filmsync-reaction-btn" data-emoji="🍿">🍿</button>
        <button class="filmsync-reaction-btn" data-emoji="😱">😱</button>
        <button class="filmsync-reaction-btn" data-emoji="🥺">🥺</button>
      </div>
      <div class="filmsync-input-area">
        <input type="text" id="filmsyncMsgInput" placeholder="Mesaj yazın..." autocomplete="off">
        <button class="filmsync-send-btn" id="filmsyncSendBtn">Gönder</button>
      </div>
    </div>
  `;

  document.body.appendChild(root);
  document.head.appendChild(style);

  chatBubble = document.getElementById('filmsync-chat-bubble');
  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  messageList = document.getElementById('filmsync-messages');
  userListDisplay = document.getElementById('filmsyncUserList');
  voiceBtn = document.getElementById('filmsyncVoiceBtn');

  chatBubble.addEventListener('click', toggleChatPanel);
  document.getElementById('filmsyncCloseBtn').addEventListener('click', () => {
    toggleChatPanel();
  });

  voiceBtn.addEventListener('click', toggleVoiceCall);
  document.getElementById('filmsyncSendBtn').addEventListener('click', sendChatMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
      e.stopPropagation();
    }
  });

  document.addEventListener('keydown', handleGlobalEnterKey);

  // Eğlenceli Reaksiyon Buton Dinleyicileri
  document.querySelectorAll('.filmsync-reaction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const emoji = e.currentTarget.getAttribute('data-emoji') || '❤️';
      sendReaction('float', emoji);
    });
  });

  // Global Ekrana Tıklama Efekti (Reactions açıksa)
  document.addEventListener('click', handleGlobalClickForReaction);
}

function startUIKeeper() {
  setInterval(() => {
    if (roomId && document.querySelector('video') && !document.getElementById('filmsync-root')) {
      console.log('[FilmSync UI Keeper] Arayüz yenileniyor.');
      createChatUI();
    }
  }, 2000);
}

function removeChatUI() {
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  document.removeEventListener('keydown', handleGlobalEnterKey);
  stopVoiceCall();
}

function toggleChatPanel() {
  if (!chatPanel || !chatBubble) return;

  chatPanel.classList.toggle('active');
  
  if (chatPanel.classList.contains('active')) {
    chatBubble.style.display = 'none'; // SOHBET PANELİ AÇILDIĞINDA YUVARLAK BUTONU GİZLE!
    messageInput.focus();
    messageList.scrollTop = messageList.scrollHeight;
  } else {
    chatBubble.style.display = 'flex'; // SOHBET PANELİ KAPANDIĞINDA YUVARLAK BUTONU TEKRAR GÖSTER!
  }
}

function handleGlobalEnterKey(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;

  if (isInput) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    if (!chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }
    return;
  }

  const isAlphanumeric = e.key.length === 1 && /[a-zA-Z0-9İıŞşĞğÇçÖöÜü\s]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (isAlphanumeric) {
    if (!chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }
    setTimeout(() => {
      messageInput.value = e.key;
    }, 10);
  }
}

function sendChatMessage() {
  const text = messageInput.value.trim();
  if (!text || !db) return;

  db.ref(`rooms/${roomId}/messages`).push({
    username,
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
  messageInput.value = '';
}

function sendSystemMessage(text) {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/messages`).push({
    username: 'Sistem',
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    isSystem: true
  });
}

function appendMessage({ username: msgUser, message, isSystem }) {
  if (!messageList) return;

  const lastMsg = messageList.lastElementChild;
  if (lastMsg && lastMsg.querySelector('.filmsync-msg-bubble')?.textContent === message && 
      lastMsg.querySelector('.filmsync-msg-sender')?.textContent === msgUser) {
    return;
  }

  const row = document.createElement('div');
  row.classList.add('filmsync-msg-row');

  if (isSystem) {
    row.classList.add('system');
    row.innerHTML = `<div class="filmsync-msg-bubble">${message}</div>`;
  } else {
    const isSelf = msgUser === username;
    row.classList.add(isSelf ? 'self' : 'other');
    row.innerHTML = `
      <div class="filmsync-msg-sender">${msgUser}</div>
      <div class="filmsync-msg-bubble">${message}</div>
    `;
  }

  messageList.appendChild(row);
  messageList.scrollTop = messageList.scrollHeight;
}

function updateUsersDisplay(users) {
  if (!userListDisplay) return;
  const formattedUsers = users.join(', ');
  userListDisplay.textContent = `Aktif (${users.length}): ${formattedUsers}`;
}

// --- ✨ EĞLENCE MOTORU (REACTIONS & CLICKS) ---
function handleGlobalClickForReaction(e) {
  if (!reactionsEnabled) return;
  
  // UI paneline, butonlara veya baloncuğa tıklandıysa yoksay
  if (e.target.closest('#filmsync-root') || e.target.closest('.filmsync-toast') || e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT') {
    return;
  }

  // Yüzde hesabı (farklı çözünürlüklerde aynı yerde çıkması için)
  const xRatio = (e.clientX / window.innerWidth).toFixed(3);
  const yRatio = (e.clientY / window.innerHeight).toFixed(3);

  sendReaction('click', '❤️', parseFloat(xRatio), parseFloat(yRatio));
}

function sendReaction(type, emoji, x = 0, y = 0) {
  if (!db || !roomId || !reactionsEnabled) return;
  db.ref(`rooms/${roomId}/reactions`).push({
    type,
    emoji,
    x,
    y,
    senderId: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

function playReactionAnim(reaction) {
  let root = document.getElementById('filmsync-root');
  
  // Tam ekran sorununu aşmak için, root bulunamazsa veya görünmezse body'ye bas.
  const container = root ? root : document.body;

  const el = document.createElement('div');
  el.textContent = reaction.emoji;

  if (reaction.type === 'float') {
    el.classList.add('filmsync-reaction-float');
    // Uçan reaksiyonlara hafif rastgele yatay kayma (random left/right position)
    const randomOffset = Math.floor(Math.random() * 60) - 30; // -30px to +30px
    el.style.right = (350 + randomOffset) + 'px'; // Panel genişliği + offset
    container.appendChild(el);
  } else if (reaction.type === 'click') {
    el.classList.add('filmsync-reaction-click');
    el.style.left = (reaction.x * window.innerWidth) + 'px';
    el.style.top = (reaction.y * window.innerHeight) + 'px';
    container.appendChild(el);
  }

  // Animasyon bitince elementi temizle
  setTimeout(() => {
    el.remove();
  }, 2600);
}

// --- 🔔 APPLE TARZI BİLDİRİM TOAST MOTORU ---
function showNotificationToast(sender, text) {
  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  toast.innerHTML = `
    <div class="filmsync-toast-header">${sender}</div>
    <div class="filmsync-toast-body">${text.length > 45 ? text.substring(0, 42) + '...' : text}</div>
  `;

  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
    toggleChatPanel();
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }
  }, 4000);
}

// --- 🎬 YÖNLENDİRME BİLDİRİM TOASTI ---
function showMovieRedirectNotification(targetUrl) {
  if (document.getElementById('filmsync-redirect-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'filmsync-redirect-toast';
  toast.classList.add('filmsync-toast');
  toast.style.background = 'rgba(69, 243, 255, 0.2)';
  toast.style.borderColor = '#45f3ff';
  
  toast.innerHTML = `
    <div class="filmsync-toast-header">Yeni Film Akışı 🎬</div>
    <div class="filmsync-toast-body" style="color: #45f3ff; font-weight: bold; cursor: pointer;">
      Oda sahibi yeni bir film açtı. Gitmek için tıklayın!
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
    chrome.runtime.sendMessage({ type: 'redirect-tab', url: targetUrl });
  });
}

// --- 📺 TAM EKRAN DESTEĞİ ---
function setupFullscreenListener() {
  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  events.forEach(eventName => {
    document.addEventListener(eventName, () => {
      const root = document.getElementById('filmsync-root');
      const fsElement = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

      if (fsElement && root) {
        fsElement.appendChild(root);
        console.log('[FilmSync] Sohbet kutusu tam ekran elementinin altına taşındı.');
      } else if (root) {
        document.body.appendChild(root);
      }
    });
  });
}

// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---
function showAutoJoinOverlay(roomName) {
  const overlay = document.createElement('div');
  overlay.id = 'filmsync-autojoin-overlay';
  overlay.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 12, 16, 0.9); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2147483647 !important; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  overlay.innerHTML = `
    <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 10px;">FilmSync 🍿</div>
    <div style="font-size: 1.2rem; color: #45f3ff; font-weight: 600; margin-bottom: 20px;">
      "${roomName}" Odasına Katılınıyor...
    </div>
    <div style="width: 40px; height: 40px; border: 4px solid rgba(69, 243, 255, 0.1); border-top-color: #45f3ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  document.body.appendChild(overlay);
}

// --- 🏷️ İSİM PROMPT MODALI ---
function showNamePromptModal(roomName, callback) {
  if (document.getElementById('filmsync-name-prompt-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'filmsync-name-prompt-modal';
  modal.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 12, 16, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  modal.innerHTML = `
    <div style="width: 320px; background: rgba(31, 40, 51, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); text-align: center; color: #fff;">
      <div style="font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; color: #fff;">FilmSync <span>Party</span> 🍿</div>
      <div style="font-size: 0.85rem; color: #66fcf1; margin-bottom: 20px;">"${roomName}" odasına katılacaksınız.</div>
      
      <div style="text-align: left; margin-bottom: 15px;">
        <label style="font-size: 0.75rem; text-transform: uppercase; color: #45f3ff; font-weight: 600; display: block; margin-bottom: 5px;">Adınız</label>
        <input type="text" id="promptNameInput" placeholder="Kullanıcı adınızı yazın" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.85rem; outline: none; transition: border 0.3s;" />
      </div>
      
      <button id="promptJoinBtn" style="width: 100%; padding: 11px; border: none; border-radius: 8px; background: linear-gradient(135deg, #45f3ff, #66fcf1); color: #0b0c10; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;">Odaya Katıl</button>
    </div>
  `;

  document.body.appendChild(modal);

  const nameInput = document.getElementById('promptNameInput');
  const joinBtn = document.getElementById('promptJoinBtn');

  nameInput.focus();

  const handleJoin = () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('Lütfen bir isim girin!');
      return;
    }
    modal.remove();
    callback(name);
  };

  joinBtn.addEventListener('click', handleJoin);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  });
}
