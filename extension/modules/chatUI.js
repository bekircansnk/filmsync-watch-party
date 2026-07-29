// FilmSync Teleparty Uyumlu Sohbet ve Kontrol Paneli Modülü

let chatPanel = null;
let messageInput = null;
let messageList = null;
let chatBtn = null;
let chatCount = null;
let reactionContainer = null;
let messagesQueue = [];
let renderedMessageKeys = new Set();

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
    /* Body & Teleparty Dikey Layout Kaydırma */
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
    <button class="filmsync-tool-btn tp-logo" id="fs-tool-logo" data-tooltip="FilmSync Watch Party">
      <svg viewBox="0 0 24 24"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H9l2 4H8L6 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>
    </button>
    <button class="filmsync-tool-btn" id="fs-tool-toggle-chat" data-tooltip="Sohbeti Göster">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
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
    
    <div class="fs-users-bar" id="fs-users-list">
      <!-- Kullanıcı rozetleri buraya dinamik eklenir -->
    </div>

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

  document.getElementById('fs-tool-logo').addEventListener('click', () => {
    toggleChatPanel();
  });

  document.getElementById('fs-tool-toggle-chat').addEventListener('click', () => {
    toggleChatPanel();
  });

  document.getElementById('fs-btn-close').addEventListener('click', () => {
    toggleChatPanel();
  });

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

  // Varsayılan olarak paneli açık ve aktif başlat
  toggleChatPanel();
}
