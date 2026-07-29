// FilmSync Watch Party Content Script (Consolidated Stable Version) 🍿

let roomId = null;
let username = 'Anonim';
let password = '';
let userId = null;
let selectedAvatar = '🍿';
let hostId = null;
let hostOnly = false;
let db = null;

let videoElement = null;
let isSyncing = false;
let isFirstSync = true;
let syncLockTimeout = null;

let chatPanel = null;
let messageInput = null;
let messageList = null;
let chatBtn = null;
let chatCount = null;
let reactionContainer = null;

let isFirebaseInitialized = false;
let renderedMessageKeys = new Set();
let pendingState = null;
let messagesQueue = [];

let serverTimeOffset = 0;
let lastSentMediaState = { isPlaying: null, currentTime: -1, timestamp: 0 };
let lastSentServerTime = 0;

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

// Oynatıcı Adaptörü (Farklı siteleri tek arayüzden kontrol etmek için)
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      } else if (videoElement) {
        const p = videoElement.play();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {
      console.warn('[FilmSync PlayerAdapter] Play hatası:', e);
    }
  },

  pause: () => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
      } else if (videoElement) {
        videoElement.pause();
      }
    } catch (e) {
      console.warn('[FilmSync PlayerAdapter] Pause hatası:', e);
    }
  },

  seek: (seconds) => {
    try {
      if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
        window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      } else if (videoElement && !isNaN(seconds) && isFinite(seconds) && seconds >= 0) {
        videoElement.currentTime = seconds;
      }
    } catch (e) {
      console.warn('[FilmSync PlayerAdapter] Seek hatası:', e);
    }
  }
};

function setSyncLock(ms = 800) {
  isSyncing = true;
  if (syncLockTimeout) clearTimeout(syncLockTimeout);
  syncLockTimeout = setTimeout(() => {
    isSyncing = false;
    isFirstSync = false;
  }, ms);
}

function releaseSyncLock() {
  isSyncing = false;
  isFirstSync = false;
  if (syncLockTimeout) {
    clearTimeout(syncLockTimeout);
    syncLockTimeout = null;
  }
}

