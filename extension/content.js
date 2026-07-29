// FilmSync Watch Party Content Script (Ana Giriş Noktası)

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

let pendingState = null;

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

// Oynatıcının Hazır Olmasını Bekleyen Yardımcı Fonksiyon
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

// Eklenti Giriş Noktası
init();

function init() {
  // GİTHUB DAVET LİNKİ KONTROLÜ (İsim Giriş Modal Destekli)
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

  // Normal Başlatma (Herhangi bir IPC engeline takılmaksızın doğrudan storage okunur)
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
      setupFullscreenListener();
      setupFullscreenIdleDetector();
      startIframeFullscreenKeeper();
    } else {
      removeChatUI();
    }
    
    startButtonObserver();
  });
}

// Sayfa Yenilenirken Veya Kapanırken Bildir
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

// Popup Mesaj Dinleyicisi
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

// Canlı Depolama Değişikliği Dinleyicisi
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

// Tam Ekran Dinleyicileri
function setupFullscreenListener() {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
}

function handleFullscreenChange() {
  const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  const sidebar = document.getElementById('filmsync-sidebar');
  
  if (isFS) {
    if (miniToolbar) miniToolbar.style.zIndex = '2147483647';
    if (sidebar) sidebar.style.zIndex = '2147483646';
  }
}

let idleTimer = null;
function setupFullscreenIdleDetector() {
  const resetTimer = () => resetIdleTimer(3000);
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('click', resetTimer);
  window.addEventListener('keydown', resetTimer);
}

function resetIdleTimer(delay = 3000) {
  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  const sidebar = document.getElementById('filmsync-sidebar');

  if (miniToolbar) miniToolbar.style.opacity = '1';
  if (sidebar) sidebar.style.opacity = '1';

  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const isChatOpen = sidebar && sidebar.classList.contains('active');
    
    if (isFS && !isChatOpen) {
      if (miniToolbar) miniToolbar.style.opacity = '0';
    }
  }, delay);
}

function startIframeFullscreenKeeper() {
  setInterval(() => {
    const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (!isFS) {
      const root = document.getElementById('filmsync-root');
      if (root && window !== window.top) {
        removeChatUI();
      }
    }
  }, 1000);
}

function startButtonObserver() {
  if (!window.location.host.includes('netflix.com')) return;
  const observer = new MutationObserver(() => {
    injectNetflixWatchPartyButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function injectNetflixWatchPartyButton() {
  if (document.getElementById('filmsync-netflix-btn')) return;
  const targetContainer = document.querySelector('.watch-party-btn-container') || document.querySelector('.hero-image-wrapper') || document.querySelector('.jawBoneContainer');
  if (targetContainer) {
    const btn = document.createElement('button');
    btn.id = 'filmsync-netflix-btn';
    btn.style.cssText = 'background:#ff3d47;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;cursor:pointer;margin:10px;';
    btn.textContent = '🍿 FilmSync Partisi Başlat';
    btn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'open-popup' });
    });
    targetContainer.appendChild(btn);
  }
}
