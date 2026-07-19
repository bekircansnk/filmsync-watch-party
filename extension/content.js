// FilmSync Özel Sadeleştirilmiş Sürüm (Süre Eşitleme & Sohbet) 🍿
const Logger = {
  info: (...args) => console.log('[FilmSync INFO]', ...args),
  warn: (...args) => console.warn('[FilmSync WARN]', ...args),
  error: (...args) => console.error('[FilmSync ERROR]', ...args)
};

let roomId = null;
let username = 'Anonim';
let password = '';
let userId = null;
let db = null;

let videoElement = null;

const PlayerAdapter = {
  element: null,
  ignoreEvents: false,
  lockTimeout: null,

  setVideo(videoEl) {
    this.element = videoEl;
  },

  lockEvents(duration = 2000) {
    this.ignoreEvents = true;
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    this.lockTimeout = setTimeout(() => {
      this.ignoreEvents = false;
    }, duration);
  },

  ensureVideoReady(callback) {
    if (!this.element) return;
    if (this.element.readyState >= 1) {
      callback();
    } else {
      const onReady = () => {
        try {
          this.element.removeEventListener('loadedmetadata', onReady);
        } catch(e) {}
        callback();
      };
      try {
        this.element.addEventListener('loadedmetadata', onReady);
      } catch(e) {}
    }
  },

  applyRemoteState(state) {
    this.ensureVideoReady(() => {
      this.lockEvents(2000);
      try {
        const timeDiff = state.isPlaying ? Math.max(0, (Date.now() - state.lastUpdated) / 1000) : 0;
        const targetTime = state.currentTime + timeDiff;

        if (state.isPlaying && this.element.paused) {
          this.element.currentTime = targetTime;
          this.element.play().catch(e => {
            Logger.info('[FilmSync] Oynatma engellendi:', e.message);
            showNotificationToast('FilmSync', 'Senkronizasyon için sayfaya tıklayıp oynat butonuna basın! 🍿');
          });
        } else if (!state.isPlaying && !this.element.paused) {
          this.element.currentTime = state.currentTime;
          this.element.pause();
        } else if (Math.abs(this.element.currentTime - targetTime) > 3) {
          this.element.currentTime = targetTime;
        }
      } catch (e) {
        Logger.error('[FilmSync] Medya eşileme hatası:', e);
      }
    });
  }
};

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
    if (!state || !videoElement) return;
    if (state.senderId === userId) return;

    // Yönlendirme bildirimi
    if (state.url && state.url !== window.location.href && window === window.top) {
      showMovieRedirectNotification(state.url);
      return;
    }

    if (PlayerAdapter.element) {
      PlayerAdapter.applyRemoteState(state);
    }
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
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    const video = document.querySelector('video');
    if (video) {
      videoElement = video;
      PlayerAdapter.setVideo(video);
    }

    if (PlayerAdapter.element) {
      PlayerAdapter.applyRemoteState(state);
    }
  });
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
  if (!db || !roomId || PlayerAdapter.ignoreEvents) return;
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
    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      PlayerAdapter.setVideo(activeVideo);
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
  }, 1000);
}

// Drift Correction
function startDriftCorrection() {
  setInterval(() => {
    if (!db || !roomId || !videoElement || PlayerAdapter.ignoreEvents || videoElement.paused) return;
    if (videoElement.readyState < 1) return;

    db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
      const state = snapshot.val();
      if (!state || state.senderId === userId || !state.isPlaying) return;
      if (PlayerAdapter.ignoreEvents) return;

      const timeDiff = Math.max(0, (Date.now() - state.lastUpdated) / 1000);
      const expectedTime = state.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - expectedTime);

      if (drift > 3 && drift < 30) {
        Logger.info(`[FilmSync Drift] ${drift.toFixed(1)}sn sapma düzeltiliyor.`);
        PlayerAdapter.lockEvents(2000);
        try {
          videoElement.currentTime = expectedTime;
        } catch(e) { Logger.error(e); }
      }
    });
  }, 5000);
}