function stopAllTimers() {
  if (window.filmsyncUiKeeperInterval) {
    clearInterval(window.filmsyncUiKeeperInterval);
    window.filmsyncUiKeeperInterval = null;
  }
  if (window.filmsyncVideoTrackingInterval) {
    clearInterval(window.filmsyncVideoTrackingInterval);
    window.filmsyncVideoTrackingInterval = null;
  }
  if (window.filmsyncDriftInterval) {
    clearInterval(window.filmsyncDriftInterval);
    window.filmsyncDriftInterval = null;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function isEmbedUrl(urlStr) {
  if (!urlStr) return false;
  const lower = urlStr.toLowerCase();
  return (
    lower.includes('/embed') ||
    lower.includes('embed-') ||
    lower.includes('embed.') ||
    lower.includes('vidsrc') ||
    lower.includes('player.php') ||
    lower.includes('video.php') ||
    lower.includes('stream.php')
  );
}

function checkIsMoviePage() {
  const url = window.location.href.toLowerCase();
  if (url.includes('google.com/search') || url.includes('google.com.tr/search')) return false;
  return true;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function showNotificationToast(user, msgText) {
  const existingToast = document.getElementById('filmsync-notification-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'filmsync-notification-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(20, 20, 24, 0.95);
    border: 1px solid rgba(255, 61, 71, 0.4);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    padding: 12px 16px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 300px;
    backdrop-filter: blur(8px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(20px);
    opacity: 0;
  `;

  toast.innerHTML = `
    <div style="font-size: 18px;">💬</div>
    <div style="flex: 1; overflow: hidden;">
      <div style="font-weight: 700; color: #ff3d47; margin-bottom: 2px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${user}</div>
      <div style="color: #e0e0e0; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${msgText}</div>
    </div>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showMovieRedirectBanner(url) {
  if (document.getElementById('filmsync-redirect-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'filmsync-redirect-banner';
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(20, 20, 24, 0.95);
    border: 1px solid rgba(255, 61, 71, 0.5);
    border-radius: 12px;
    padding: 14px 18px;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
  `;

  banner.innerHTML = `
    <div style="font-size: 20px;">🎬</div>
    <div>
      <div style="font-weight: bold; color: #ff3d47; font-size: 13px;">Oda Sahibi Yeni Bir Film Başlattı!</div>
      <div style="font-size: 12px; color: #ccc; margin-top: 2px;">Tüm üyeler bu filme yönlendiriliyor.</div>
    </div>
    <button id="fs-btn-banner-go" style="background: #ff3d47; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; margin-left: 8px;">Filme Git 🍿</button>
    <button id="fs-btn-banner-close" style="background: transparent; color: #aaa; border: none; font-size: 16px; cursor: pointer; padding: 0 4px;">✕</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('fs-btn-banner-go').addEventListener('click', () => {
    window.location.href = url;
  });

  document.getElementById('fs-btn-banner-close').addEventListener('click', () => {
    window.filmsyncDismissedUrl = url;
    banner.remove();
  });
}

function ensureVideoReady(callback, retries = 5) {
  if (videoElement && videoElement.readyState >= 1) {
    callback(true);
    return;
  }
  
  const foundVideo = document.querySelector('video');
  if (foundVideo && foundVideo.readyState >= 1) {
    videoElement = foundVideo;
    setupVideoListeners();
    callback(true);
    return;
  }

  if (retries > 0) {
    setTimeout(() => ensureVideoReady(callback, retries - 1), 300);
  } else {
    callback(false);
  }
}

// --- 🎨 TELEPARTY UYUMLU DİKEY SOHBET VE KONTROL PANELİ ---

function startUIKeeper() {
  if (window.filmsyncUiKeeperInterval) clearInterval(window.filmsyncUiKeeperInterval);
  window.filmsyncUiKeeperInterval = setInterval(() => {
    if (roomId && !document.getElementById('filmsync-root') && window === window.top) {
      console.log('[FilmSync UI Keeper] Arayüz yenileniyor.');
      createChatUI();
    }
  }, 2000);
}

function removeChatUI() {
  stopAllTimers();
  roomId = null;
  chatPanel = null;
  chatBtn = null;
  chatCount = null;
  reactionContainer = null;
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  document.body.classList.remove('filmsync-sidebar-open');
  document.removeEventListener('keydown', handleGlobalEnterKey, true);
}

function toggleChatPanel() {
  if (!chatPanel) return;

  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  chatPanel.classList.toggle('active');
  
  const isOpened = chatPanel.classList.contains('active');
  const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');

  if (isOpened) {
    document.body.classList.add('filmsync-sidebar-open');
    if (miniToolbar) miniToolbar.classList.add('panel-active');
    messageInput?.focus();
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    }
  } else {
    document.body.classList.remove('filmsync-sidebar-open');
    if (miniToolbar) miniToolbar.classList.remove('panel-active');
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
    }
  }
  
  window.dispatchEvent(new Event('resize'));
}

function handleGlobalEnterKey(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;
  if (isInput) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    if (chatPanel) {
      toggleChatPanel();
      if (chatPanel.classList.contains('active') && messageInput) {
        messageInput.focus();
      }
    }
    return;
  }

  const isAlphanumericOrSpace = (e.key.length === 1 || e.key === 'Spacebar' || e.key === ' ') && 
                                 !e.ctrlKey && !e.metaKey && !e.altKey;

  if (isAlphanumericOrSpace) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (chatPanel && !chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }

    if (messageInput) {
      messageInput.focus();
      const char = e.key === ' ' || e.key === 'Spacebar' ? ' ' : e.key;
      messageInput.value += char;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

function sendChatMessage() {
  const text = messageInput ? messageInput.value.trim() : '';
  if (!text || !db || !roomId) return;

  db.ref(`rooms/${roomId}/messages`).push({
    username,
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
  if (messageInput) {
    messageInput.value = '';
    messageInput.blur();
  }
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

function appendMessage({ username: msgUser, message, isSystem, timestamp }) {
  if (!messageList) {
    messagesQueue.push({ username: msgUser, message, isSystem, timestamp });
    return;
  }

  const row = document.createElement('div');
  row.classList.add('filmsync-msg-row');

  const dateObj = timestamp ? new Date(timestamp) : new Date();
  const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    row.classList.add('system');
    const systemBubble = document.createElement('div');
    systemBubble.className = 'filmsync-msg-bubble';
    systemBubble.innerHTML = `<em>${message}</em> <span style="font-size:10px; opacity:0.6; margin-left:6px;">${timeStr}</span>`;
    row.appendChild(systemBubble);
  } else {
    const isMe = msgUser === username;
    if (isMe) row.classList.add('me');

    const header = document.createElement('div');
    header.className = 'filmsync-msg-header';
    header.innerHTML = `
      <span class="filmsync-msg-user">${msgUser}</span>
      <span class="filmsync-msg-time">${timeStr}</span>
    `;

    const bubble = document.createElement('div');
    bubble.className = 'filmsync-msg-bubble';
    bubble.textContent = message;

    row.appendChild(header);
    row.appendChild(bubble);
  }

  messageList.appendChild(row);
  messageList.scrollTop = messageList.scrollHeight;
}

function sendEmojiReaction(emoji) {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/reactions`).push({
    emoji,
    senderId: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

function spawnFlyingEmoji(emoji) {
  if (!reactionContainer) return;
  
  const el = document.createElement('div');
  el.className = 'flying-emoji';
  el.textContent = emoji;
  
  const randomLeft = Math.random() * 80 + 10;
  el.style.left = `${randomLeft}%`;
  
  reactionContainer.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function updateUsersDisplay(usersList) {
  const countEl = document.getElementById('fs-user-count');
  const listContainer = document.getElementById('fs-users-list');
  
  if (countEl) countEl.textContent = usersList.length;
  
  if (listContainer) {
    listContainer.innerHTML = '';
    usersList.forEach(u => {
      const badge = document.createElement('div');
      badge.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255,255,255,0.06);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        color: #fff;
        border: 1px solid rgba(255,255,255,0.1);
      `;
      badge.innerHTML = `
        <span>${u.avatar || '🍿'}</span>
        <span style="font-weight: 600;">${u.username}</span>
        ${u.isBuffering ? '<span style="color: #ff9f43; font-size: 10px;">⏳</span>' : ''}
      `;
      listContainer.appendChild(badge);
    });
  }
}

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  
  const style = document.createElement('style');
  style.textContent = `
    body.filmsync-sidebar-open {
      width: calc(100vw - 270px) !important;
      margin-right: 270px !important;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      position: relative !important;
    }
    
    #filmsync-mini-toolbar {
      position: fixed !important;
      right: 12px !important;
      top: 25% !important;
      width: 44px;
      background: rgba(20, 20, 20, 0.85) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 22px;
      padding: 6px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    #filmsync-mini-toolbar.panel-active {
      right: 282px !important;
    }
    .filmsync-tool-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }
    .filmsync-tool-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.08);
    }
    .filmsync-tool-btn.tp-logo {
      background: linear-gradient(135deg, #e50914, #ff3d47) !important;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4);
    }
    .filmsync-tool-btn.tp-logo svg {
      fill: #fff !important;
    }
    .filmsync-tool-btn svg {
      width: 18px;
      height: 18px;
      fill: #ccc;
      transition: fill 0.2s;
    }
    .filmsync-tool-btn:hover svg {
      fill: #fff;
    }

    #filmsync-sidebar {
      position: fixed !important;
      top: 0 !important;
      right: -270px !important;
      width: 270px !important;
      height: 100vh !important;
      background: #0d0d11 !important;
      border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
      z-index: 2147483646 !important;
      display: flex !important;
      flex-direction: column !important;
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.8) !important;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      color: #fff !important;
    }
    #filmsync-sidebar.active {
      transform: translateX(-270px) !important;
    }

    .fs-header {
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .fs-title {
      font-weight: 800;
      font-size: 15px;
      color: #ff3d47;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .fs-close-btn {
      background: transparent;
      border: none;
      color: #888;
      font-size: 18px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .fs-close-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    .fs-users-bar {
      padding: 10px 16px;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 80px;
      overflow-y: auto;
    }

    #filmsync-messages {
      flex: 1 !important;
      padding: 14px 16px !important;
      overflow-y: auto !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      background: #0d0d11 !important;
    }
    .filmsync-msg-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 90%;
      align-self: flex-start;
    }
    .filmsync-msg-row.me {
      align-self: flex-end;
    }
    .filmsync-msg-row.system {
      align-self: center;
      max-width: 100%;
      text-align: center;
    }
    .filmsync-msg-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #888;
    }
    .filmsync-msg-row.me .filmsync-msg-header {
      justify-content: flex-end;
    }
    .filmsync-msg-user {
      font-weight: 700;
      color: #ff3d47;
    }
    .filmsync-msg-row.me .filmsync-msg-user {
      color: #2ed573;
    }
    .filmsync-msg-bubble {
      background: rgba(255, 255, 255, 0.06);
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      word-break: break-word;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .filmsync-msg-row.me .filmsync-msg-bubble {
      background: #ff3d47;
      color: #fff;
      border: none;
    }
    .filmsync-msg-row.system .filmsync-msg-bubble {
      background: rgba(255, 255, 255, 0.03);
      color: #aaa;
      font-size: 11px;
      border-radius: 20px;
      padding: 4px 12px;
    }

    .fs-reactions-bar {
      padding: 8px 12px;
      display: flex;
      justify-content: space-around;
      background: rgba(0, 0, 0, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    .fs-emoji-btn {
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.15s ease;
      padding: 4px;
    }
    .fs-emoji-btn:hover {
      transform: scale(1.3);
    }

    .fs-footer {
      padding: 12px 14px;
      background: rgba(20, 20, 24, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #fs-input-msg {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 8px 14px;
      color: #fff;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    #fs-input-msg:focus {
      border-color: #ff3d47;
    }
    #fs-btn-send {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #ff3d47;
      border: none;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }
    #fs-btn-send:hover {
      background: #ff525d;
    }

    #filmsync-reaction-overlay {
      position: fixed;
      top: 0;
      right: 0;
      width: 270px;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
      overflow: hidden;
    }
    .flying-emoji {
      position: absolute;
      bottom: 60px;
      font-size: 28px;
      animation: fly-up 3.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      opacity: 1;
    }
    @keyframes fly-up {
      0% { transform: translateY(0) scale(0.5); opacity: 1; }
      50% { opacity: 1; }
      100% { transform: translateY(-80vh) scale(1.2); opacity: 0; }
    }
  `;

  root.appendChild(style);

  const miniToolbar = document.createElement('div');
  miniToolbar.id = 'filmsync-mini-toolbar';
  miniToolbar.innerHTML = `
    <button class="filmsync-tool-btn tp-logo" id="fs-tool-toggle-chat" data-tooltip="Sohbeti Aç/Kapat">
      <svg viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H9l2 4H8L6 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
    </button>
  `;
  root.appendChild(miniToolbar);

  const sidebar = document.createElement('div');
  sidebar.id = 'filmsync-sidebar';
  sidebar.innerHTML = `
    <div class="fs-header">
      <div class="fs-title">
        <span>🍿 Evo & Beko</span>
        <span style="font-size: 10px; background: rgba(255,61,71,0.2); color: #ff3d47; padding: 2px 6px; border-radius: 10px;">PREMIUM</span>
      </div>
      <button class="fs-close-btn" id="fs-btn-close">✕</button>
    </div>
    
    <div class="fs-users-bar" id="fs-users-list"></div>

    <div id="filmsync-messages"></div>

    <div class="fs-reactions-bar">
      <button class="fs-emoji-btn" data-emoji="👍">👍</button>
      <button class="fs-emoji-btn" data-emoji="😮">😮</button>
      <button class="fs-emoji-btn" data-emoji="😢">😢</button>
      <button class="fs-emoji-btn" data-emoji="😂">😂</button>
      <button class="fs-emoji-btn" data-emoji="🔥">🔥</button>
    </div>

    <div class="fs-footer">
      <input type="text" id="fs-input-msg" placeholder="Mesaj yazın..." />
      <button id="fs-btn-send">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;
  root.appendChild(sidebar);

  const overlay = document.createElement('div');
  overlay.id = 'filmsync-reaction-overlay';
  root.appendChild(overlay);

  document.body.appendChild(root);

  chatPanel = sidebar;
  messageInput = document.getElementById('fs-input-msg');
  messageList = document.getElementById('filmsync-messages');
  reactionContainer = overlay;

  document.getElementById('fs-tool-toggle-chat').addEventListener('click', () => toggleChatPanel());
  document.getElementById('fs-btn-close').addEventListener('click', () => toggleChatPanel());

  document.getElementById('fs-btn-send').addEventListener('click', sendChatMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
    }
  });

  document.querySelectorAll('.fs-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      if (emoji) sendEmojiReaction(emoji);
    });
  });

  document.addEventListener('keydown', handleGlobalEnterKey, true);

  if (messagesQueue.length > 0) {
    messagesQueue.forEach(msg => appendMessage(msg));
    messagesQueue = [];
  }

  if (db && roomId) {
    renderedMessageKeys.clear();
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).once('value').then((snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        if (messageList) messageList.innerHTML = '';
        Object.entries(messages).forEach(([key, msg]) => {
          if (!renderedMessageKeys.has(key)) {
            renderedMessageKeys.add(key);
            appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });
          }
        });
      }
    });
  }

  toggleChatPanel();
}

// --- 🌐 FIREBASE SENKRONİZASYON VE MEDYA MOTORU ---

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

    if (window === window.top) {
      if (state.senderId !== userId && state.url && state.url !== window.location.href) {
        const normalizedCurrent = window.location.href.split('?')[0].replace(/\\/$/, '');
        const normalizedState = state.url.split('?')[0].replace(/\\/$/, '');
        if (normalizedCurrent !== normalizedState && !isEmbedUrl(state.url)) {
          if (window.filmsyncDismissedUrl !== state.url) {
            showMovieRedirectBanner(state.url);
          }
        }
      }
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

      if (usersData) {
        Object.values(usersData).forEach(u => {
          if (u.username) {
            usersList.push(u);
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
    showMovieRedirectNotification(state.url);
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
      console.error('[FilmSync] Medya eşitleme hatası:', e);
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

// GİTHUB DAVET LİNKİ VE BAŞLATMA
init();

function init() {
  if (window === window.top && window.location.href.includes('github.com/bekircansnk/filmsync-watch-party')) {
    const urlParams = new URLSearchParams(window.location.search);
    const joinRoom = urlParams.get('join');
    const joinPass = urlParams.get('pass') || '';

    if (joinRoom) {
      if (document.getElementById('filmsync-autojoin-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'filmsync-autojoin-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(10,10,14,0.94);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
      overlay.innerHTML = `
        <div style="background:#181820;border:1px solid rgba(255,255,255,0.12);padding:30px;border-radius:20px;width:340px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.8);">
          <div style="font-size:42px;margin-bottom:12px;">🍿</div>
          <div style="font-size:20px;font-weight:800;color:#ff3d47;margin-bottom:6px;">FilmSync Watch Party</div>
          <div style="font-size:13px;color:#aaa;margin-bottom:20px;">Odaya Katılmak İçin Takma Adınızı Girin</div>
          <div style="margin-bottom:15px;text-align:left;">
            <label style="font-size:11px;color:#888;font-weight:700;display:block;margin-bottom:5px;">TAKMA ADINIZ</label>
            <input type="text" id="fs-join-username" placeholder="Örn: Ahmet" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);padding:10px 14px;border-radius:10px;color:#fff;font-size:14px;outline:none;" />
          </div>
          <button id="fs-btn-autojoin" style="width:100%;background:linear-gradient(135deg,#ff3d47,#e50914);color:#fff;border:none;padding:12px;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;box-shadow:0 8px 20px rgba(255,61,71,0.4);transition:all 0.2s;">Partiye Katıl 🚀</button>
        </div>
      `;
      document.body.appendChild(overlay);

      const userInput = document.getElementById('fs-join-username');
      const joinBtn = document.getElementById('fs-btn-autojoin');
      userInput.focus();

      chrome.storage.local.get(['username'], (res) => {
        if (res.username) userInput.value = res.username;
      });

      const executeJoin = () => {
        const nameVal = userInput.value.trim() || 'Misafir';
        const myUserId = 'user_' + Math.random().toString(36).substr(2, 9);
        joinBtn.textContent = 'Odaya Bağlanılıyor...';
        joinBtn.style.opacity = '0.7';

        const tempDb = firebase.initializeApp(firebaseConfig, 'tempJoinApp_' + Date.now()).database();
        tempDb.ref(`rooms/${joinRoom}/lastState`).once('value').then((snapshot) => {
          const state = snapshot.val();
          let targetUrl = (state && state.url) ? state.url : '';
          
          if (!targetUrl || isEmbedUrl(targetUrl)) {
            targetUrl = 'https://www.hdfilmcehennemi.nl/';
          }

          chrome.storage.local.set({
            roomId: joinRoom,
            username: nameVal,
            password: joinPass,
            userId: myUserId
          }, () => {
            if (targetUrl) {
              window.location.href = targetUrl;
            }
          });
        });
      };

      joinBtn.addEventListener('click', executeJoin);
      userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeJoin();
      });
      return;
    }
  }

  chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar'], (result) => {
    if (result.roomId) {
      roomId = result.roomId;
      username = result.username || 'Anonim';
      password = result.password || '';
      selectedAvatar = result.selectedAvatar || '🍿';
      
      if (result.userId) {
        userId = result.userId;
      } else {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ userId });
      }
      
      console.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
      
      initializeFirebase(firebaseConfig);
      if (window === window.top) {
        createChatUI();
        startUIKeeper();
      }
      
      startVideoTracking();
      startDriftCorrection();
    } else {
      removeChatUI();
    }
  });
}

window.addEventListener('beforeunload', () => {
  if (roomId && isFirebaseInitialized && window === window.top) {
    removeVideoListeners();
    chrome.runtime.sendMessage({
      type: 'page-unload',
      roomId: roomId,
      username: username,
      userId: userId
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings-updated' || message.type === 'force-sync') {
    console.log('[FilmSync] Popup mesajı alındı, bağlantı yenileniyor.');
    init();
    sendResponse({ status: 'success' });
  } else if (message.type === 'leave-room') {
    console.log('[FilmSync] Odadan ayrıl mesajı alındı.');
    leaveRoom();
    sendResponse({ status: 'success' });
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.roomId || changes.username || changes.password) {
      console.log('[FilmSync Storage] Depolama değişti, arayüz güncelleniyor.');
      cleanupFirebase();
      isFirebaseInitialized = false;
      
      chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar'], (result) => {
        roomId = result.roomId;
        username = result.username || 'Anonim';
        password = result.password || '';
        selectedAvatar = result.selectedAvatar || '🍿';
        
        if (result.userId) userId = result.userId;

        if (roomId) {
          initializeFirebase(firebaseConfig);
          if (window === window.top) {
            if (!document.getElementById('filmsync-root')) {
              createChatUI();
              startUIKeeper();
            }
          }
          startVideoTracking();
        } else {
          removeChatUI();
        }
      });
    }
  }
});
