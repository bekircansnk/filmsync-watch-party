// FilmSync Content Script - Hibrit (WebSocket / Firebase) Serverless Watch Party Motoru
let socket = null; // WebSocket referansı
let db = null;     // Firebase referansı
let videoElement = null;
let isSyncing = false;
let roomId = null;
let username = null;
let password = null;
let mode = 'local'; // 'local' veya 'cloud'
let userId = null;

// UI Bileşenleri
let chatBubble = null;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;

// Firebase Varsayılan Yapılandırması (Bulut Modu için taslak config)
const defaultFirebaseConfig = {
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
  chrome.storage.local.get(['roomId', 'username', 'password', 'mode', 'customFirebaseConfig'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      mode = result.mode || 'local';
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      
      console.log(`[FilmSync] Odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}, Mod: ${mode}`);
      
      // Sohbet panelini oluştur
      createChatUI();
      
      // Seçilen moda göre bağlantıyı başlat
      if (mode === 'cloud') {
        const config = result.customFirebaseConfig ? JSON.parse(result.customFirebaseConfig) : defaultFirebaseConfig;
        initializeFirebase(config);
      } else {
        connectWebSocket();
      }
      
      // Video elementini bul
      findVideoElement();
      
      // Tam ekran dinleyicisi
      setupFullscreenListener();
    } else {
      removeChatUI();
    }
  });
}

// Storage değişikliklerini dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings-updated') {
    cleanupConnections();
    removeChatUI();
    init();
    sendResponse({ status: 'success' });
  }
});

// Bağlantıları Temizleme
function cleanupConnections() {
  // WebSocket'i kapat
  if (socket) {
    socket.close();
    socket = null;
  }
  // Firebase'i kapat ve temizle
  if (db && roomId && userId) {
    sendSystemMessage(`${username} odadan ayrıldı.`);
    db.ref(`rooms/${roomId}/users/${userId}`).remove();
    db.ref(`rooms/${roomId}/lastState`).off();
    db.ref(`rooms/${roomId}/messages`).off();
    db.ref(`rooms/${roomId}/users`).off();
    db = null;
  }
}

// --- 🌐 MOD 1: LOKAL WEBSOCKET BAĞLANTISI ---
function connectWebSocket() {
  try {
    socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => {
      console.log('[FilmSync - Lokal] Sunucuya bağlanıldı.');
      socket.send(JSON.stringify({
        type: 'join',
        payload: { roomId, username, password }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    socket.onclose = () => {
      console.log('[FilmSync - Lokal] Bağlantı kesildi. 5 saniye sonra yeniden denenecek...');
      setTimeout(() => {
        if (mode === 'local' && !socket) connectWebSocket();
      }, 5000);
    };

    socket.onerror = (err) => {
      console.error('[FilmSync - Lokal] Hata:', err);
    };
  } catch (err) {
    console.error('[FilmSync - Lokal] Başlatma Hatası:', err);
  }
}

function handleWebSocketMessage(data) {
  const { type, payload } = data;

  if (type === 'join-error') {
    alert(`[FilmSync Lokal Hata] ${payload.message}`);
    removeChatUI();
    if (socket) socket.close();
    return;
  }

  if (type.startsWith('sync-') && ['sync-play', 'sync-pause', 'sync-seek'].includes(type)) {
    syncLocalVideo(type, payload);
  }

  if (type === 'sync-chat-message') {
    appendMessage(payload);
  }

  if (type === 'user-list') {
    updateUsersDisplay(payload.users);
  }
}

// --- ☁️ MOD 2: FIREBASE BULUT BAĞLANTISI ---
function initializeFirebase(config) {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    db = firebase.database();
    
    const roomRef = db.ref(`rooms/${roomId}`);
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      if (roomData && roomData.password && roomData.password !== password) {
        alert('[FilmSync Bulut Hata] Hatalı oda şifresi!');
        removeChatUI();
        cleanupConnections();
        return;
      } else if (!roomData) {
        roomRef.child('password').set(password);
      }
      
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP });
      userRef.onDisconnect().remove();
      
      sendSystemMessage(`${username} odaya katıldı.`);
      setupFirebaseListeners();
    }).catch(err => {
      console.error('[FilmSync - Bulut] Oda hatası:', err);
    });
  } catch (err) {
    console.error('[FilmSync - Bulut] Firebase başlatılamadı:', err);
  }
}

function setupFirebaseListeners() {
  if (!db) return;

  // Medya durumunu dinle
  db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state || !videoElement || isSyncing) return;

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

  // Mesajları dinle
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    if (msg) appendMessage(msg);
  });

  // Aktif kullanıcıları dinle
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

// --- 📺 VİDEO SENKRONİZASYONU VE OLAY YÖNETİMİ ---

