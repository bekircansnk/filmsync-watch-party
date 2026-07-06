// FilmSync Content Script - Gelişmiş Canlı URL Yönlendirmeli & Kayan Yazılı Watch Party Motoru
let db = null;
let videoElement = null;
let isSyncing = false;
let roomId = null;
let username = null;
let password = null;
let userId = null;

// UI Bileşenleri
let sidebarTrigger = null;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;
let danmakuContainer = null;

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
  chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      
      console.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
      
      // ÇİFT SOHBET PENCERESİ ÇÖZÜMÜ: Sohbet arayüzünü yalnızca TOP (Ana) sayfaya ekle, iframe'leri engelle!
      if (window === window.top) {
        createChatUI();
        createDanmakuContainer();
      }
      
      // Firebase'i başlat
      initializeFirebase(firebaseConfig);
      
      // Sayfadaki video elementini bul
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
    cleanupFirebase();
    removeChatUI();
    init();
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
        // Oda varsa şifreyi kontrol et
        if (roomData.password && roomData.password !== password) {
          alert('[FilmSync Hata] Hatalı oda şifresi!');
          removeChatUI();
          cleanupFirebase();
          return;
        }
        
        // CANLI URL YÖNLENDİRMESİ: Odaya katılırken odanın güncel URL'i bizimkinden farklıysa sekmeyi yönlendir!
        if (roomData.lastState && roomData.lastState.url && roomData.lastState.url !== window.location.href) {
          // Yönlendirmeden önce ana sayfada olduğumuzdan emin olalım
          if (window === window.top) {
            console.log(`[FilmSync] Sekme oda sahibiyle eşitlenmek için yönlendiriliyor: ${roomData.lastState.url}`);
            chrome.runtime.sendMessage({ type: 'redirect-tab', url: roomData.lastState.url });
            return; // Yönlenme başlayacağı için işlemi durdur
          }
        }
      } else {
        // Oda yoksa ilk kez oluştur, şifreyi ve ilk URL'i tanımla
        roomRef.child('password').set(password);
        if (window === window.top) {
          db.ref(`rooms/${roomId}/lastState/url`).set(window.location.href);
        }
      }
      
      // Kullanıcıyı aktif listeye ekle ve bağlantı kesilince sil (onDisconnect)
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP });
      userRef.onDisconnect().remove();
      
      // Katılım mesajı gönder
      if (window === window.top) {
        sendSystemMessage(`${username} odaya katıldı.`);
      }
      
      // Dinleyicileri kur
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

    // CANLI URL YÖNLENDİRMESİ: Eğer oda sahibi başka bir sayfaya geçtiyse bizi de yönlendir!
    if (state.url && state.url !== window.location.href && window === window.top) {
      console.log(`[FilmSync] Oda sahibi farklı bir sayfa açtı. Yönlendiriliyor: ${state.url}`);
      chrome.runtime.sendMessage({ type: 'redirect-tab', url: state.url });
      return;
    }

    // Zaman farkını hesapla
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
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
      const msg = snapshot.val();
      if (msg) {
        appendMessage(msg);
        // Sistem mesajı değilse ekranda kayan yazı olarak göster
        if (!msg.isSystem) {
          showDanmakuMessage(msg.username, msg.message);
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
}

// Bağlantı ve Dinleyicileri Temizleme
function cleanupFirebase() {
  if (db && roomId && userId) {
    if (window === window.top) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    db.ref(`rooms/${roomId}/users/${userId}`).remove();
    db.ref(`rooms/${roomId}/lastState`).off();
    if (window === window.top) {
      db.ref(`rooms/${roomId}/messages`).off();
      db.ref(`rooms/${roomId}/users`).off();
    }
  }
}

// Medya Olayını Firebase'e Gönderme
function sendMediaEvent(isPlaying, currentTime) {
  if (!db || !roomId || isSyncing) return;
  db.ref(`rooms/${roomId}/lastState`).update({
    isPlaying,
    currentTime,
    url: window.location.href, // Canlı URL senkronizasyonu için mevcut sayfa adresini ekle
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  });
}

// Video Elementini Arama
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
    sendMediaEvent(true, videoElement.currentTime);
  });

  videoElement.addEventListener('pause', () => {
    if (isSyncing) return;
    sendMediaEvent(false, videoElement.currentTime);
  });

  videoElement.addEventListener('seeked', () => {
    if (isSyncing) return;
    sendMediaEvent(!videoElement.paused, videoElement.currentTime);
  });
}

