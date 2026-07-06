// FilmSync Content Script - WebRTC Sesli Sohbet, Apple Toast Bildirimleri & Akıllı Yönlendirmeli Watch Party Motoru
let db = null;
let videoElement = null;
let isSyncing = false;
let roomId = null;
let username = null;
let password = null;
let userId = null;

// UI Bileşenleri
let chatBubble = null;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;
let voiceBtn = null;

// WebRTC Sesli Sohbet Değişkenleri
let localStream = null;
let peerConnections = {}; // Her kullanıcı için ayrı RTCPeerConnection nesnesi
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
  // GİTHUB DAVET LİNKİ KONTROLÜ (Auto-Join)
  if (window === window.top && window.location.href.includes('github.com/bekircansnk/filmsync-watch-party')) {
    const urlParams = new URLSearchParams(window.location.search);
    const joinRoom = urlParams.get('join');
    const joinPass = urlParams.get('pass') || '';

    if (joinRoom) {
      showAutoJoinOverlay(joinRoom);
      chrome.storage.local.set({ roomId: joinRoom, username: 'Misafir_' + Math.random().toString(36).substr(2, 4), password: joinPass }, () => {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const tempDb = firebase.database();
        tempDb.ref(`rooms/${joinRoom}/lastState`).once('value').then((snapshot) => {
          const state = snapshot.val();
          if (state && state.url) {
            setTimeout(() => {
              chrome.runtime.sendMessage({ type: 'redirect-tab', url: state.url });
            }, 1500);
          } else {
            alert('Bu odada aktif bir film izlenmiyor veya oda bulunamadı.');
            document.getElementById('filmsync-autojoin-overlay')?.remove();
          }
        });
      });
      return;
    }
  }

  // Normal Başlatma
  chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      
      console.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
      
      if (window === window.top) {
        createChatUI();
      }
      
      initializeFirebase(firebaseConfig);
      startVideoTracking();
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
        // Oda yoksa oluştur (Sadece top frame)
        if (window === window.top) {
          roomRef.set({
            password: password,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: window.location.href,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
        }
      }
      
      // Kullanıcıyı aktif listeye ekle ve bağlantı kesilince sil (onDisconnect)
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP });
      userRef.onDisconnect().remove();
      
      if (window === window.top) {
        sendSystemMessage(`${username} odaya katıldı.`);
        // Oda sahibi olarak güncel URL'imizi güncelle (Sadece top frame!)
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

    if (state.senderId === userId) return;

    // AKILLI YÖNLENDİRME KİLİDİ: Oda sahibi film değiştirdiğinde otomatik yönlendirme yerine bildirim göster!
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

  // 2. Sohbet Mesajlarını Dinle (Apple Bildirim Toast Desteği)
  if (window === window.top) {
    let initialLoad = true;
    
    // Mesaj dinleyiciyi ilk kez kurarken eski mesajları alma
    db.ref(`rooms/${roomId}/messages`).limitToLast(1).once('value').then(() => {
      initialLoad = false;
    });

    db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        appendMessage(msg);
        
        // Eğer sistem mesajı değilse ve mesaj bize ait değilse ve panel kapalıysa bildirim toast göster!
        if (!initialLoad && !msg.isSystem && msg.username !== username && window === window.top) {
          const isPanelActive = chatPanel.classList.contains('active');
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

  // 4. WebRTC Sinyalleşme Kanallarını Dinle (Sesli Sohbet İçin)
  if (window === window.top) {
    setupVoiceSignaling();
  }
}

// Bağlantı ve Dinleyicileri Temizleme + Odada Kimse Kalmadıysa Odayı Silme
function cleanupFirebase() {
  if (db && roomId && userId) {
    if (window === window.top) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    // Sesli aramayı kapat
    stopVoiceCall();

    // Önce kendimizi sil
    db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
      // Odada başka üye var mı kontrol et, yoksa odayı tamamen yok et!
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

// Zorla Senkronize Et (Yenileme)
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

// --- ⚙️ VİDEO TAKİP MOTORU ---
function startVideoTracking() {
  setInterval(() => {
    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
    }
  }, 1000);
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

function handlePlayEvent() { if (!isSyncing) sendMediaEvent(true, videoElement.currentTime); }
function handlePauseEvent() { if (!isSyncing) sendMediaEvent(false, videoElement.currentTime); }
function handleSeekEvent() { if (!isSyncing) sendMediaEvent(!videoElement.paused, videoElement.currentTime); }


// --- 📞 WEBRTC SESLİ SOHBET MOTORU (Firebase Sinyalleşmeli) ---

function setupVoiceSignaling() {
  if (!db) return;

  // Odadaki yeni aramaları dinle
  db.ref(`rooms/${roomId}/calls`).on('child_added', (snapshot) => {
    const callerId = snapshot.key;
    const callData = snapshot.val();

    if (callerId === userId || !isVoiceActive) return; // Kendi çağrımız veya mikrofonumuz kapalıysa yoksay

    // Gelen WebRTC Offer (Teklif) verisini işle
    if (callData.offer) {
      handleIncomingCall(callerId, callData.offer);
    }
  });

  // ICE Adaylarını Dinle
  db.ref(`rooms/${roomId}/calls`).on('child_changed', (snapshot) => {
    const peerId = snapshot.key;
    const callData = snapshot.val();

    if (peerId === userId || !peerConnections[peerId]) return;

    if (callData.answer && !peerConnections[peerId].currentRemoteDescription) {
      const desc = new RTCSessionDescription(callData.answer);
      peerConnections[peerId].setRemoteDescription(desc);
    }

    if (callData.iceCandidates) {
      Object.values(callData.iceCandidates).forEach(candidate => {
        peerConnections[peerId].addIceCandidate(new RTCIceCandidate(candidate));
      });
    }
  });
}

// Mikrofonu Aç/Kapat Buton Logic'i
function toggleVoiceCall() {
  if (isVoiceActive) {
    stopVoiceCall();
  } else {
    startVoiceCall();
  }
}

// Sesli Aramayı Başlat
function startVoiceCall() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    localStream = stream;
    isVoiceActive = true;
    voiceBtn.textContent = '🎙️ Mikrofonu Kapat';
    voiceBtn.style.background = 'linear-gradient(135deg, #ff4757, #ff6b81)';
    voiceBtn.style.color = '#fff';
    
    sendSystemMessage(`${username} sesli sohbete katıldı.`);

    // Odanın mevcut üyelerine bağlanmak için WebRTC Offer oluştur
    db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
      const users = snapshot.val();
      if (!users) return;

      Object.keys(users).forEach(targetUserId => {
        if (targetUserId === userId) return;
        createPeerConnection(targetUserId, true); // Bağlantıyı kur ve arayan (initiator) ol
      });
    });

  }).catch((err) => {
    console.error('[FilmSync] Mikrofon erişim hatası:', err);
    alert('Mikrofona erişilemedi. Lütfen tarayıcı izinlerini kontrol edin!');
  });
}