function syncLocalVideo(type, payload) {
  if (!videoElement) return;
  isSyncing = true;
  try {
    if (type === 'sync-play') {
      videoElement.currentTime = payload.currentTime;
      videoElement.play().catch(e => console.log('Oynatma engellendi.', e));
    } else if (type === 'sync-pause') {
      videoElement.currentTime = payload.currentTime;
      videoElement.pause();
    } else if (type === 'sync-seek') {
      videoElement.currentTime = payload.currentTime;
    }
  } catch (e) {
    console.error('[FilmSync] Eşitleme başarısız:', e);
  }
  setTimeout(() => { isSyncing = false; }, 300);
}

function findVideoElement() {
  const checkInterval = setInterval(() => {
    const video = document.querySelector('video');
    if (video && video !== videoElement) {
      videoElement = video;
      setupVideoListeners();
      clearInterval(checkInterval);
    }
  }, 1000);
}

function setupVideoListeners() {
  if (!videoElement) return;

  videoElement.addEventListener('play', () => {
    if (isSyncing) return;
    if (mode === 'cloud') {
      sendMediaEventCloud(true, videoElement.currentTime);
    } else {
      sendMediaEventLocal('play', { currentTime: videoElement.currentTime });
    }
  });

  videoElement.addEventListener('pause', () => {
    if (isSyncing) return;
    if (mode === 'cloud') {
      sendMediaEventCloud(false, videoElement.currentTime);
    } else {
      sendMediaEventLocal('pause', { currentTime: videoElement.currentTime });
    }
  });

  videoElement.addEventListener('seeked', () => {
    if (isSyncing) return;
    if (mode === 'cloud') {
      sendMediaEventCloud(!videoElement.paused, videoElement.currentTime);
    } else {
      sendMediaEventLocal('seek', { currentTime: videoElement.currentTime });
    }
  });
}

function sendMediaEventLocal(type, payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  }
}

function sendMediaEventCloud(isPlaying, currentTime) {
  if (!db || !roomId || isSyncing) return;
  db.ref(`rooms/${roomId}/lastState`).set({
    isPlaying,
    currentTime,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  });
}

// --- 🎨 SOHBET ARAYÜZÜ ENJEKSİYONU VE LOGIC ---

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.style.position = 'fixed';
  root.style.zIndex = '999999';
  root.style.bottom = '20px';
  root.style.right = '20px';
  root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const style = document.createElement('style');
  style.textContent = `
    #filmsync-chat-bubble {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(15, 15, 20, 0.75);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      z-index: 1000;
    }
    #filmsync-chat-bubble:hover {
      transform: scale(1.1);
      border-color: #45f3ff;
      box-shadow: 0 8px 32px 0 rgba(69, 243, 255, 0.2);
    }
    #filmsync-chat-bubble svg {
      width: 24px;
      height: 24px;
      fill: #66fcf1;
    }

    #filmsync-chat-panel {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 320px;
      height: 450px;
      background: rgba(11, 12, 16, 0.82);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      display: none;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }
    #filmsync-chat-panel.active {
      display: flex;
    }

    .filmsync-header {
      padding: 15px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
      font-size: 0.95rem;
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
      font-size: 1.1rem;
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
      max-width: 100%;
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
      max-width: 80%;
    }
    .filmsync-msg-row.self {
      align-self: flex-end;
    }
    .filmsync-msg-row.other {
      align-self: flex-start;
    }
    .filmsync-msg-row.system {
      align-self: center;
      max-width: 90%;
    }

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
      padding: 10px 15px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      gap: 10px;
    }
    .filmsync-input-area input {
      flex: 1;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.85rem;
    }
    .filmsync-input-area input:focus {
      outline: none;
      border-color: #45f3ff;
    }
    .filmsync-send-btn {
      padding: 8px 14px;
      background: linear-gradient(135deg, #45f3ff, #66fcf1);
      border: none;
      border-radius: 8px;
      color: #0b0c10;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
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

  chatBubble.addEventListener('click', toggleChatPanel);
  document.getElementById('filmsyncCloseBtn').addEventListener('click', () => {
    chatPanel.classList.remove('active');
  });
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

  if (e.key === 'Enter' && !isInput) {
    e.preventDefault();
    chatPanel.classList.add('active');
    messageInput.focus();
  }
}

function sendChatMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  if (mode === 'cloud') {
    if (db) {
      db.ref(`rooms/${roomId}/messages`).push({
        username,
        message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
    }
  } else {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'chat-message',
        payload: { message: text }
      }));
    }
  }
  messageInput.value = '';
}

function sendSystemMessage(text) {
  if (mode === 'cloud') {
    if (db) {
      db.ref(`rooms/${roomId}/messages`).push({
        username: 'Sistem',
        message: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        isSystem: true
      });
    }
  }
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

// Tam Ekran Desteği
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

      if (fsElement) {
        fsElement.appendChild(root);
      } else {
        document.body.appendChild(root);
      }
    });
  });
}
