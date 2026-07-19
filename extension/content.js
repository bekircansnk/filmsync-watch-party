// FilmSync Özel Sadeleştirilmiş Sürüm (Süre Eşitleme & Sohbet) 🍿

// Logger Object
const Logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

let roomId = null;
let username = 'Anonim';
let password = '';
let userId = null;
let db = null;

let videoElement = null;
let isSyncing = false;
let chatBubble = null;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;

let isFirebaseInitialized = false;

// Firebase Canlı Yapılandırması
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
  chrome.storage.local.get(['roomId', 'username', 'password', 'userId'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      
      if (result.userId) {
        userId = result.userId;
      } else {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ userId });
      }
      
      Logger.info(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
      
      // Iframe spam'ini önle: Başlangıçta sadece Top Window bağlansın.
      if (window === window.top) {
        initializeFirebase(firebaseConfig);
      }
      
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
    sendResponse({ status: 'success' });
  } else if (message.type === 'force-sync') {
    forceSync();
    sendResponse({ status: 'success' });
  }
});

// Firebase SDK Başlatma
function initializeFirebase(config) {
  if (isFirebaseInitialized) return;
  isFirebaseInitialized = true;

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
      Logger.error('[FilmSync] Firebase bağlantı hatası:', err);
    });

  } catch (err) {
    Logger.error('[FilmSync] Firebase başlatılamadı:', err);
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

    // Yönlendirme bildirimi
    if (state.url && state.url !== window.location.href && window === window.top) {
      showMovieRedirectNotification(state.url);
      return;
    }

    // Senkronize edecek bir video var mı?
    const videoReady = videoElement.readyState >= 1;
    if (!videoReady) return;

    isSyncing = true;
    try {
      const timeDiff = state.isPlaying ? Math.max(0, (Date.now() - state.lastUpdated) / 1000) : 0;
      const targetTime = state.currentTime + timeDiff;

      if (state.isPlaying && videoElement.paused) {
        videoElement.currentTime = targetTime;
        videoElement.play().catch(e => {
          Logger.info('[FilmSync] Oynatma engellendi:', e.message);
          showNotificationToast('FilmSync', 'Senkronizasyon için sayfaya tıklayıp oynat butonuna basın! 🍿');
        });
      } else if (!state.isPlaying && !videoElement.paused) {
        videoElement.currentTime = state.currentTime;
        videoElement.pause();
      } else if (Math.abs(videoElement.currentTime - targetTime) > 3) {
        videoElement.currentTime = targetTime;
      }
    } catch (e) {
      Logger.error('[FilmSync] Medya eşileme hatası:', e);
    }
    setTimeout(() => { isSyncing = false; }, 2000);
  });

  // 2. Sohbet Mesajlarını Dinle
  const renderedMessageKeys = new Set();
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    if (!msg || renderedMessageKeys.has(key)) return;
    renderedMessageKeys.add(key);

    appendMessage(msg);

    // Bildirim Toast'u
    const msgAge = Date.now() - (msg.timestamp || 0);
    if (msgAge < 10000 && !msg.isSystem && msg.username !== username) {
      const isPanelActive = chatPanel && chatPanel.classList.contains('active');
      if (!isPanelActive) {
        showNotificationToast(msg.username, msg.message);
      }
    }
  });

  // 3. Aktif Kullanıcıları Dinle
  if (window === window.top) {
    db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
      const usersData = snapshot.val();
      const uniqueUsers = new Set();
      if (usersData) {
        Object.values(usersData).forEach(u => {
          if (u.username) uniqueUsers.add(u.username);
        });
      }
      updateUsersDisplay([...uniqueUsers]);
    });
  }
}