// --- 🎨 EN YENİ SOHBET PANELİ VE SAĞ ÇERÇEVE ARAYÜZÜ ---

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.style.position = 'fixed';
  root.style.zIndex = '2147483646'; // Çok yüksek z-index (tam ekranda görünmesi için)
  root.style.top = '0';
  root.style.right = '0';
  root.style.height = '100vh';
  root.style.display = 'flex';
  root.style.alignItems = 'center';
  root.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const style = document.createElement('style');
  style.textContent = `
    /* Sağ İnce Tetikleyici Çerçeve */
    #filmsync-sidebar-trigger {
      width: 8px;
      height: 100vh;
      background: rgba(69, 243, 255, 0.05);
      border-left: 1px solid rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    #filmsync-sidebar-trigger:hover {
      width: 14px;
      background: rgba(69, 243, 255, 0.15);
      border-left: 1px solid rgba(69, 243, 255, 0.4);
      box-shadow: -4px 0 15px rgba(69, 243, 255, 0.1);
    }

    /* Sohbet Paneli */
    #filmsync-chat-panel {
      width: 320px;
      height: 100vh;
      background: rgba(11, 12, 16, 0.88);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      display: none; /* Varsayılan gizli */
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 999;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
    }
    #filmsync-chat-panel.active {
      display: flex;
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

    /* Mesaj Balonları */
    .filmsync-msg-row {
      display: flex;
      flex-direction: column;
      max-width: 85%;
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
    }
    .filmsync-input-area input:focus {
      outline: none;
      border-color: #45f3ff;
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
  `;

  root.innerHTML = `
    <div id="filmsync-sidebar-trigger" title="Sohbeti Aç"></div>
    
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

  sidebarTrigger = document.getElementById('filmsync-sidebar-trigger');
  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  messageList = document.getElementById('filmsync-messages');
  userListDisplay = document.getElementById('filmsyncUserList');

  // Sağ ince bara tıklandığında sohbeti aç/kapat
  sidebarTrigger.addEventListener('click', toggleChatPanel);
  
  // Kapatma butonu
  document.getElementById('filmsyncCloseBtn').addEventListener('click', () => {
    chatPanel.classList.remove('active');
  });

  // Mesaj gönderme
  document.getElementById('filmsyncSendBtn').addEventListener('click', sendChatMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
      e.stopPropagation();
    }
  });

  // Enter tuşu dinleyicisi
  document.addEventListener('keydown', handleGlobalEnterKey);
}

function removeChatUI() {
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  const danmaku = document.getElementById('filmsync-danmaku-container');
  if (danmaku) danmaku.remove();
  document.removeEventListener('keydown', handleGlobalEnterKey);
}

function toggleChatPanel() {
  chatPanel.classList.toggle('active');
  if (chatPanel.classList.contains('active')) {
    messageInput.focus();
    messageList.scrollTop = messageList.scrollHeight;
  }
}

// Global Enter ve Yazmaya Başlama Dinleyicisi
function handleGlobalEnterKey(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;

  if (isInput) return;

  // Enter tuşu sohbet panelini açar ve odaklar
  if (e.key === 'Enter') {
    e.preventDefault();
    chatPanel.classList.add('active');
    messageInput.focus();
    return;
  }

  // Kullanıcı herhangi bir harf tuşuna bastığında sohbeti otomatik açıp odağı oraya alalım
  const isAlphanumeric = e.key.length === 1 && /[a-zA-Z0-9İıŞşĞğÇçÖöÜü\s]/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey;
  if (isAlphanumeric) {
    chatPanel.classList.add('active');
    messageInput.focus();
    // Tuşa basılan harfi de doğrudan input'a ekleyelim
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

// --- 📺 VİDEO ÜZERİNDEN AKAN KAYAN YAZI (DANMAKU) MOTORU ---

function createDanmakuContainer() {
  if (document.getElementById('filmsync-danmaku-container')) return;

  danmakuContainer = document.createElement('div');
  danmakuContainer.id = 'filmsync-danmaku-container';
  danmakuContainer.style.position = 'fixed';
  danmakuContainer.style.top = '10%';
  danmakuContainer.style.left = '0';
  danmakuContainer.style.width = '100%';
  danmakuContainer.style.height = '40%'; // Videonun üst yüzde 40'lık alanında aksın
  danmakuContainer.style.pointerEvents = 'none'; // Videoya tıklamayı engellememek için tıklamaları yoksay
  danmakuContainer.style.zIndex = '2147483647'; // En üst katman
  danmakuContainer.style.overflow = 'hidden';

  const style = document.createElement('style');
  style.textContent = `
    .filmsync-danmaku-item {
      position: absolute;
      right: -300px;
      white-space: nowrap;
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 
        -1px -1px 0 #000,  
         1px -1px 0 #000,
        -1px  1px 0 #000,
         1px  1px 0 #000,
         0px 0px 8px rgba(69, 243, 255, 0.8); /* Turkuaz neon parıltı */
      padding: 6px 14px;
      background: rgba(11, 12, 16, 0.4);
      border-radius: 20px;
      backdrop-filter: blur(2px);
      display: inline-block;
      will-change: transform;
      animation: filmsync-danmaku-slide 8s linear forwards;
    }

    @keyframes filmsync-danmaku-slide {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-220vw); /* Ekran genişliğine göre sola kaydır */
      }
    }
  `;

  document.body.appendChild(danmakuContainer);
  document.head.appendChild(style);
}

function showDanmakuMessage(sender, text) {
  if (!danmakuContainer) return;

  const item = document.createElement('div');
  item.classList.add('filmsync-danmaku-item');
  item.textContent = `${sender}: ${text}`;

  // Kayan yazının dikeyde farklı katmanlarda (lane) akması için rastgele bir satır belirle
  const lanes = 6; // 6 farklı dikey kulvar
  const randomLane = Math.floor(Math.random() * lanes);
  item.style.top = `${randomLane * 40}px`; // Kulvar başına 40px boşluk

  danmakuContainer.appendChild(item);

  // Animasyon bitince elementi DOM'dan temizle
  item.addEventListener('animationend', () => {
    item.remove();
  });
}

// --- 📺 TAM EKRAN DESTEĞİ ---
function setupFullscreenListener() {
  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  events.forEach(eventName => {
    document.addEventListener(eventName, () => {
      const root = document.getElementById('filmsync-root');
      const danmaku = document.getElementById('filmsync-danmaku-container');

      const fsElement = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

      if (fsElement) {
        if (root) fsElement.appendChild(root);
        if (danmaku) fsElement.appendChild(danmaku);
        console.log('[FilmSync] Tam ekranda arayüzler oynatıcı elementinin altına taşındı.');
      } else {
        if (root) document.body.appendChild(root);
        if (danmaku) document.body.appendChild(danmaku);
      }
    });
  });
}