function setupVideoListeners() {
  if (!videoElement) return;
  try {
    videoElement.addEventListener('play', handlePlayEvent);
    videoElement.addEventListener('pause', handlePauseEvent);
    videoElement.addEventListener('seeked', handleSeekEvent);
  } catch(e) {
    Logger.error(e);
  }
}

function removeVideoListeners() {
  if (!videoElement) return;
  try {
    videoElement.removeEventListener('play', handlePlayEvent);
    videoElement.removeEventListener('pause', handlePauseEvent);
    videoElement.removeEventListener('seeked', handleSeekEvent);
  } catch(e) {
    Logger.error(e);
  }
}

function handlePlayEvent() {
  if (PlayerAdapter.ignoreEvents) return;
  sendMediaEvent(true, videoElement.currentTime);
}

function handlePauseEvent() {
  if (PlayerAdapter.ignoreEvents) return;
  sendMediaEvent(false, videoElement.currentTime);
}

function handleSeekEvent() {
  if (PlayerAdapter.ignoreEvents) return;
  sendMediaEvent(!videoElement.paused, videoElement.currentTime);
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
      transform: translateX(0);
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
      transform: translateX(0);
      transform: translateX(100%);
      will-change: transform;
      width: 320px;
      height: 100%;
      background: rgba(11, 12, 16, 0.7) !important;
      backdrop-filter: blur(25px) !important;
      -webkit-backdrop-filter: blur(25px) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 2147483646 !important;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
      pointer-events: auto !important;
    }
    #filmsync-chat-panel.active {
      transform: translateX(0);
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
      transform: translateX(0);
      transform: translateX(120%);
      will-change: transform;
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
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto !important;
    }
    .filmsync-toast.active { transform: translateX(0); }
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


  const bubble = document.createElement('div');
  bubble.id = 'filmsync-chat-bubble';
  bubble.title = 'Sohbeti Aç';
  bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
  root.appendChild(bubble);

  const panel = document.createElement('div');
  panel.id = 'filmsync-chat-panel';

  const header = document.createElement('div');
  header.className = 'filmsync-header';
  const headerTop = document.createElement('div');
  headerTop.className = 'filmsync-header-top';
  const headerTitle = document.createElement('div');
  headerTitle.className = 'filmsync-header-title';
  headerTitle.innerHTML = `FilmSync <span>Partisi</span> 🍿`;
  const closeBtn = document.createElement('button');
  closeBtn.className = 'filmsync-close-btn';
  closeBtn.id = 'filmsyncCloseBtn';
  closeBtn.textContent = '×';
  headerTop.appendChild(headerTitle);
  headerTop.appendChild(closeBtn);

  const usersDiv = document.createElement('div');
  usersDiv.className = 'filmsync-users';
  usersDiv.id = 'filmsyncUserList';
  usersDiv.textContent = 'Üyeler yükleniyor...';

  header.appendChild(headerTop);
  header.appendChild(usersDiv);
  panel.appendChild(header);

  const messagesDiv = document.createElement('div');
  messagesDiv.id = 'filmsync-messages';
  panel.appendChild(messagesDiv);

  const inputArea = document.createElement('div');
  inputArea.className = 'filmsync-input-area';
  const msgInput = document.createElement('input');
  msgInput.type = 'text';
  msgInput.id = 'filmsyncMsgInput';
  msgInput.placeholder = 'Mesaj yazın...';
  msgInput.autocomplete = 'off';
  const sendBtnDiv = document.createElement('button');
  sendBtnDiv.className = 'filmsync-send-btn';
  sendBtnDiv.id = 'filmsyncSendBtn';
  sendBtnDiv.textContent = 'Gönder';

  inputArea.appendChild(msgInput);
  inputArea.appendChild(sendBtnDiv);
  panel.appendChild(inputArea);

  root.appendChild(panel);


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
    const bubble = document.createElement('div');
    bubble.className = 'filmsync-msg-bubble';
    bubble.textContent = message;
    row.appendChild(bubble);
  } else {
    const isSelf = msgUser === username;
    row.classList.add(isSelf ? 'self' : 'other');
    const sender = document.createElement('div');
    sender.className = 'filmsync-msg-sender';
    sender.textContent = msgUser;
    const bubble = document.createElement('div');
    bubble.className = 'filmsync-msg-bubble';
    bubble.textContent = message;
    row.appendChild(sender);
    row.appendChild(bubble);
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
  const header = document.createElement('div');
  header.className = 'filmsync-toast-header';
  header.textContent = sender;
  const body = document.createElement('div');
  body.className = 'filmsync-toast-body';
  body.textContent = text.length > 45 ? text.substring(0, 42) + '...' : text;
  toast.appendChild(header);
  toast.appendChild(body);

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
  
  const header = document.createElement('div');
  header.className = 'filmsync-toast-header';
  header.textContent = 'Yeni Film Akışı 🎬';
  const body = document.createElement('div');
  body.className = 'filmsync-toast-body';
  body.setAttribute('style', 'color: #45f3ff; font-weight: bold; cursor: pointer;');
  body.textContent = 'Oda sahibi yeni bir film açtı. Gitmek için tıklayın!';
  toast.appendChild(header);
  toast.appendChild(body);

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

  const title = document.createElement('div');
  title.setAttribute('style', 'font-size: 2.5rem; font-weight: 700; margin-bottom: 10px;');
  title.textContent = 'FilmSync 🍿';
  const subtitle = document.createElement('div');
  subtitle.setAttribute('style', 'font-size: 1.2rem; color: #45f3ff; font-weight: 600; margin-bottom: 20px;');
  subtitle.textContent = `"${roomName}" Odasına Katılınıyor...`;
  const spinner = document.createElement('div');
  spinner.setAttribute('style', 'width: 40px; height: 40px; border: 4px solid rgba(69, 243, 255, 0.1); border-top-color: #45f3ff; border-radius: 50%; animation: spin 1s linear infinite;');
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  overlay.appendChild(title);
  overlay.appendChild(subtitle);
  overlay.appendChild(spinner);
  overlay.appendChild(style);
  document.body.appendChild(overlay);
}