// Zorla Senkronize Et
function forceSync() {
  if (!db || !roomId) return;
  try {
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
            videoElement.play().catch(e => {
              Logger.error('[FilmSync] Oynatma engellendi:', e.message);
              showNotificationToast('FilmSync', 'Senkronizasyon için sayfaya tıklayın! 🍿');
            });
          } else {
            videoElement.pause();
          }
        } catch (e) {
          Logger.error('[FilmSync] Video senkronizasyon hatası:', e);
        }
        setTimeout(() => { isSyncing = false; }, 1500);
      }
    }).catch(err => {
      Logger.error('[FilmSync] Firebase verisi alınamadı (forceSync):', err);
    });
  } catch (err) {
    Logger.error('[FilmSync] forceSync çalışırken hata oluştu:', err);
  }
}

// Bağlantı Temizleme
function cleanupFirebase() {
  if (db && roomId && userId) {
    if (window === window.top) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
      db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
        const users = snapshot.val();
        if (!users || Object.keys(users).length === 0) {
          db.ref(`rooms/${roomId}`).remove();
        }
      });
    });

    db.ref(`rooms/${roomId}/lastState`).off();
    db.ref(`rooms/${roomId}/messages`).off();
    db.ref(`rooms/${roomId}/users`).off();
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

// Videolu Sayfalarda UI Motoru
function startVideoTracking() {
  setInterval(() => {
    try {
      const activeVideo = document.querySelector('video');
      if (activeVideo && activeVideo !== videoElement) {
        removeVideoListeners();
        videoElement = activeVideo;
        setupVideoListeners();
        
        Logger.info('[FilmSync] Video tespit edildi. Eşitleme yapılıyor.');
        forceSync();

        // Arayüz oluştur
        if (!document.getElementById('filmsync-root')) {
          createChatUI();
          startUIKeeper();

          if (window !== window.top) {
            initializeFirebase(firebaseConfig);
          }
        }
      }
    } catch (err) {
      Logger.error('[FilmSync] startVideoTracking sırasında hata oluştu:', err);
    }
  }, 1000);
}

// Drift Correction
function startDriftCorrection() {
  setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing || videoElement.paused) return;
    if (videoElement.readyState < 1) return;

    db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
      const state = snapshot.val();
      if (!state || state.senderId === userId || !state.isPlaying) return;
      if (isSyncing) return;

      const timeDiff = Math.max(0, (Date.now() - state.lastUpdated) / 1000);
      const expectedTime = state.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - expectedTime);

      if (drift > 3 && drift < 30) {
        Logger.info(`[FilmSync Drift] ${drift.toFixed(1)}sn sapma düzeltiliyor.`);
        isSyncing = true;
        videoElement.currentTime = expectedTime;
        setTimeout(() => { isSyncing = false; }, 2000);
      }
    });
  }, 5000);
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

function handlePlayEvent() {
  try {
    if (isSyncing) return;
    sendMediaEvent(true, videoElement.currentTime);
  } catch (err) {
    Logger.error('[FilmSync] handlePlayEvent hatası:', err);
  }
}

function handlePauseEvent() {
  try {
    if (isSyncing) return;
    sendMediaEvent(false, videoElement.currentTime);
  } catch (err) {
    Logger.error('[FilmSync] handlePauseEvent hatası:', err);
  }
}

function handleSeekEvent() {
  try {
    if (isSyncing) return;
    sendMediaEvent(!videoElement.paused, videoElement.currentTime);
  } catch (err) {
    Logger.error('[FilmSync] handleSeekEvent hatası:', err);
  }
}