// Sesli Aramayı Durdur
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

  // Firebase sinyalleşme kaydını sil
  if (db && roomId && userId) {
    db.ref(`rooms/${roomId}/calls/${userId}`).remove();
  }
}

// RTCPeerConnection Nesnesi Oluşturma
function createPeerConnection(targetUserId, isInitiator) {
  const pc = new RTCPeerConnection(rtcConfig);
  peerConnections[targetUserId] = pc;

  // Mikrofon akışını ekle
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // Karşı taraftan gelen sesi al
  pc.ontrack = (event) => {
    const remoteAudio = document.createElement('audio');
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.autoplay = true;
    remoteAudio.play().catch(e => console.log('Audio autoplay blocked', e));
  };

  // ICE Candidate olayını dinle ve Firebase'e yaz
  pc.onicecandidate = (event) => {
    if (event.candidate && db) {
      db.ref(`rooms/${roomId}/calls/${userId}/iceCandidates`).push(event.candidate.toJSON());
    }
  };

  if (isInitiator) {
    // Arayan taraf Offer oluşturur
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

// Gelen Aramayı Karşıla (Offer gelince çalışır)
function handleIncomingCall(callerId, offer) {
  const pc = createPeerConnection(callerId, false); // Arayan değiliz, cevap vereceğiz

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


// --- 🎨 EN YENİ SOHBET PANELİ VE YÜZEN BALONCUK ARAYÜZÜ ---

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.style.position = 'fixed';
  root.style.zIndex = '2147483646';
  root.style.bottom = '0';
  root.style.right = '0';
  root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const style = document.createElement('style');
  style.textContent = `
    /* Sağ Alt Yüzen Baloncuk */
    #filmsync-chat-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #45f3ff, #66fcf1);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(69, 243, 255, 0.4);
      z-index: 1000;
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

    /* Sohbet Paneli */
    #filmsync-chat-panel {
      position: fixed;
      top: 0;
      right: -330px;
      width: 320px;
      height: 100vh;
      background: rgba(11, 12, 16, 0.9);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 999;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
    }
    #filmsync-chat-panel.active {
      right: 0;
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

    /* Sesli Sohbet Butonu */
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
      transition: all 0.3s ease;
    }
    .filmsync-send-btn:hover {
      box-shadow: 0 0 12px rgba(69, 243, 255, 0.3);
    }

    /* Apple Tarzı Bildirim Toast */
    .filmsync-toast {
      position: fixed;
      top: 20px;
      right: -320px;
      width: 280px;
      background: rgba(31, 40, 51, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 12px 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2147483647;
      cursor: pointer;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .filmsync-toast.active { right: 20px; }
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
      word-break: break-all;
    }
  `;

  root.innerHTML = `
    <!-- Yuvarlak Sohbet Baloncuğu -->
    <div id="filmsync-chat-bubble" title="Sohbeti Aç">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
      </svg>
    </div>
    
    <!-- Sohbet Paneli -->
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

  // Baloncuğa tıklama olayı
  chatBubble.addEventListener('click', toggleChatPanel);
  
  // Kapatma butonu
  document.getElementById('filmsyncCloseBtn').addEventListener('click', () => {
    chatPanel.classList.remove('active');
  });

  // Sesli sohbet başlatma
  voiceBtn.addEventListener('click', toggleVoiceCall);

  // Mesaj gönderme
  document.getElementById('filmsyncSendBtn').addEventListener('click', sendChatMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
      e.stopPropagation();
    }
  });

  document.addEventListener('keydown', handleGlobalEnterKey);
}

function removeChatUI() {
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  document.removeEventListener('keydown', handleGlobalEnterKey);
  stopVoiceCall();
}

function toggleChatPanel() {
  chatPanel.classList.toggle('active');
  if (chatPanel.classList.contains('active')) {
    messageInput.focus();
    messageList.scrollTop = messageList.scrollHeight;
  }
}

function handleGlobalEnterKey(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;

  if (isInput) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    chatPanel.classList.add('active');
    messageInput.focus();
    return;
  }

  const isAlphanumeric = e.key.length === 1 && /[a-zA-Z0-9İıŞşĞğÇçÖöÜü\s]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (isAlphanumeric) {
    chatPanel.classList.add('active');
    messageInput.focus();
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


// --- 🔔 APPLE TARZI BİLDİRİM TOAST MOTORU ---

function showNotificationToast(sender, text) {
  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  toast.innerHTML = `
    <div class="filmsync-toast-header">${sender}</div>
    <div class="filmsync-toast-body">${text.length > 45 ? text.substring(0, 42) + '...' : text}</div>
  `;

  document.body.appendChild(toast);
  
  // Slide-in animasyonu
  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  // Bildirime tıklanırsa sohbeti aç
  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
    chatPanel.classList.add('active');
    messageInput.focus();
  });

  // 4 saniye sonra kendiliğinden kaldır
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }
  }, 4000);
}

// --- 🎬 SAYFA YÖNLENDİRME BİLDİRİM TOASTI (YÖNLENDİRME KİLİDİ ÇÖZÜMÜ) ---

function showMovieRedirectNotification(targetUrl) {
  // Mevcut bir yönlendirme bildirimi varsa yenisini ekleme
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

  // Bildirime tıklandığında yönlendir
  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
    chrome.runtime.sendMessage({ type: 'redirect-tab', url: targetUrl });
  });

  // Oda sahibinin yayını için bildirim kapanmasın, kullanıcı kendisi tıklayıp yönlenebilsin
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

      if (fsElement) {
        if (root) fsElement.appendChild(root);
      } else {
        if (root) document.body.appendChild(root);
      }
    });
  });
}

// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---
function showAutoJoinOverlay(roomName) {
  const overlay = document.createElement('div');
  overlay.id = 'filmsync-autojoin-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.background = 'rgba(11, 12, 16, 0.9)';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '2147483647';
  overlay.style.color = '#fff';
  overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

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