// --- 🏷️ İSİM PROMPT MODALI ---
function showNamePromptModal(roomName, callback) {
  if (document.getElementById('filmsync-name-prompt-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'filmsync-name-prompt-modal';
  modal.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 12, 16, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  const container = document.createElement('div');
  container.setAttribute('style', 'width: 320px; background: rgba(31, 40, 51, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); text-align: center; color: #fff;');

  const title = document.createElement('div');
  title.setAttribute('style', 'font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; color: #fff;');
  title.innerHTML = 'FilmSync <span>Partisi</span> 🍿';

  const subtitle = document.createElement('div');
  subtitle.setAttribute('style', 'font-size: 0.85rem; color: #66fcf1; margin-bottom: 20px;');
  subtitle.textContent = `"${roomName}" odasına katılacaksınız.`;

  const inputContainer = document.createElement('div');
  inputContainer.setAttribute('style', 'text-align: left; margin-bottom: 15px;');

  const label = document.createElement('label');
  label.setAttribute('style', 'font-size: 0.75rem; text-transform: uppercase; color: #45f3ff; font-weight: 600; display: block; margin-bottom: 5px;');
  label.textContent = 'Adınız';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'promptNameInput';
  input.placeholder = 'Kullanıcı adınızı yazın';
  input.setAttribute('style', 'width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.85rem; outline: none; transition: border 0.3s;');

  inputContainer.appendChild(label);
  inputContainer.appendChild(input);

  const btn = document.createElement('button');
  btn.id = 'promptJoinBtn';
  btn.setAttribute('style', 'width: 100%; padding: 11px; border: none; border-radius: 8px; background: linear-gradient(135deg, #45f3ff, #66fcf1); color: #0b0c10; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;');
  btn.textContent = 'Odaya Katıl';

  container.appendChild(title);
  container.appendChild(subtitle);
  container.appendChild(inputContainer);
  container.appendChild(btn);

  modal.appendChild(container);

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