// --- 🎨 EN YENİ SADELEŞTİRİLMİŞ SOHBET ARAYÜZÜ ---
function createChatUI() {
  if (document.getElementById('filmsync-root')) return;
  if (!document.querySelector('video')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.setAttribute('style', [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'z-index: 2147483640',
    'pointer-events: none',
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  ].join(' !important; ') + ' !important;');

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
      pointer-events: auto !important;
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
      height: 100%;
      background: rgba(11, 12, 16, 0.7) !important;
      backdrop-filter: blur(25px) !important;
      -webkit-backdrop-filter: blur(25px) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2147483646 !important;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
      pointer-events: auto !important;
    }
    #filmsync-chat-panel.active {
      right: 0 !important;
    }

    .filmsync-header {
      padding: 18px 15px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 0.85rem;
      line-height: 1.35;
      word-break: break-word;
    }
    .filmsync-msg-row.self .filmsync-msg-bubble {
      background: rgba(69, 243, 255, 0.1) !important;
      border: 1px solid rgba(69, 243, 255, 0.25);
      color: #fff;
      border-bottom-right-radius: 2px;
      box-shadow: 0 4px 12px rgba(69, 243, 255, 0.1);
    }
    .filmsync-msg-row.other .filmsync-msg-bubble {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #fff;
      border-bottom-left-radius: 2px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      background: rgba(255, 255, 255, 0.01);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 10px;
    }
    .filmsync-input-area input {
      flex: 1;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: #fff;
      font-size: 0.85rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .filmsync-input-area input:focus {
      outline: none;
      border-color: #45f3ff;
      background: rgba(255, 255, 255, 0.06) !important;
      box-shadow: 0 0 12px rgba(69, 243, 255, 0.2);
    }
    .filmsync-send-btn {
      padding: 10px 16px;
      background: linear-gradient(135deg, rgba(69, 243, 255, 0.2), rgba(102, 252, 241, 0.2));
      border: 1px solid rgba(69, 243, 255, 0.4);
      border-radius: 10px;
      color: #45f3ff;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filmsync-send-btn:hover {
      background: linear-gradient(135deg, rgba(69, 243, 255, 0.3), rgba(102, 252, 241, 0.3));
      box-shadow: 0 0 10px rgba(69, 243, 255, 0.3);
    }

    .filmsync-toast {
      position: fixed !important;
      top: 20px !important;
      right: -320px !important;
      width: 280px;
      background: rgba(11, 12, 16, 0.7) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 14px 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2147483647 !important;
      cursor: pointer;
      transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto !important;
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
          <div class="filmsync-header-title">FilmSync <span>Partisi</span> 🍿</div>
          <button class="filmsync-close-btn" id="filmsyncCloseBtn">×</button>
        </div>
        <div class="filmsync-users" id="filmsyncUserList">Üyeler yükleniyor...</div>
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
  const sendBtn = document.getElementById('filmsyncSendBtn');

  if (sendBtn && messageInput) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
    messageInput.addEventListener('input', () => {
      const hasText = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.4';
    });
  }

  chatBubble.addEventListener('click', toggleChatPanel);
  document.getElementById('filmsyncCloseBtn').addEventListener('click', toggleChatPanel);
  sendBtn.addEventListener('click', sendChatMessage);
  
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
      e.stopPropagation();
    }
  });

  document.addEventListener('keydown', handleGlobalEnterKey);
}

function startUIKeeper() {
  setInterval(() => {
    if (roomId && document.querySelector('video') && !document.getElementById('filmsync-root')) {
      Logger.info('[FilmSync UI Keeper] Arayüz yenileniyor.');
      createChatUI();
    }
  }, 2000);
}

function removeChatUI() {
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  document.removeEventListener('keydown', handleGlobalEnterKey);
}

function toggleChatPanel() {
  if (!chatPanel || !chatBubble) return;

  chatPanel.classList.toggle('active');
  
  if (chatPanel.classList.contains('active')) {
    chatBubble.style.display = 'none';
    messageInput.focus();
    messageList.scrollTop = messageList.scrollHeight;
  } else {
    chatBubble.style.display = 'flex';
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
  const container = document.getElementById('filmsync-root') || document.body;

  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  toast.innerHTML = `
    <div class="filmsync-toast-header">${sender}</div>
    <div class="filmsync-toast-body">${text.length > 45 ? text.substring(0, 42) + '...' : text}</div>
  `;

  container.appendChild(toast);
  
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

  const container = document.getElementById('filmsync-root') || document.body;
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

  container.appendChild(toast);

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
      if (!root) return;

      const fsElement = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

      const targetContainer = fsElement || document.body;
      targetContainer.appendChild(root);
      
      Logger.info(`[FilmSync] Tam ekran: root → ${fsElement ? 'fullscreenElement' : 'body'}`);
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
      <div style="font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; color: #fff;">FilmSync <span>Partisi</span> 🍿</div>
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
