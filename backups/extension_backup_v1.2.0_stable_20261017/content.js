// Film Partisi (Teleparty Clone) 🍿
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
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;

let isFirebaseInitialized = false;
let renderedMessageKeys = new Set();
let pendingState = null;
let isFirstSync = true;
let messagesQueue = [];
let isInputFocused = false;
let lastTypingTime = 0;

// Zaman ve Senkronizasyon Korumaları
let serverTimeOffset = 0;
let lastProgrammaticSeekTime = -1;
let lastProgrammaticSeekTimestamp = 0;
let isProgrammaticSeeking = false;
let userSeekDebounceTimer = null;
let syncSafetyTimer = null;
let isFullscreenListenersAttached = false;
let isFullscreenIdleDetectorAttached = false;
let lastMouseMoveTime = 0;
let videoTrackingInterval = null;
let driftCorrectionInterval = null;
let uiKeeperInterval = null;
let iframeKeeperInterval = null;
let netflixButtonObserver = null;
let netflixButtonDebounceTimer = null;
let bufferingDebounceTimer = null;
let currentBufferingState = false;
let heartbeatInterval = null;
let lastPingRTT = null;
let lastEscapeTime = 0;

// --- 🔊 WEB AUDIO API SES MOTORU (Sıfır Harici Dosya) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = true;
    return true;
  }

  // 1. Mesaj Gönderimi: Hafif ve net dokunma sesi
  playSendTap() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  // 2. Mesaj Alımı: Yumuşak su damlası / baloncuk tonu
  playMessageBubble() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  // 3. Emoji Reaksiyon: Dingin ve tatlı 3-ses akoru (C5 Majör)
  playReactionChord() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = this.ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.1, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.35);
      });
    } catch(e) {}
  }
}
const soundEffects = new SoundEffects();

// --- 📡 15s HEARTBEAT VE SIFIR-MALİYET CANLI RTT (PİNG) MOTORU ---
function startHeartbeat(userRef) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  const sendHeartbeat = () => {
    if (!db || !roomId || !userId) return;
    const tReq = Date.now();
    userRef.update({
      lastActive: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      const rtt = Date.now() - tReq;
      lastPingRTT = rtt;
      updatePingIndicator(rtt);
    }).catch(err => {
      console.warn('[FilmSync Heartbeat] Hata:', err);
    });
  };

  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 15000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function updatePingIndicator(rtt) {
  if (typeof rtt === 'number' && !isNaN(rtt)) {
    lastPingRTT = Math.max(0, Math.round(rtt));
  }
}

function getEstimatedServerTime() {
  return Date.now() + serverTimeOffset;
}

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

// Netflix, Disney+ ve YouTube için inject.js scriptini enjekte et (Sayfa bağlamına erişim için)
const shouldInject = window.location.host.includes('netflix.com') || 
                     window.location.host.includes('disneyplus.com') || 
                     window.location.host.includes('youtube.com');

if (shouldInject && window === window.top) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);
  console.log('[FilmSync] Player entegrasyon scripti enjekte edildi.');
}

// Oynatıcı Adaptörü (Farklı siteleri tek arayüzden kontrol etmek için)
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (videoElement) {
      videoElement.play();
    }
  },

  pause: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (videoElement) {
      videoElement.pause();
    }
  },

  seek: (seconds) => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (videoElement) {
      videoElement.currentTime = seconds;
    }
  }
};

function toggleVideoPlayPause() {
  const vid = videoElement || document.querySelector('video');
  if (vid) {
    if (vid.paused) {
      PlayerAdapter.play();
    } else {
      PlayerAdapter.pause();
    }
    return true;
  } else if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
    if (lastKnownState && lastKnownState.isPlaying) {
      PlayerAdapter.pause();
    } else {
      PlayerAdapter.play();
    }
    return true;
  }
  return false;
}

// Film URL'lerini platform bazlı kanonik hale getiren motor
function normalizeMovieUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    // Netflix: Sadece /watch/ID kısmını al, tüm trackId, tctx vb. parametreleri temizle!
    const netflixMatch = parsed.pathname.match(/\/watch\/(\d+)/);
    if (parsed.hostname.includes('netflix.com') && netflixMatch) {
      return `https://www.netflix.com/watch/${netflixMatch[1]}`;
    }
    // YouTube: v parametresini al
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const v = parsed.pathname.replace(/^\//, '');
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }
    // Disney+: Sadece /video/ID kısmını al
    const disneyMatch = parsed.pathname.match(/\/video\/([a-zA-Z0-9-]+)/);
    if (parsed.hostname.includes('disneyplus.com') && disneyMatch) {
      return `https://www.disneyplus.com/video/${disneyMatch[1]}`;
    }
    // Genel video siteleri: query ve hash'i kırp, trailing slash temizle
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch (e) {
    return url.split('?')[0].split('#')[0].replace(/\/$/, '');
  }
}

// İki URL'nin aynı filme/bölüme ait olup olmadığını doğrulayan karşılaştırıcı
function areUrlsSameMovie(url1, url2) {
  if (!url1 || !url2) return false;
  if (url1 === url2) return true;
  const n1 = normalizeMovieUrl(url1);
  const n2 = normalizeMovieUrl(url2);
  return !!(n1 && n2 && n1 === n2);
}

// Yalnızca geçerli film/dizi oynatma sayfalarını belirleyen koruma filtresi
function isMovieWatchUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (u.includes('hdfilmcehennemi')) return true;
  if (u.includes('dizipal')) return true;
  if (u.includes('netflix.com/watch')) return true; // Sadece aktif video izleme sayfası! (browse/title fragmanları atlanır)
  if (u.includes('youtube.com/watch')) return true;
  if (u.includes('disneyplus.com/video/')) return true;
  if (u.includes('primevideo.com/detail') || u.includes('primevideo.com/watch')) return true;
  if (u.includes('blutv.com') || u.includes('exxen.com') || u.includes('gain.tv') || u.includes('todtv.com.tr')) return true;
  return false;
}

// Platform Oynatıcı API Hazır Olma Durumu (Netflix Cadmium / inject.js)
let isPlatformPlayerReady = !PlayerAdapter.isNetflix(); // Netflix için false, diğerlerinde true

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data) return;
  if (event.data.source === 'filmsync-inject' && event.data.action === 'player-ready') {
    console.log('[FilmSync Content] Injected scriptten player-ready sinyali alındı:', event.data.platform);
    isPlatformPlayerReady = true;
  }
});

// Sayfa yüklendiğinde başlat
init();

function init() {
  // GİTHUB VE WEB LANDİNG DAVET LİNKİ KONTROLÜ (İsim Giriş Modal Destekli)
  const isLandingOrGithub = window.location.href.includes('github.com/bekircansnk/filmsync-watch-party') || 
                            window.location.href.includes('bekircansnk.github.io/filmsync-watch-party') ||
                            (document.title && document.title.includes('Film Partisi 🍿 | Birlikte Film İzleyin'));
  if (window === window.top && isLandingOrGithub) {
    document.documentElement.setAttribute('data-filmsync-installed', 'true');
    window.dispatchEvent(new CustomEvent('filmsync-extension-installed'));

    const urlParams = new URLSearchParams(window.location.search);
    const joinRoom = urlParams.get('join');
    const joinPass = urlParams.get('pass') || '';

    if (joinRoom) {
      showNamePromptModal(joinRoom, (enteredName) => {
        showAutoJoinOverlay(joinRoom);
        
        // Kendi sekme ID'mizi alıp activeTabId olarak kaydet
        chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
          const myTabId = tabResponse ? tabResponse.tabId : null;
          
          chrome.storage.local.get(['userId'], (uRes) => {
            const newUserId = (uRes && uRes.userId) ? uRes.userId : ('user_' + Math.random().toString(36).substr(2, 9));
            
            chrome.storage.local.set({ 
              roomId: joinRoom, 
              username: enteredName, 
              password: joinPass, 
              userId: newUserId,
              activeTabId: myTabId
            }, () => {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            const tempDb = firebase.database();
            tempDb.ref(`rooms/${joinRoom}/lastState`).once('value').then((snapshot) => {
              const state = snapshot.val();
              if (state && state.url) {
                const cleanTargetUrl = normalizeMovieUrl(state.url);
                setTimeout(() => {
                  chrome.runtime.sendMessage({ type: 'redirect-tab', url: cleanTargetUrl });
                }, 1000);
              } else {
                alert('Bu odada aktif bir film izlenmiyor veya oda bulunamadı.');
                document.getElementById('filmsync-autojoin-overlay')?.remove();
              }
            });
          });
        });
      });
      });
      return;
    }
  }

  // Normal Başlatma
  const processStoredSettings = (myTabId) => {
    chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId', 'hostId'], (result) => {
      if (result.roomId) {
        // Aktif Sekme İzolasyonu: Farklı sekmelerde mükerrer çalışmayı önle
        if (result.activeTabId && myTabId !== null && myTabId !== result.activeTabId) {
          // Film sekmesindeysek (video izleme sayfası veya video elementi varsa) pasife almak yerine
          // activeTabId'yi bu sekmeye güncelle (Tab Recovery)!
          const isWatch = isMovieWatchUrl(window.location.href) || !!document.querySelector('video');
          if (isWatch) {
            console.log(`[FilmSync Kurtarma] Film sekmesi aktif sekme olarak üstleniliyor: ${myTabId}`);
            chrome.storage.local.set({ activeTabId: myTabId });
          } else {
            console.log(`[FilmSync İzolasyon] Eklenti bu sekmede pasif. Aktif Sekme ID: ${result.activeTabId}, Bu Sekme ID: ${myTabId}`);
            removeChatUI();
            cleanupFirebase();
            return;
          }
        }
        if (!result.activeTabId && myTabId !== null) {
          chrome.storage.local.set({ activeTabId: myTabId });
        }

        roomId = result.roomId;
        username = result.username || 'Anonim';
        password = result.password || '';
        selectedAvatar = result.selectedAvatar || '🍿';
        if (result.hostId) hostId = result.hostId;
        
        if (result.userId) {
          userId = result.userId;
        } else {
          userId = 'user_' + Math.random().toString(36).substr(2, 9);
          chrome.storage.local.set({ userId });
        }
        
        console.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
        
        // Iframe spam'ini önle: Başlangıçta sadece Top Window bağlansın.
        if (window === window.top) {
          initializeFirebase(firebaseConfig);
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
      
      // Netflix detay sayfaları için buton enjeksiyonunu başlat
      startButtonObserver();
    });
  };

  try {
    chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
      if (chrome.runtime.lastError) {
        processStoredSettings(null);
        return;
      }
      processStoredSettings(tabResponse ? tabResponse.tabId : null);
    });
  } catch (err) {
    processStoredSettings(null);
  }
}

// Sayfa yenilenirken veya kapanırken durum güncellemesi tetikle (REST API üzerinden Service Worker ile çalışır)
window.addEventListener('beforeunload', () => {
  if (roomId && isFirebaseInitialized && window === window.top) {
    // Sayfa kapanırken oynatıcı eventlerinin tetiklenmesini önlemek için dinleyicileri derhal kaldır
    removeVideoListeners();

    // Sadece gerçek film izleme sayfasındaysak ve video başladıysa (> 1s) süreyi ilet.
    // Browse sayfalarındaki fragmanların veya başlangıç aşamasındaki videoların odayı duraklatmasını engelle.
    const hasActiveVideo = !!document.querySelector('video');
    const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                              window.location.href.includes('netflix.com/title') || 
                              window.location.href.includes('youtube.com/feed');
    const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo);
    const currentT = (isWatchPage && videoElement && typeof videoElement.currentTime === 'number' && videoElement.currentTime > 1.0)
      ? videoElement.currentTime
      : -1;

    chrome.runtime.sendMessage({
      type: 'page-unload',
      roomId: roomId,
      username: username,
      userId: userId,
      currentTime: currentT,
      isHost: (userId === hostId)
    });
  }
});

// Storage ve Popup Mesaj Dinleyicileri
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings-updated') {
    // Yalnızca oda gerçekten farklıysa veya henüz bağlanılmamışsa tam init çalıştır
    chrome.storage.local.get(['roomId'], (res) => {
      if (res.roomId && res.roomId !== roomId) {
        init();
      }
    });
    sendResponse({ status: 'success' });
  } else if (message.type === 'force-sync') {
    forceSync();
    sendResponse({ status: 'success' });
  } else if (message.type === 'leave-room') {
    removeChatUI();
    cleanupFirebase(true);
    sendResponse({ status: 'success' });
  }
});

// Canlı Depolama Değişikliği Dinleyicisi (Iframe'ler ve Üst Sayfa Eşleşmesi İçin)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    const roomChanged = changes.roomId && (changes.roomId.oldValue !== changes.roomId.newValue);
    const userChanged = changes.userId && (changes.userId.oldValue !== changes.userId.newValue);
    const activeTabChanged = changes.activeTabId && (changes.activeTabId.oldValue !== changes.activeTabId.newValue);

    if (roomChanged || userChanged || activeTabChanged) {
      console.log('[FilmSync Storage] Depolama değişikliği algılandı, oda ayarları yenileniyor.');
      
      // Yalnızca oda gerçekten değiştiyse ve eski bir oda varsa Firebase dinleyicilerini temizle
      if (roomChanged && changes.roomId.oldValue) {
        cleanupFirebase(false);
        isFirebaseInitialized = false;
      }
      
      const handleStorageUpdate = (myTabId) => {
        chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId', 'hostId'], (result) => {
          if (result.activeTabId && myTabId !== null && myTabId !== result.activeTabId) {
            const isWatch = isMovieWatchUrl(window.location.href) || !!document.querySelector('video');
            if (isWatch) {
              console.log(`[FilmSync Kurtarma Storage] Film sekmesi aktif sekme olarak üstleniliyor: ${myTabId}`);
              chrome.storage.local.set({ activeTabId: myTabId });
            } else {
              console.log(`[FilmSync İzolasyon Storage] Eklenti bu sekmede pasif hale getiriliyor.`);
              removeChatUI();
              return;
            }
          }
          if (!result.activeTabId && myTabId !== null) {
            chrome.storage.local.set({ activeTabId: myTabId });
          }

          roomId = result.roomId;
          username = result.username || 'Anonim';
          password = result.password || '';
          selectedAvatar = result.selectedAvatar || '🍿';
          if (result.hostId) hostId = result.hostId;
          
          if (result.userId) userId = result.userId;

          if (roomId) {
            console.log(`[FilmSync Storage] Yeni oda bağlantısı tetikleniyor: ${roomId}`);
            if (window === window.top) {
              initializeFirebase(firebaseConfig);
              createChatUI();
              startUIKeeper();
            }
            startVideoTracking();
            startDriftCorrection();
            setupFullscreenListener();
            setupFullscreenIdleDetector();
            startIframeFullscreenKeeper();
            
            if (videoElement) {
              forceSync();
            }
          } else {
            removeChatUI();
          }
        });
      };

      try {
        chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
          if (chrome.runtime.lastError) {
            handleStorageUpdate(null);
            return;
          }
          handleStorageUpdate(tabResponse ? tabResponse.tabId : null);
        });
      } catch (err) {
        handleStorageUpdate(null);
      }
    }
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
    
    // Sunucu ve istemci arasındaki saat farkını (clock skew) otomatik düzelt
    db.ref('.info/serverTimeOffset').on('value', (snap) => {
      serverTimeOffset = snap.val() || 0;
    });

    const roomRef = db.ref(`rooms/${roomId}`);
    
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      const hasActiveVideo = !!document.querySelector('video');
      const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                                window.location.href.includes('netflix.com/title') || 
                                window.location.href.includes('youtube.com/feed');
      const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo);
      const hasVideo = hasActiveVideo && isWatchPage;
      
      if (roomData) {
        if (roomData.password && roomData.password !== password) {
          alert('Hatalı oda şifresi girdiniz.');
          removeChatUI();
          cleanupFirebase();
          return;
        }
        
        // Eğer odaya giren kişi oda sahibi (host) ise ve geçerli bir video sayfasındaysa oda durumunu güncellesin.
        // F5 ile yenilemelerde veya tekrar girişlerde mevcuttaki lastState durumunu sıfırlamak yerine koruyacağız!
        // Sadece Firebase'de henüz lastState yoksa (veya url tanımsızsa) ve gerçek bir izleme sayfasındaysak durum başlatılmalıdır.
        if (roomData.hostId === userId && window === window.top && isWatchPage && hasVideo) {
          db.ref(`rooms/${roomId}/lastState`).once('value').then((stateSnap) => {
            const currentState = stateSnap.val();
            // Eğer Firebase'de zaten geçerli bir lastState varsa ve url bizim şu anki url ile aynı filme aitse, sıfırlama yapma!
            if (currentState && areUrlsSameMovie(currentState.url, window.location.href)) {
              console.log('[FilmSync] Host yenileme algılandı, mevcut oda durumu korunuyor:', currentState);
            } else {
              // Oda yeni kuruluyorsa veya farklı filme geçildiyse durum güncellensin (sadece embed adresi değilse)
              const validUrl = (!isEmbedUrl(window.location.href)) ? normalizeMovieUrl(window.location.href) : (currentState?.url || '');
              if (validUrl) {
                db.ref(`rooms/${roomId}/lastState`).update({
                  url: validUrl,
                  isPlaying: false,
                  currentTime: 0,
                  lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                  senderId: userId
                });
              }
            }
          });
        }
      } else {
        if (window === window.top) {
          // Oda ilk kez kurulurken eğer video izleme sayfasındaysak URL ile kur, yoksa boş kur.
          const initialUrl = (hasVideo && isWatchPage && !isEmbedUrl(window.location.href)) ? normalizeMovieUrl(window.location.href) : '';
          roomRef.set({
            password: password,
            hostId: userId,
            hostOnly: false,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: initialUrl,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
        }
      }
      
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP, isBuffering: false, avatar: selectedAvatar });
      userRef.onDisconnect().remove();
      startHeartbeat(userRef);
      
      // Sürekli "odaya katıldı" yazmasını önlemek için sessionStorage kontrolü
      const sessionKey = `joined_${roomId}`;
      if (window === window.top && !sessionStorage.getItem(sessionKey)) {
        sendSystemMessage(`${username} odaya katıldı.`);
        sessionStorage.setItem(sessionKey, 'true');
      }
      
      setupFirebaseListeners();
      forceSync();
      setTimeout(() => {
        isFirstSync = false;
        console.log('[FilmSync] İlk senkronizasyon kilidi zaman aşımıyla kaldırıldı.');
      }, 1500);
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

  // Host Bilgilerini Dinle
  db.ref(`rooms/${roomId}/hostId`).on('value', (snap) => {
    hostId = snap.val();
    if (hostId) chrome.storage.local.set({ hostId });
  });
  db.ref(`rooms/${roomId}/hostOnly`).on('value', (snap) => {
    hostOnly = snap.val();
  });

  // 1. Medya Durumunu Dinle
  db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state) return;
    if (state.senderId === userId) return;

    if (isSyncing) {
      // Kilit aktifken gelen son durumu sıraya al (yutulmasını önle)
      pendingState = state;
      return;
    }

    applyRemoteState(state);
  });

  // 2. Sohbet Mesajlarını Dinle
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).off();
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    if (!msg || renderedMessageKeys.has(key)) return;
    renderedMessageKeys.add(key);

    appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });

    // Bildirim Toast'u ve Ses Efekti (Panel kapalıyken veya idle nedeniyle gizlenmişken tetiklenir)
    // Gelen mesajlar sohbet panelini KESİNLİKLE açmaz; sadece sağ üstte bildirim toastu gösterilir.
    const msgAge = Date.now() - (msg.timestamp || 0);
    const isPanelActive = chatPanel && chatPanel.classList.contains('active');
    const isPanelHidden = chatPanel && (chatPanel.style.opacity === '0' || !isPanelActive);
    const isSelfNormalChat = !msg.isSystem && msg.username === username;
    const isSelfSystemJoinMsg = msg.isSystem && msg.message && typeof msg.message === 'string' && msg.message.startsWith(username) && msg.message.includes('odaya katıldı');

    if (msgAge < 10000 && !isSelfNormalChat && !isSelfSystemJoinMsg) {
      if (!msg.isSystem) {
        soundEffects.playMessageBubble();
      }
      if (!isPanelActive || isPanelHidden) {
        showNotificationToast(msg.isSystem ? 'Film Partisi 🍿' : msg.username, msg.message);
      }
    }
  });

  // 3. Aktif Kullanıcıları ve Buffering Durumlarını Dinle
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

      // Buffering Paneli Yönetimi
      const bufferIndicator = document.getElementById('filmsyncBufferingIndicator');
      const bufferText = document.getElementById('filmsyncBufferingText');
      if (bufferIndicator && bufferText) {
        if (bufferingUsers.length > 0) {
          bufferIndicator.classList.add('active');
          bufferText.textContent = `${bufferingUsers.join(', ')} yükleniyor...`;
        } else {
          bufferIndicator.classList.remove('active');
        }
      }
    });
  }

  // 4. Reaksiyon Emojilerini Dinle
  db.ref(`rooms/${roomId}/reactions`).limitToLast(5).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    // Anlık olarak son 5 saniyede atılmış reaksiyonları göster (Gecikmeli tetiklemeleri önlemek için)
    if (Date.now() - data.timestamp < 5000) {
      spawnFlyingEmoji(data.emoji);
      if (data.senderId !== userId) {
        soundEffects.playReactionChord();
      }
    }
  });
}

// Video elementinin ve platform API'sinin hazır olup olmadığını sorgulayan ve bekleyen mekanizma
function ensureVideoReady(callback, retriesLeft = 25) {
  // Sadece geçerli bir izleme sayfasındaysak video kontrolü yap
  const hasActiveVideo = !!document.querySelector('video');
  const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                            window.location.href.includes('netflix.com/title') || 
                            window.location.href.includes('youtube.com/feed');
  if (isBrowseExclusion || (!isMovieWatchUrl(window.location.href) && !hasActiveVideo)) {
    callback(false);
    return;
  }

  const activeVideo = document.querySelector('video');
  if (activeVideo) videoElement = activeVideo;

  if (PlayerAdapter.isNetflix()) {
    // Netflix'te hem video elementi (HAVE_CURRENT_DATA) hem de inject.js API'si hazır olmalı!
    if (videoElement && videoElement.readyState >= 2 && isPlatformPlayerReady) {
      callback(true);
      return;
    }
    // Injected script'e durum kontrolü için ping at
    window.postMessage({ source: 'filmsync-content', action: 'ping-player' }, '*');
    if (retriesLeft > 0) {
      console.log(`[FilmSync] Netflix oynatıcısının hazır olması bekleniyor... Kalan deneme: ${retriesLeft}`);
      setTimeout(() => {
        ensureVideoReady(callback, retriesLeft - 1);
      }, 300);
      return;
    }
    // Zaman aşımı olsa bile eğer video elementi varsa ve en azından readyState >= 2 ise devam et
    if (videoElement && videoElement.readyState >= 2) {
      console.log('[FilmSync] Netflix API zaman aşımı, video elementiyle devam ediliyor.');
      callback(true);
    } else {
      console.log('[FilmSync] Video elementi zaman aşımına uğradı veya henüz hazır değil.');
      callback(false);
    }
    return;
  }

  if (videoElement && videoElement.readyState >= 1) {
    callback(true);
  } else if (retriesLeft > 0) {
    console.log(`[FilmSync] Video elementinin hazır olması bekleniyor... Kalan deneme: ${retriesLeft}`);
    setTimeout(() => {
      ensureVideoReady(callback, retriesLeft - 1);
    }, 400);
  } else {
    console.log('[FilmSync] Video elementi zaman aşımına uğradı veya bulunamadı.');
    callback(false);
  }
}

// Programatik Senkronizasyon Tamamlayıcı
function finishProgrammaticSync() {
  if (syncSafetyTimer) {
    clearTimeout(syncSafetyTimer);
    syncSafetyTimer = null;
  }
  isSyncing = false;
  isProgrammaticSeeking = false;
  isFirstSync = false;

  // Eğer sırada bekleyen açık bir kullanıcı komutu varsa uygula (stale heartbeat'leri atla)
  if (pendingState) {
    const nextState = pendingState;
    pendingState = null;
    if (nextState.action === 'seek' || nextState.action === 'play' || nextState.action === 'pause') {
      applyRemoteState(nextState);
    }
  }
}

// Programatik Senkronizasyon Yürütücü (Kilit & Döngü Korumalı)
function executeProgrammaticSync(targetSeconds, syncAction) {
  isSyncing = true;
  isProgrammaticSeeking = true;
  lastProgrammaticSeekTime = targetSeconds;
  lastProgrammaticSeekTimestamp = Date.now();

  if (syncSafetyTimer) clearTimeout(syncSafetyTimer);

  try {
    syncAction();
  } catch (err) {
    console.error('[FilmSync] Senkronizasyon çalıştırma hatası:', err);
  }

  syncSafetyTimer = setTimeout(() => {
    finishProgrammaticSync();
  }, 2500);
}

// Uzak Durumu Videoya Uygula
function applyRemoteState(state) {
  if (!state) return;
  
  // Yönlendirme bildirimi (Sadece video adresi gerçekten farklı bir filme aitse ve üst penceredeysek)
  if (state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
    if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
      showMovieRedirectNotification(state.url);
      return;
    }
  }

  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) return;

    // Video buffering veya seeking halindeyse hard seek yapıp CDN buffer'ı tekrar çökertme
    if (videoElement.seeking || videoElement.readyState < 2) {
      console.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      pendingState = state;
      let playableTimer = null;
      const onVideoPlayable = () => {
        if (playableTimer) clearTimeout(playableTimer);
        videoElement.removeEventListener('canplay', onVideoPlayable);
        videoElement.removeEventListener('loadeddata', onVideoPlayable);
        if (pendingState) {
          const s = pendingState;
          pendingState = null;
          applyRemoteState(s);
        }
      };
      videoElement.addEventListener('canplay', onVideoPlayable, { once: true });
      videoElement.addEventListener('loadeddata', onVideoPlayable, { once: true });
      playableTimer = setTimeout(onVideoPlayable, 2000); // 2s safety timeout - asla kilitlenme olmasın
      return;
    }

    const now = getEstimatedServerTime();
    const timeDiff = state.isPlaying ? Math.max(0, (now - (state.lastUpdated || now)) / 1000) : 0;
    const targetTime = state.currentTime + timeDiff;
    const drift = Math.abs(videoElement.currentTime - targetTime);

    // Play/Pause durum kontrolü
    const needsPlay = state.isPlaying && videoElement.paused;
    const needsPause = !state.isPlaying && !videoElement.paused;

    // 1. AÇIK BİR KULLANICI SEEK'İ (action === 'seek')
    if (state.action === 'seek') {
      executeProgrammaticSync(targetTime, () => {
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying && videoElement.paused) PlayerAdapter.play();
        else if (!state.isPlaying && !videoElement.paused) PlayerAdapter.pause();
      });
      return;
    }

    // 2. PLAY EMRİ GELDİ (DURAKLATILMIŞTI, BAŞLATILIYOR)
    if (needsPlay) {
      // 4.5 saniyeye kadar olan sapmalarda ASLA hard seek yapma! Sadece oynat!
      // Bu sayede Netflix CDN buffer'ı sıfırlanmaz, internet tıkanmaz, video donmaz!
      if (drift > 4.5) {
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
          PlayerAdapter.play();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.play();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 3. PAUSE EMRİ GELDİ (OYNATILIYORDU, DURDURULUYOR)
    if (needsPause) {
      // Pause için sapma 0.8s üzerindeyse tam konuma eşitle (desüre sorununu önle)
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
          PlayerAdapter.pause();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.pause();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 4. NORMAL OYNATMA SIRASINDA DURUM (Her iki taraf da oynatıyor)
    if (state.isPlaying && !videoElement.paused) {
      // 6.5 saniye üzerindeki büyük sapmalarda (ör. intro atlama / elle sarma) hard seek ile yetiş
      if (drift > 6.5) {
        console.log(`[FilmSync] Büyük sapma (${drift.toFixed(1)}s), hard seek ile yetişiliyor.`);
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
        });
        return;
      }

      // 3.0 saniye altındaki sapmalar: Tamamen senkron kabul edilir, hiçbir müdahale yapılmaz!
      // İnternet ve CPU tüketimi sıfırlanır, video donmaz ve ses pürüzsüz kalır.
      if (drift <= 3.0) {
        if (!PlayerAdapter.isNetflix() && videoElement.playbackRate !== 1.0) {
          try { videoElement.playbackRate = 1.0; } catch (e) {}
        }
        return;
      }

      // 3.0s - 6.5s arası: Netflix harici HTML5 videolarda çok hafif micro playbackRate (1.03x / 0.97x)
      // Netflix'te Cadmium donanım ses/görüntü senkronizasyonunu bozmamak için playbackRate zorlanmaz
      if (!PlayerAdapter.isNetflix()) {
        const rateFactor = 0.03;
        try {
          videoElement.playbackRate = (videoElement.currentTime < targetTime)
            ? (1.0 + rateFactor)
            : Math.max(0.95, 1.0 - rateFactor);
        } catch (e) {}
      }
      return;
    }

    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
    if (!state.isPlaying && videoElement.paused) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
        });
      }
    }
  });
}

// Zorla Senkronize Et (Debounce korumalı ve akıllı eşitleme)
let forceSyncDebounceTimer = null;
function forceSync() {
  if (forceSyncDebounceTimer) clearTimeout(forceSyncDebounceTimer);
  forceSyncDebounceTimer = setTimeout(() => {
    executeForceSync();
  }, 100);
}

function executeForceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    // Yönlendirme bildirimi (Sadece gerçekten farklı bir filme geçildiyse)
    if (state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
      if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
        showMovieRedirectNotification(state.url);
        return;
      }
    }

    ensureVideoReady((isReady) => {
      if (!isReady || !videoElement) {
        isFirstSync = false;
        return;
      }

      // Oda sahibi isek ve video zaten oynatılıyorsa durumu geriye sarmayalım
      if (userId === hostId && videoElement.currentTime > 0) {
        console.log('[FilmSync] Host için forceSync atlandı, yerel oynatma konumu korunuyor.');
        isFirstSync = false;
        return;
      }

      // Akıllı eşitleme motorunu çalıştır (Gereksiz seek/pause çakışmasını engelle)
      applyRemoteState(state);
      isFirstSync = false;
    });
  });
}

// Bağlantı Temizleme
function cleanupFirebase(isExplicitLeave = false) {
  if (videoTrackingInterval) { clearInterval(videoTrackingInterval); videoTrackingInterval = null; }
  if (driftCorrectionInterval) { clearInterval(driftCorrectionInterval); driftCorrectionInterval = null; }
  if (uiKeeperInterval) { clearInterval(uiKeeperInterval); uiKeeperInterval = null; }
  if (iframeKeeperInterval) { clearInterval(iframeKeeperInterval); iframeKeeperInterval = null; }
  if (netflixButtonObserver) { netflixButtonObserver.disconnect(); netflixButtonObserver = null; }
  if (netflixButtonDebounceTimer) { clearTimeout(netflixButtonDebounceTimer); netflixButtonDebounceTimer = null; }
  if (bufferingDebounceTimer) { clearTimeout(bufferingDebounceTimer); bufferingDebounceTimer = null; }
  if (userSeekDebounceTimer) { clearTimeout(userSeekDebounceTimer); userSeekDebounceTimer = null; }
  if (syncSafetyTimer) { clearTimeout(syncSafetyTimer); syncSafetyTimer = null; }
  if (forceSyncDebounceTimer) { clearTimeout(forceSyncDebounceTimer); forceSyncDebounceTimer = null; }
  stopHeartbeat();
  isProgrammaticSeeking = false;

  if (db && roomId && userId) {
    if (window === window.top && isExplicitLeave) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    if (isExplicitLeave) {
      db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
        db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
          const users = snapshot.val();
          if (!users || Object.keys(users).length === 0) {
            db.ref(`rooms/${roomId}`).remove();
          }
        });
      });
    }

    db.ref(`rooms/${roomId}/lastState`).off();
    db.ref(`rooms/${roomId}/messages`).off();
    db.ref(`rooms/${roomId}/users`).off();
    db.ref(`rooms/${roomId}/reactions`).off();
    db.ref('.info/serverTimeOffset').off();
    
    renderedMessageKeys.clear();
  }
}

// Medya Olayını Gönderme
let lastSentSeekTime = -999;
let lastSentSeekTimestamp = 0;
let lastSentPlayPauseAction = '';
let lastSentPlayPauseTimestamp = 0;

function sendMediaEvent(isPlaying, currentTime, action = 'event') {
  if (!db || !roomId || isSyncing) return;
  isFirstSync = false;
  
  // Sadece host kontrolü aktifse ve ben host değilsem engelle
  if (hostOnly && userId !== hostId) {
    console.log('[FilmSync] Medya kontrolü engellendi: Sadece oda sahibi kontrol edebilir.');
    return;
  }

  // Video izleme sayfası olmayan sayfalardan (ör. Netflix /browse veya YouTube ana sayfa) veritabanına play/pause/seek yazılmasını engelle
  const hasActiveVideo = !!document.querySelector('video');
  const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                            window.location.href.includes('netflix.com/title') || 
                            window.location.href.includes('youtube.com/feed');
  if (isBrowseExclusion || (!isMovieWatchUrl(window.location.href) && !hasActiveVideo)) {
    console.log('[FilmSync] Video izleme sayfası olmayan sayfadan medya olayı gönderilmesi engellendi.');
    return;
  }

  // Video henüz yüklenmediyse (hazır değilse) veya süresi tanımsız ise gönderme
  const activeVideo = videoElement || document.querySelector('video');
  if (activeVideo && (activeVideo.readyState < 1 || isNaN(activeVideo.duration) || activeVideo.duration === 0)) {
    console.log('[FilmSync] Video henüz hazır değil, medya olayı atlanıyor.');
    return;
  }

  // Netflix'te oynatıcı API henüz tam yüklenmemişken gelen sahte play/pause/seek eventlerini engelle
  if (PlayerAdapter.isNetflix() && !isPlatformPlayerReady) {
    return;
  }

  const updatePayload = {
    action,
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  // URL güncelleme yetkisi sadece oda sahibine (host), ana pencereye (window.top) ve gerçek izleme adreslerine aittir.
  if (userId === hostId && window === window.top && (isMovieWatchUrl(window.location.href) || hasActiveVideo) && !isEmbedUrl(window.location.href) && !isBrowseExclusion) {
    updatePayload.url = normalizeMovieUrl(window.location.href);
  }

  const formattedTime = formatTime(currentTime);
  const now = Date.now();
  let msgText = null;

  if (action === 'pause') {
    if (lastSentPlayPauseAction !== 'pause' || (now - lastSentPlayPauseTimestamp > 2000)) {
      msgText = `${username} filmi duraklattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'pause';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'play') {
    const isRightAfterSeek = (now - lastSentSeekTimestamp) < 1000;
    if (!isRightAfterSeek && (lastSentPlayPauseAction !== 'play' || (now - lastSentPlayPauseTimestamp > 2000))) {
      msgText = `${username} filmi başlattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'play';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'seek') {
    const timeDiff = Math.abs(currentTime - lastSentSeekTime);
    if (timeDiff >= 1.0 || (now - lastSentSeekTimestamp > 2000)) {
      msgText = `${username} ${formattedTime} süresine atladı.`;
      lastSentSeekTime = currentTime;
      lastSentSeekTimestamp = now;
    }
  }

  if (msgText) {
    sendSystemMessage(msgText);
  }

  db.ref(`rooms/${roomId}/lastState`).update(updatePayload).catch(err => console.error('[FilmSync] Medya durum yazma hatası:', err));
}

// Videolu Sayfalarda UI Motoru
let lastTrackedLocationHref = window.location.href;

function startVideoTracking() {
  if (videoTrackingInterval) clearInterval(videoTrackingInterval);

  videoTrackingInterval = setInterval(() => {
    // SPA URL Değişimi Kontrolü (Netflix bölüm geçişleri vb.)
    if (window.location.href !== lastTrackedLocationHref) {
      lastTrackedLocationHref = window.location.href;
      console.log('[FilmSync] SPA URL değişimi tespit edildi:', lastTrackedLocationHref);
      if (PlayerAdapter.isNetflix()) {
        isPlatformPlayerReady = false; // Bölüm geçişinde player-ready sinyalini sıfırla
        window.postMessage({ source: 'filmsync-content', action: 'ping-player' }, '*');
      }
    }

    const hasActiveVideo = !!document.querySelector('video');
    const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                              window.location.href.includes('netflix.com/title') || 
                              window.location.href.includes('youtube.com/feed');
    const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo);
    if (!isWatchPage) {
      // Oynatma sayfası değilse (ör. Netflix /browse, YouTube subscriptions), video elementini takip etme
      if (videoElement) {
        removeVideoListeners();
        videoElement = null;
      }
      return;
    }

    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
      
      console.log('[FilmSync] Yeni video elementi tespit edildi.');
      // Sadece misafir için senkronizasyonu tetikle (Host'un mevcut videosunu geri sarmamak için)
      if (userId !== hostId) {
        ensureVideoReady((ready) => {
          if (ready) forceSync();
        });
      }

      // Arayüz oluştur (Sadece top window UI enjekte etsin, iframe'ler UI oluşturmasın!)
      if (!document.getElementById('filmsync-root') && window === window.top) {
        createChatUI();
        startUIKeeper();
      }
      
      // Iframe de olsa Firebase'i başlatsın
      if (window !== window.top) {
        initializeFirebase(firebaseConfig);
      }
    }
  }, 1000);
}

// Akıllı Eşitleme ve Sağlık Denetleyicisi (Heartbeat & Soft Auto-Sync)
function startDriftCorrection() {
  if (driftCorrectionInterval) clearInterval(driftCorrectionInterval);

  driftCorrectionInterval = setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing || isProgrammaticSeeking) return;
    if (videoElement.readyState < 3 || videoElement.seeking) return; // Oynatıcı hazır değil veya buffering/seek halindeyse bekle

    // 1. BEN HOST (ODA SAHİBİ) İSEM: Firebase'deki durumu periyodik güncelle (Heartbeat)
    if (userId === hostId) {
      if (!videoElement.paused) {
        db.ref(`rooms/${roomId}/lastState`).update({
          action: 'heartbeat',
          isPlaying: true,
          currentTime: videoElement.currentTime,
          senderId: userId,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      }
      return;
    }

    // 2. BEN GUEST (KATILAN KİŞİ) İSEM:
    // Firebase on('value') gerçek zamanlı dinleyicisi zaten host heartbeat'lerini anında iletir.
    // Burada sadece yerel videonun olağandışı duraksaması veya aşırı sapmasını kontrol et (Gereksiz Firebase sorgusu yapma)
    return;
  }, 5000);
}

let lastSeekActivityTimestamp = 0;

function setupVideoListeners() {
  if (!videoElement) return;
  videoElement.addEventListener('play', handlePlayEvent);
  videoElement.addEventListener('pause', handlePauseEvent);
  videoElement.addEventListener('seeking', handleSeekingEvent);
  videoElement.addEventListener('seeked', handleSeekEvent);
  videoElement.addEventListener('waiting', handleWaitingEvent);
  videoElement.addEventListener('playing', handlePlayingEvent);
}

function removeVideoListeners() {
  if (!videoElement) return;
  videoElement.removeEventListener('play', handlePlayEvent);
  videoElement.removeEventListener('pause', handlePauseEvent);
  videoElement.removeEventListener('seeking', handleSeekingEvent);
  videoElement.removeEventListener('seeked', handleSeekEvent);
  videoElement.removeEventListener('waiting', handleWaitingEvent);
  videoElement.removeEventListener('playing', handlePlayingEvent);
}

function handleSeekingEvent() {
  if (isSyncing || isProgrammaticSeeking) return;
  lastSeekActivityTimestamp = Date.now();
}

function handlePlayEvent(e) {
  if (isSyncing || isProgrammaticSeeking) return;
  if (videoElement && videoElement.seeking) return;
  if (Date.now() - lastSeekActivityTimestamp < 800) return;

  sendMediaEvent(true, videoElement.currentTime, 'play');
}

function handlePauseEvent(e) {
  if (isSyncing || isProgrammaticSeeking) return;
  if (videoElement && videoElement.seeking) return;
  if (Date.now() - lastSeekActivityTimestamp < 800) return;

  sendMediaEvent(false, videoElement.currentTime, 'pause');
}

function handleSeekEvent(e) {
  const timeSinceProgrammatic = Date.now() - lastProgrammaticSeekTimestamp;
  const isCloseToTarget = Math.abs(videoElement.currentTime - lastProgrammaticSeekTime) < 1.5;

  // Programatik seek sonrasında Netflix veya HTML5 player'ın tetiklediği seeked olayını yut (döngü engelleme)
  if (isSyncing || isProgrammaticSeeking || (timeSinceProgrammatic < 1500 && isCloseToTarget)) {
    console.log('[FilmSync] Programatik seek olayı yutuldu, döngü engellendi.');
    if (isProgrammaticSeeking) {
      setTimeout(() => {
        finishProgrammaticSync();
      }, 600);
    }
    return;
  }

  lastSeekActivityTimestamp = Date.now();

  // Kullanıcı hızlı scrub yapıyorsa (ileri/geri ok tuşları) Firebase'i ve eşi boğma (200ms debounce)
  if (userSeekDebounceTimer) clearTimeout(userSeekDebounceTimer);
  userSeekDebounceTimer = setTimeout(() => {
    if (!videoElement) return;
    sendMediaEvent(!videoElement.paused, videoElement.currentTime, 'seek');
  }, 200);
}

function handleWaitingEvent() {
  if (!db || !roomId || !userId) return;
  if (bufferingDebounceTimer) clearTimeout(bufferingDebounceTimer);
  bufferingDebounceTimer = setTimeout(() => {
    if (!currentBufferingState) {
      currentBufferingState = true;
      db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: true });
    }
  }, 500); // 500ms debounce: anlık mikro-duraklamalarda Firebase'i meşgul etme
}

function handlePlayingEvent() {
  if (!db || !roomId || !userId) return;
  if (bufferingDebounceTimer) clearTimeout(bufferingDebounceTimer);
  if (currentBufferingState) {
    currentBufferingState = false;
    db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: false });
  }
}

// --- 🎨 TELEPARTY UYUMLU DİKEY SOHBET VE KONTROL PANELİ ---
let reactionContainer = null;

function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

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
    'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'font-size: 16px',
    'line-height: 1.5',
    '-webkit-font-smoothing: antialiased',
    '-moz-osx-font-smoothing: grayscale'
  ].join(' !important; ') + ' !important;');

  let style = document.getElementById('filmsync-injected-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'filmsync-injected-styles';
    document.head.appendChild(style);
  }
  style.textContent = `
    /* FilmSync Scoping & Reset */
    #filmsync-root, #filmsync-root * {
      box-sizing: border-box !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    /* Mini Dikey Araç Çubuğu (Mini-Toolbar) - 2026 Frosted Glass Buton */
    #filmsync-mini-toolbar {
      position: fixed !important;
      right: 24px !important;
      top: 50% !important;
      bottom: auto !important;
      transform: translateY(-50%) !important;
      width: 44px !important;
      height: 44px !important;
      background: rgba(18, 21, 33, 0.55) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.20) !important;
      border-radius: 50% !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      cursor: pointer !important;
    }
    #filmsync-mini-toolbar:hover {
      background: rgba(28, 34, 54, 0.70) !important;
      border-color: rgba(255, 255, 255, 0.35) !important;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.50), 0 0 16px rgba(255, 255, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.30) !important;
      transform: translateY(-50%) scale(1.06) !important;
    }
    #filmsync-mini-toolbar.panel-active {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(-50%) scale(0.85) !important;
    }
    .filmsync-tool-btn {
      width: 100% !important;
      height: 100% !important;
      border-radius: 50% !important;
      border: none !important;
      background: transparent !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      position: relative !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-tool-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: scale(1.08) !important;
    }
    .filmsync-tool-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }
    .filmsync-tool-btn.tp-logo {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
    }
    .filmsync-tool-btn.tp-logo svg {
      fill: rgba(255, 255, 255, 0.85) !important;
    }
    .filmsync-tool-btn.tp-logo:hover svg {
      fill: #ffffff !important;
    }
    .filmsync-tool-btn svg {
      width: 18px !important;
      height: 18px !important;
      fill: #e2e8f0 !important;
      transition: fill 0.2s !important;
    }
    .filmsync-tool-btn:hover svg {
      fill: #fff !important;
    }
    .filmsync-tool-btn.exit-btn:hover {
      background: rgba(229, 9, 20, 0.25) !important;
    }
    .filmsync-tool-btn.exit-btn:hover svg {
      fill: #ff3d47 !important;
    }
    
    /* TP Logosu Yumuşak Cam Ripple Efekti */
    @keyframes soft-glass-ripple {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
      }
      100% {
        box-shadow: 0 0 0 14px rgba(255, 255, 255, 0);
      }
    }
    .filmsync-tool-btn.tp-logo.clicked {
      animation: soft-glass-ripple 0.5s ease-out forwards !important;
    }
    
    /* Araç İpucu (Tooltip) - 2026 Frosted Glass */
    .filmsync-tool-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      right: 52px;
      top: 50%;
      transform: translateY(-50%) scale(0.95);
      background: rgba(14, 18, 30, 0.76) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 12px !important;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: all 0.15s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-tool-btn:hover::after {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    /* Yüzen Kompakt Cam Sohbet Podu (Floating Glass Pod) - 2026 Frosted Glass */
    #filmsync-chat-panel {
      position: fixed !important;
      top: 50% !important;
      right: 24px !important;
      bottom: auto !important;
      transform: translateY(-50%) translateX(40px) scale(0.96) !important;
      width: 288px !important;
      height: 470px !important;
      max-height: calc(100vh - 140px) !important;
      border-radius: 20px !important;
      background: rgba(13, 15, 25, 0.45) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.16) !important;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      will-change: transform, opacity !important;
      z-index: 2147483646 !important;
      pointer-events: none !important;
      opacity: 0 !important;
      font-size: 15px !important;
    }
    #filmsync-chat-panel.active {
      transform: translateY(-50%) translateX(0) scale(1) !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    /* Header Bileşenleri (Tamamen Saydam Üst Bar & Sade Kapatma Butonu) */
    .filmsync-header {
      position: relative !important;
      padding: 10px 12px 6px 12px !important;
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border-bottom: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      flex-shrink: 0 !important;
      z-index: 10 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      margin: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .filmsync-close-btn {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      color: rgba(255, 255, 255, 0.85) !important;
      cursor: pointer !important;
      width: 26px !important;
      height: 26px !important;
      border-radius: 50% !important;
      font-size: 13px !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
      padding: 0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
    }
    .filmsync-close-btn:hover {
      background: rgba(229, 9, 20, 0.35) !important;
      border-color: rgba(229, 9, 20, 0.65) !important;
      color: #fff !important;
      transform: scale(1.08) rotate(90deg) !important;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4) !important;
    }
    .filmsync-close-btn:active {
      transform: scale(0.95) rotate(90deg) !important;
    }
    .filmsync-close-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }

    /* Mesaj Listesi - Saydam Cam Zemin & Çift Yönlü Kırpılmış Akış */
    #filmsync-messages {
      flex: 1 !important;
      padding: 12px 12px 10px 12px !important;
      overflow-y: auto !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      background: transparent !important;
      mask-image: linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 16px), transparent 100%) !important;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 16px), transparent 100%) !important;
    }
    #filmsync-messages > :first-child {
      margin-top: auto !important;
    }
    #filmsync-messages::-webkit-scrollbar {
      width: 4px !important;
    }
    #filmsync-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.16) !important;
      border-radius: 4px !important;
    }
    #filmsync-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.28) !important;
    }

    .filmsync-msg-row {
      display: flex !important;
      flex-direction: column !important;
      max-width: 90% !important;
    }
    .filmsync-msg-row.self { align-self: flex-end !important; }
    .filmsync-msg-row.other { align-self: flex-start !important; }
    .filmsync-msg-row.system { align-self: center !important; max-width: 94% !important; margin: 2px 0 !important; }

    .filmsync-msg-sender {
      font-size: 13px !important;
      color: rgba(255, 255, 255, 0.85) !important;
      margin-bottom: 3px !important;
      margin-left: 6px !important;
      font-weight: 600 !important;
      letter-spacing: 0.2px !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7) !important;
    }
    .filmsync-msg-row.self .filmsync-msg-sender {
      text-align: right !important;
      margin-right: 6px !important;
      margin-left: 0 !important;
    }

    .filmsync-msg-bubble {
      padding: 8px 14px !important;
      border-radius: 16px !important;
      font-size: 15px !important;
      line-height: 1.42 !important;
      word-break: break-word !important;
      color: #fff !important;
      font-weight: 450 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-msg-row.self .filmsync-msg-bubble {
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.88), rgba(255, 61, 71, 0.82)) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-bottom-right-radius: 4px !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      box-shadow: 0 4px 18px rgba(229, 9, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }
    .filmsync-msg-row.other .filmsync-msg-bubble {
      background: rgba(24, 27, 42, 0.60) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-bottom-left-radius: 4px !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
      color: #f1f2f6 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-msg-row.system .filmsync-msg-bubble {
      background: rgba(225, 177, 44, 0.16) !important;
      border: 1px solid rgba(225, 177, 44, 0.35) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      color: #ffeaa7 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      text-align: center !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
      padding: 5px 12px !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
    }

    /* Buffering Göstergesi - 2026 Frosted Glass */
    .filmsync-buffering-indicator {
      font-size: 13px !important;
      font-weight: 600 !important;
      color: #ff6b81 !important;
      padding: 6px 16px !important;
      background: rgba(229, 9, 20, 0.18) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.14) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
      display: none;
      align-items: center !important;
      gap: 8px !important;
      flex-shrink: 0 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-buffering-indicator.active {
      display: flex !important;
    }
    .filmsync-spinner {
      width: 14px !important;
      height: 14px !important;
      border: 2px solid rgba(255,255,255,0.2) !important;
      border-top-color: #ff3d47 !important;
      border-radius: 50% !important;
      animation: fs-spin 0.8s linear infinite !important;
    }

    /* Reaksiyon Emojileri Barı - Daraltılmış, Saydam & Ortalanmış */
    .filmsync-reaction-bar {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 3px 8px !important;
      margin: 2px auto 6px auto !important;
      width: fit-content !important;
      max-width: 80% !important;
      background: rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 20px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
      flex-shrink: 0 !important;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease !important;
    }
    .filmsync-reaction-bar:hover {
      background: rgba(255, 255, 255, 0.10) !important;
      border-color: rgba(255, 255, 255, 0.22) !important;
      transform: translateY(-1px) !important;
    }
    .filmsync-react-btn {
      font-size: 16px !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease, background 0.15s ease !important;
      padding: 3px 5px !important;
      border-radius: 8px !important;
      line-height: 1 !important;
      opacity: 0.65 !important;
    }
    .filmsync-react-btn:hover {
      transform: scale(1.3) translateY(-2px) !important;
      opacity: 1 !important;
      background: rgba(255, 255, 255, 0.14) !important;
    }
    .filmsync-react-btn:active {
      transform: scale(1.1) translateY(0) !important;
    }
    .filmsync-react-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.5) !important;
      outline-offset: 1px !important;
    }

    /* Mesaj Giriş Alanı - Sakin & Şık Cam Çerçeve */
    .filmsync-input-area {
      padding: 8px 12px 12px 12px !important;
      background: rgba(16, 18, 30, 0.40) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.10) !important;
      display: flex !important;
      gap: 8px !important;
      align-items: center !important;
      flex-shrink: 0 !important;
    }
    .filmsync-input-area input {
      flex: 1 !important;
      padding: 9px 14px !important;
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 18px !important;
      color: #fff !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      outline: none !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25) !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-input-area input::placeholder {
      color: rgba(255, 255, 255, 0.45) !important;
    }
    .filmsync-input-area input:focus {
      border-color: rgba(255, 255, 255, 0.38) !important;
      background: rgba(255, 255, 255, 0.14) !important;
      box-shadow: 0 0 14px rgba(255, 255, 255, 0.18), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }
    .filmsync-send-btn {
      width: 34px !important;
      height: 34px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.85), rgba(255, 61, 71, 0.80)) !important;
      border: 1px solid rgba(255, 255, 255, 0.24) !important;
      backdrop-filter: blur(14px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(180%) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      color: #fff !important;
      font-size: 13px !important;
      box-shadow: 0 4px 14px rgba(229, 9, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      flex-shrink: 0 !important;
    }
    .filmsync-send-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.95), rgba(255, 61, 71, 0.90)) !important;
      transform: scale(1.08) !important;
      box-shadow: 0 6px 18px rgba(229, 9, 20, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    }
    .filmsync-send-btn:active:not(:disabled) {
      transform: scale(0.96) !important;
    }
    .filmsync-send-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }
    .filmsync-send-btn svg {
      width: 15px !important;
      height: 15px !important;
      fill: #fff !important;
      margin-left: 2px !important;
    }

    /* Uçan Emojiler Animasyon Alanı */
    #filmsync-reaction-layer {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483645 !important;
      overflow: hidden !important;
    }
    .flying-emoji {
      position: absolute !important;
      bottom: -50px !important;
      font-size: 32px !important;
      animation: flyUp 3.5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards !important;
      opacity: 0.9 !important;
    }

    /* Toast Bildirimleri Konteyneri & Şık Cam Kartlar */
    #filmsync-toast-container {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      gap: 8px !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
    }
    .filmsync-toast {
      position: relative !important;
      transform: translateX(420px) !important;
      opacity: 0 !important;
      width: 360px !important;
      background: rgba(14, 18, 28, 0.70) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 12px !important;
      padding: 12px 18px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      will-change: transform, opacity !important;
      pointer-events: auto !important;
    }
    .filmsync-toast:hover {
      border-color: rgba(255, 255, 255, 0.28) !important;
      box-shadow: 0 10px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }
    .filmsync-toast.active {
      transform: translateX(0) !important;
      opacity: 1 !important;
    }
    .filmsync-toast-header {
      display: none !important;
    }
    .filmsync-toast-body {
      font-size: 17px !important;
      line-height: 1.4 !important;
      font-weight: 500 !important;
      color: #ffffff !important;
      word-break: break-word !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6) !important;
      letter-spacing: -0.1px !important;
    }

    /* 1920px+ (Full HD, 2K, 4K) Ekranlarda Okunabilirlik ve Orantı Garantisi */
    @media (min-width: 1920px) {
      #filmsync-chat-panel {
        width: 320px !important;
      }
      .filmsync-toast {
        width: 390px !important;
        padding: 14px 20px !important;
      }
      .filmsync-toast-header {
        font-size: 16px !important;
      }
      .filmsync-toast-body {
        font-size: 18px !important;
      }
      .filmsync-msg-bubble {
        font-size: 16.5px !important;
      }
    }

    /* Sayfa ve Oynatıcı - Tam Boyut Cam Akış */
    body.filmsync-sidebar-open {
      overflow-x: hidden !important;
    }

    @keyframes fs-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes flyUp {
      0% {
        transform: translateY(0) rotate(0deg) scale(0.5);
        opacity: 0;
      }
      10% {
        opacity: 1;
        transform: translateY(-100px) rotate(15deg) scale(1.1);
      }
      90% {
        opacity: 0.8;
      }
      100% {
        transform: translateY(-100vh) rotate(-15deg) scale(0.9);
        opacity: 0;
      }
    }
  `;

  root.innerHTML = `
    <!-- Dikey Araç Çubuğu (Mini-Toolbar) -->
    <div id="filmsync-mini-toolbar" class="panel-active">
      <button class="filmsync-tool-btn tp-logo" data-tooltip="Sohbet" title="Sohbet (Enter)">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
      </button>
    </div>
    
    <!-- Toast Bildirimleri Konteyneri -->
    <div id="filmsync-toast-container"></div>

    <!-- Yüzen Cam Sohbet Podu (Floating Glass Chat Pod) -->
    <div id="filmsync-chat-panel" class="active">
      <div class="filmsync-header">
        <button class="filmsync-close-btn" id="filmsyncCloseBtn" title="Kapat (Escape)">✕</button>
      </div>

      <div id="filmsync-messages"></div>
      
      <!-- Yükleniyor / Buffer Göstergesi -->
      <div class="filmsync-buffering-indicator" id="filmsyncBufferingIndicator">
        <div class="filmsync-spinner"></div>
        <span id="filmsyncBufferingText">Bağlantı bekleniyor...</span>
      </div>

      <!-- Emoji Reaksiyon Barı -->
      <div class="filmsync-reaction-bar">
        <button class="filmsync-react-btn" data-emoji="👍">👍</button>
        <button class="filmsync-react-btn" data-emoji="😮">😮</button>
        <button class="filmsync-react-btn" data-emoji="😢">😢</button>
        <button class="filmsync-react-btn" data-emoji="😂">😂</button>
        <button class="filmsync-react-btn" data-emoji="🤯">🤯</button>
        <button class="filmsync-react-btn" data-emoji="🔥">🔥</button>
      </div>
      
      <!-- Mesaj Girişi -->
      <div class="filmsync-input-area">
        <input type="text" id="filmsyncMsgInput" placeholder="Mesaj yazın... (Enter)" autocomplete="off">
        <button class="filmsync-send-btn" id="filmsyncSendBtn" title="Gönder">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

    <!-- Reaksiyon Katmanı -->
    <div id="filmsync-reaction-layer"></div>
  `;

  document.body.appendChild(root);
  document.head.appendChild(style);

  // Arayüz açıkken sayfa yerleşimini daralt
  document.body.classList.add('filmsync-sidebar-open');

  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  messageList = document.getElementById('filmsync-messages');
  reactionContainer = document.getElementById('filmsync-reaction-layer');
  const sendBtn = document.getElementById('filmsyncSendBtn');

  // Sohbet Podu Fare Gezinme Koruması (Fare panel üzerindeyken otomatik gizlenmeyi durdur)
  if (chatPanel) {
    chatPanel.addEventListener('mouseenter', () => {
      isMouseInsideChatPanel = true;
    });
    chatPanel.addEventListener('mouseleave', () => {
      isMouseInsideChatPanel = false;
      startAutoHideTimer(AUTO_HIDE_DELAY);
    });
    // Sohbet alanının herhangi bir yerine tıklandığında otomatik olarak mesaj kutusuna odaklan
    chatPanel.addEventListener('mousedown', (e) => {
      if (e.target.closest('#filmsyncCloseBtn') || e.target.closest('.filmsync-react-btn')) {
        return;
      }
      if (e.target !== messageInput && !e.target.closest('#filmsyncSendBtn')) {
        e.preventDefault();
      }
      if (messageInput) {
        messageInput.focus();
      }
    });
  }

  // Input durumuna göre gönder butonu aktifliği ve Otomatik Gizlenme Yönetimi
  if (sendBtn && messageInput) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
    messageInput.addEventListener('input', () => {
      lastTypingTime = Date.now();
      const hasText = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.4';
      clearTimeout(autoHideTimer);
    });
    messageInput.addEventListener('focus', () => {
      isInputFocused = true;
      showPanelAndToolbar();
      if (messageInput.value.trim().length === 0) {
        startAutoHideTimer(AUTO_HIDE_DELAY);
      }
    });
    messageInput.addEventListener('blur', () => {
      isInputFocused = false;
      startAutoHideTimer(AUTO_HIDE_DELAY);
    });
    // Başlangıçta mesaj girişine odaklan
    setTimeout(() => {
      if (messageInput) messageInput.focus();
    }, 100);
  }

  // FilmSync kök elementi içindeki tuş olaylarının harici video oynatıcıya sızmasını engelle
  root.addEventListener('keydown', (e) => {
    e.stopPropagation();
  });
  root.addEventListener('keyup', (e) => {
    e.stopPropagation();
  });
  root.addEventListener('keypress', (e) => {
    e.stopPropagation();
  });

  // Mini kapatma butonu
  document.getElementById('filmsyncCloseBtn').addEventListener('click', toggleChatPanel);
  
  // TP Logosuna basınca kırmızı ripple dalgası tetikle ve paneli toggle et
  const logoBtn = document.querySelector('.filmsync-tool-btn.tp-logo');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      logoBtn.classList.remove('clicked');
      void logoBtn.offsetWidth; // Reflow tetikle
      logoBtn.classList.add('clicked');
      toggleChatPanel();
    });
  }

  // Gönderme ve mesaj inputu olayları
  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      clearTimeout(autoHideTimer);
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (chatPanel && chatPanel.classList.contains('active')) {
          toggleChatPanel();
        }
        messageInput.blur();
        lastEscapeTime = Date.now();
      }
    });

    messageInput.addEventListener('keyup', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });

    messageInput.addEventListener('keypress', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
  }

  // Emoji reaksiyonları gönderme olayları
  document.querySelectorAll('.filmsync-react-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      sendEmojiReaction(emoji);
    });
  });

  attachGlobalKeyListeners();
  broadcastChatState(true);
  startAutoHideTimer(AUTO_HIDE_DELAY);

  // Eğer kuyrukta birikmiş geçmiş mesajlar varsa onları anında render et!
  if (messagesQueue.length > 0) {
    console.log(`[FilmSync Queue] Kuyrukta biriken ${messagesQueue.length} mesaj ekrana basılıyor.`);
    messagesQueue.forEach(msg => appendMessage(msg));
    messagesQueue = [];
  }

  // Eğer Firebase zaten kurulmuşsa, yeni DOM oluşturulduğu için geçmiş mesajları tekrar çekip render edelim!
  if (db && roomId) {
    renderedMessageKeys.clear();
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).once('value').then((snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        if (messageList) messageList.innerHTML = '';
        Object.entries(messages).forEach(([key, msg]) => {
          // child_added ile çakışmayı önlemek için renderedMessageKeys kontrolü ekle
          if (!renderedMessageKeys.has(key)) {
            renderedMessageKeys.add(key);
            appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });
          }
        });
      }
    });
  }
}

// Reaksiyon Gönderme (Firebase)
function sendEmojiReaction(emoji) {
  if (!db || !roomId) return;
  soundEffects.playReactionChord();
  db.ref(`rooms/${roomId}/reactions`).push({
    emoji,
    senderId: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

// Uçan Emoji Animasyonu Tetikleme
function spawnFlyingEmoji(emoji) {
  if (!reactionContainer) return;
  
  const el = document.createElement('div');
  el.className = 'flying-emoji';
  el.textContent = emoji;
  
  // Rastgele yatay pozisyon ve hafif rotasyon
  const randomLeft = Math.random() * 80 + 10; // %10 - %90 arası
  el.style.left = `${randomLeft}%`;
  
  reactionContainer.appendChild(el);
  
  // Animasyon bitiminde elementi temizle
  setTimeout(() => el.remove(), 4000);
}

function startUIKeeper() {
  if (uiKeeperInterval) clearInterval(uiKeeperInterval);
  uiKeeperInterval = setInterval(() => {
    if (roomId && !document.getElementById('filmsync-root') && window === window.top) {
      console.log('[FilmSync UI Keeper] Arayüz yenileniyor.');
      createChatUI();
    }
  }, 2000);
}

function broadcastChatState(isOpen) {
  const openVal = !!isOpen;
  isChatOpenInTop = openVal;
  try {
    const msg = {
      type: 'filmsync-chat-state',
      isOpen: openVal
    };
    function postToWindowTree(win) {
      if (!win) return;
      try {
        win.postMessage(msg, '*');
      } catch (e) {}
      try {
        for (let i = 0; i < win.frames.length; i++) {
          try { postToWindowTree(win.frames[i]); } catch (e) {}
        }
      } catch (e) {}
    }
    postToWindowTree(window.top);
  } catch (err) {}
}

let isChatOpenInTop = false;

function insertTextAtCursor(input, text) {
  if (!input) return;
  lastTypingTime = Date.now();
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  input.value = val.substring(0, start) + text + val.substring(end);
  const newPos = start + text.length;
  input.selectionStart = input.selectionEnd = newPos;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleBackspaceInInput(input) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  if (start !== end) {
    input.value = val.substring(0, start) + val.substring(end);
    input.selectionStart = input.selectionEnd = start;
  } else if (start > 0) {
    input.value = val.substring(0, start - 1) + val.substring(end);
    input.selectionStart = input.selectionEnd = start - 1;
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleDeleteInInput(input) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  if (start !== end) {
    input.value = val.substring(0, start) + val.substring(end);
    input.selectionStart = input.selectionEnd = start;
  } else if (start < val.length) {
    input.value = val.substring(0, start) + val.substring(start + 1);
    input.selectionStart = input.selectionEnd = start;
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleArrowInInput(input, key) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const len = (input.value || '').length;
  if (key === 'ArrowLeft') {
    const pos = Math.max(0, (start !== end ? start : start - 1));
    input.selectionStart = input.selectionEnd = pos;
  } else if (key === 'ArrowRight') {
    const pos = Math.min(len, (start !== end ? end : end + 1));
    input.selectionStart = input.selectionEnd = pos;
  } else if (key === 'ArrowUp') {
    input.selectionStart = input.selectionEnd = 0;
  } else if (key === 'ArrowDown') {
    input.selectionStart = input.selectionEnd = len;
  }
}

function handleGlobalKeySuppression(e) {
  if (window !== window.top) {
    const isModifier = (e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt' || e.key === 'Shift');
    if (!isModifier) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    }
    return;
  }
  if (!roomId && !document.getElementById('filmsync-root')) return;
  const activeEl = document.activeElement;
  const isMsgInput = activeEl && (activeEl === messageInput || activeEl.id === 'filmsyncMsgInput');
  const isChatOpen = !!(chatPanel && chatPanel.classList.contains('active'));
  if (isMsgInput || isChatOpen || isChatOpenInTop) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Shift') {
      e.preventDefault();
    }
  }
}

function removeChatUI() {
  if (uiKeeperInterval) {
    clearInterval(uiKeeperInterval);
    uiKeeperInterval = null;
  }
  if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
    try { navigator.keyboard.unlock(); } catch (e) {}
  }
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  document.getElementById('filmsync-injected-styles')?.remove();
  document.body.classList.remove('filmsync-sidebar-open');
  broadcastChatState(false);
  window.removeEventListener('keydown', handleGlobalEnterKey, true);
  document.removeEventListener('keydown', handleGlobalEnterKey, true);
  window.removeEventListener('keyup', handleGlobalKeySuppression, true);
  document.removeEventListener('keyup', handleGlobalKeySuppression, true);
  window.removeEventListener('keypress', handleGlobalKeySuppression, true);
  document.removeEventListener('keypress', handleGlobalKeySuppression, true);
}

function toggleChatPanel() {
  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!chatPanel) return;

  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  chatPanel.classList.toggle('active');
  
  const isOpened = chatPanel.classList.contains('active');
  const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');
  const logoToggleBtn = document.querySelector('.filmsync-tool-btn.tp-logo');

  if (isOpened) {
    document.body.classList.add('filmsync-sidebar-open');
    chatPanel.style.opacity = '1';
    chatPanel.style.pointerEvents = 'auto';
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');
    messageInput?.focus();
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    }
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle (Enter)');
      logoToggleBtn.title = 'Sohbeti Gizle (Enter)';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);
  } else {
    document.body.classList.remove('filmsync-sidebar-open');
    chatPanel.style.opacity = '0';
    chatPanel.style.pointerEvents = 'none';
    clearTimeout(autoHideTimer);
    if (messageInput && document.activeElement === messageInput) {
      messageInput.blur();
    }
    isInputFocused = false;
    if (miniToolbar) {
      miniToolbar.classList.remove('panel-active');
      miniToolbar.style.opacity = '1';
      miniToolbar.style.pointerEvents = 'auto';
    }
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
    }
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbet');
      logoToggleBtn.title = 'Sohbet (Enter)';
    }
    broadcastChatState(false);
  }
  
  // Oynatıcı boyutlandırmasını tetiklemek için resize olayı fırlat
  window.dispatchEvent(new Event('resize'));
}


function handleGlobalEnterKey(e) {
  if (!e || e._filmsyncHandled) return;

  // Iframe içerisinden gelen olayları ana pencereye ilet ve player kısayollarını (F, M, Sarma vb.) KESİNLİKLE durdur
  if (window !== window.top && !document.getElementById('filmsync-root')) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
    const isArrow = (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown');
    const isSingleChar = (e.key && e.key.length === 1 && !isSpace);

    // Chat açıkken veya alfanümerik/enter/escape basıldığında iframe player'a asla kısayol gitmemeli!
    if (isChatOpenInTop || isSingleChar || isSpace || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete' || isArrow) {
      e._filmsyncHandled = true;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      try {
        window.top.postMessage({
          type: 'filmsync-iframe-keydown',
          key: e.key,
          code: e.code
        }, '*');
      } catch (err) {}
      return;
    }
    return;
  }

  // Sadece oda varsa veya FilmSync UI mevcutsa klavye kontrolleri devreye girsin
  if (!roomId && !document.getElementById('filmsync-root')) {
    try {
      chrome.storage.local.get(['roomId'], (res) => {
        if (res && res.roomId && !roomId) {
          roomId = res.roomId;
          init();
        }
      });
    } catch (err) {}
    return;
  }

  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');

  // Eğer odadayız ama UI henüz oluşturulmadıysa oluştur
  if ((!chatPanel || !messageInput) && roomId && window === window.top) {
    createChatUI();
    chatPanel = document.getElementById('filmsync-chat-panel');
    messageInput = document.getElementById('filmsyncMsgInput');
  }

  if (!chatPanel || !messageInput) return;

  const activeEl = document.activeElement;
  const isMessageInput = activeEl && (activeEl === messageInput || activeEl.id === 'filmsyncMsgInput');
  const isInFilmsyncUI = activeEl && (isMessageInput || (activeEl.closest && activeEl.closest('#filmsync-root')));
  const isChatOpen = !!(chatPanel && chatPanel.classList.contains('active'));
  
  // Sadece gerçek metin girişi yapılan harici inputlar (arama kutusu vb.) muaf tutulmalı;
  // Netflix ses/ilerleme çubukları (<input type="range">) veya butonlar metin yazmayı ASLA engellememelidir!
  const isTextInput = activeEl && !isInFilmsyncUI && (
    (activeEl.tagName === 'INPUT' && !['range', 'button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'color', 'image'].includes((activeEl.type || '').toLowerCase())) ||
    activeEl.tagName === 'TEXTAREA' ||
    (activeEl.isContentEditable && activeEl !== messageInput)
  );
  if (isTextInput) return;

  // 1. ESCAPE TUŞU: Çift Basış Tam Ekran Koruması (Double-Escape Fullscreen Guard)
  if (e.key === 'Escape') {
    e._filmsyncHandled = true;
    if (isChatOpen || isMessageInput || isInFilmsyncUI) {
      // İlk basış: Sohbet paneli açıksa veya input odaktaysa SADECE paneli kapat ve input odağını kaldır.
      // Tam ekrandan çıkışı KESİNLİKLE engelle!
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      if (messageInput) {
        messageInput.blur();
      }
      if (activeEl && activeEl.blur) {
        activeEl.blur();
      }
      lastEscapeTime = Date.now();
      return;
    } else {
      // Sohbet paneli kapalıyken:
      // Eğer son 800-1000ms içinde Escape'e basılmışsa (ikinci hızlı basış), tam ekrandan çıkışa izin ver!
      if (Date.now() - lastEscapeTime < 1000) {
        lastEscapeTime = 0;
        if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
          try { navigator.keyboard.unlock(); } catch (err) {}
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        return; // Olayı engelleme, tarayıcının ve oynatıcının tam ekrandan çıkmasına serbestçe izin ver
      }
      return;
    }
  }

  // 2. FilmSync mesaj inputu odaktayken (kullanıcı mesaj yazarken):
  // Tüm video oynatıcı kısayollarını (F=fullscreen, M=mute, Space=pause, Ok tuşları ses/sarma, 0-9) KESİNLİKLE bloke et!
  if (isMessageInput) {
    e._filmsyncHandled = true;
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      messageInput.blur();
      lastEscapeTime = Date.now();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspaceInInput(messageInput);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      handleDeleteInInput(messageInput);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleArrowInInput(messageInput, e.key);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        messageInput.select();
        return;
      }
      // Ctrl+C, Ctrl+V, Ctrl+X vb. pano kısayollarına izin ver
      return;
    }

    // Harfler, rakamlar, boşluk, semboller ve Türkçe karakterler
    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      insertTextAtCursor(messageInput, e.key);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    return;
  }

  // 3. FilmSync Sohbet Paneli Açıkken (Oynatıcı Kısayollarının Tamamını Devre Dışı Bırakma):
  // Kullanıcı video üzerine veya panel dışına tıklamış olsa bile kısayolları engelle,
  // herhangi bir yazma tuşunda mesaj inputuna odaklan ve yaz.
  if (isChatOpen) {
    e._filmsyncHandled = true;
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        if (messageInput.value.trim()) {
          sendChatMessage();
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      if (messageInput) messageInput.blur();
      lastEscapeTime = Date.now();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleBackspaceInInput(messageInput);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleDeleteInInput(messageInput);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
    if (isSpace) {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        insertTextAtCursor(messageInput, ' ');
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleArrowInInput(messageInput, e.key);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.ctrlKey || e.metaKey) return;

    if (e.key && e.key.length === 1) {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        insertTextAtCursor(messageInput, e.key);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    return;
  }

  // 4. OK TUŞLARI (Sohbet Kapalıyken Video Oynatıcı Kontrolü):
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    return; // Video oynatıcıya serbestçe geçsin (sarma / ses kontrolü)
  }

  // 5. Tarayıcı kısayol kombinasyonları (Ctrl+C, Cmd+R, Alt+Tab vb.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // 6. ENTER TUŞU (Sohbet Kapalıyken Paneli Açma):
  if (e.key === 'Enter') {
    e._filmsyncHandled = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    showPanelAndToolbar();
    if (chatPanel) {
      chatPanel.classList.add('active');
      chatPanel.style.opacity = '1';
      chatPanel.style.pointerEvents = 'auto';
      document.body.classList.add('filmsync-sidebar-open');
    }
    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);

    if (messageInput) {
      messageInput.focus();
    }
    return;
  }

  // 7. SPACE (Boşluk) Tuşu (Sohbet Kapalıyken Video Oynat/Duraklat):
  const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
  if (isSpace) {
    e._filmsyncHandled = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleVideoPlayPause();
    return;
  }

  // 8. ALFANÜMERİK TUŞLAR (Sohbet Kapalıyken Chat-First Açılış ve İlk Harfi Yazma):
  const isAlphanumericKey = (e.key && e.key.length === 1 && !isSpace) &&
                            !e.ctrlKey && !e.metaKey && !e.altKey;
  const isAlphanumericOrSpace = isAlphanumericKey; // Geriye dönük uyumluluk

  if (isAlphanumericKey) {
    e._filmsyncHandled = true;
    // Oynatıcının kısayollarını (F, M vb.) tamamen bloke et!
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Paneli aç ve görünürlüğü garanti et
    showPanelAndToolbar();
    if (chatPanel) {
      chatPanel.classList.add('active');
      chatPanel.style.opacity = '1';
      chatPanel.style.pointerEvents = 'auto';
      document.body.classList.add('filmsync-sidebar-open');
    }
    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);

    // Input alanına odaklan ve basılan karakteri yaz
    if (messageInput) {
      messageInput.focus();
      messageInput.value += e.key;
      messageInput.selectionStart = messageInput.selectionEnd = messageInput.value.length;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return;
  }
}

function sendChatMessage() {
  if (!messageInput) return;
  const text = messageInput.value.trim();
  if (!text) return;

  if (!db && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
    db = firebase.database();
  }
  if (!db && roomId) {
    initializeFirebase(firebaseConfig);
  }
  if (!db) {
    console.error('[FilmSync] Firebase veritabanı bağlantısı henüz hazır değil.');
    return;
  }

  // Mesaj Gönderim Ses Efekti
  soundEffects.playSendTap();

  db.ref(`rooms/${roomId}/messages`).push({
    username: username || 'Anonim',
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
  messageInput.value = '';
  const sendBtn = document.getElementById('filmsyncSendBtn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
  }
  
  if (messageInput) {
    messageInput.focus();
  }
  isInputFocused = true;
  lastTypingTime = 0;
  isMouseInsideChatPanel = false;
  startAutoHideTimer(AUTO_HIDE_DELAY);
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

  // Mesaj zamanını Türkçe formatta elde et
  const dateObj = timestamp ? new Date(timestamp) : new Date();
  const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    row.classList.add('system');
    const systemBubble = document.createElement('div');
    systemBubble.className = 'filmsync-msg-bubble';
    systemBubble.textContent = message;
    row.appendChild(systemBubble);
  } else {
    const isSelf = msgUser === username;
    row.classList.add(isSelf ? 'self' : 'other');

    const msgSender = document.createElement('div');
    msgSender.className = 'filmsync-msg-sender';
    msgSender.textContent = msgUser + ' ';

    const timeSpan = document.createElement('span');
    timeSpan.setAttribute('style', 'font-size: 12px !important; color: rgba(255, 255, 255, 0.65) !important; font-weight: 500 !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;');
    timeSpan.textContent = timeStr;
    msgSender.appendChild(timeSpan);

    const msgBubble = document.createElement('div');
    msgBubble.className = 'filmsync-msg-bubble';
    msgBubble.textContent = message;

    row.appendChild(msgSender);
    row.appendChild(msgBubble);
  }

  messageList.appendChild(row);
  while (messageList.children.length > 35) {
    messageList.removeChild(messageList.firstChild);
  }
  messageList.scrollTop = messageList.scrollHeight;
}

function updateUsersDisplay(usersList) {
  // Minimalist tasarım: Kullanıcı pill rozetleri üst headerda gösterilmez
  if (!userListDisplay) return;
  userListDisplay.innerHTML = '';
}

// --- 🔔 2026 FROSTED GLASS BİLDİRİM TOAST MOTORU ---
function showNotificationToast(sender, text) {
  let toastContainer = document.getElementById('filmsync-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'filmsync-toast-container';
    const rootEl = document.getElementById('filmsync-root') || document.body;
    rootEl.appendChild(toastContainer);
  }

  // En fazla 3 toast olsun, eskiyeni temizle
  while (toastContainer.children.length >= 3) {
    toastContainer.firstElementChild.remove();
  }

  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  
  // Üst başlık ("🍿 FİLM PARTİSİ 🍿") tamamen kaldırıldı; doğrudan minimalist cam kart ve sade mesaj metni
  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';

  if (sender && sender !== 'Film Partisi 🍿' && sender !== 'Sistem' && sender !== 'Film Partisi') {
    const senderSpan = document.createElement('span');
    senderSpan.style.fontWeight = '700';
    senderSpan.style.color = '#ff4d56';
    senderSpan.style.marginRight = '6px';
    senderSpan.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.6)';
    senderSpan.textContent = `${sender}:`;
    toastBody.appendChild(senderSpan);
    const textNode = document.createTextNode(text);
    toastBody.appendChild(textNode);
  } else {
    toastBody.textContent = text;
  }

  toast.appendChild(toastBody);

  toastContainer.appendChild(toast);
  
  // Reflow tetikle ve active sınıfı ekle
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  // Toast'a tıklanınca paneli aç ve toast'u kaldır
  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
    
    // Eğer panel kapalıysa veya idle ile gizlendiyse aç
    showPanelAndToolbar();
    if (chatPanel && !chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }
  });

  // Bildirim kartı ekranda 4.5 saniye kalır ve pürüzsüzce söner (4-5s kuralı)
  const duration = 4500;

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
    }
  }, duration);
}

// --- 🎬 YÖNLENDİRME BİLDİRİM TOASTI (CAM KART) ---
function showMovieRedirectNotification(targetUrl) {
  if (isEmbedUrl(targetUrl)) {
    console.log('[FilmSync] Hedef URL bir embed adresi olduğundan yönlendirme toastu engellendi:', targetUrl);
    return;
  }
  // Eğer zaten aynı film/bölüm sayfasındaysak bildirime gerek yok
  if (areUrlsSameMovie(window.location.href, targetUrl)) {
    return;
  }
  if (document.getElementById('filmsync-redirect-toast')) return;

  let toastContainer = document.getElementById('filmsync-toast-container');
  if (!toastContainer) {
    toastContainer = document.getElementById('filmsync-root') || document.body;
  }

  const toast = document.createElement('div');
  toast.id = 'filmsync-redirect-toast';
  toast.classList.add('filmsync-toast');
  toast.setAttribute('style', 'background: rgba(14, 22, 38, 0.72) !important; backdrop-filter: blur(20px) saturate(180%) !important; -webkit-backdrop-filter: blur(20px) saturate(180%) !important; border: 1px solid rgba(69, 243, 255, 0.38) !important; box-shadow: 0 14px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(69, 243, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20) !important;');
  
  // Kapatma Tuşu (X)
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('style', 'position: absolute; top: 10px; right: 12px; width: 24px; height: 24px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); color: rgba(255, 255, 255, 0.85); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; cursor: pointer; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12); z-index: 10;');
  closeBtn.addEventListener('mouseover', () => {
    closeBtn.style.background = 'rgba(229, 9, 20, 0.35)';
    closeBtn.style.borderColor = 'rgba(229, 9, 20, 0.65)';
    closeBtn.style.color = '#fff';
    closeBtn.style.transform = 'scale(1.08) rotate(90deg)';
  });
  closeBtn.addEventListener('mouseout', () => {
    closeBtn.style.background = 'rgba(255, 255, 255, 0.08)';
    closeBtn.style.borderColor = 'rgba(255, 255, 255, 0.16)';
    closeBtn.style.color = 'rgba(255, 255, 255, 0.85)';
    closeBtn.style.transform = 'scale(1) rotate(0deg)';
  });
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
  });
  
  const toastHeader = document.createElement('div');
  toastHeader.className = 'filmsync-toast-header';
  toastHeader.setAttribute('style', 'display: block !important; color: #45f3ff !important; font-size: 14px !important; font-weight: 800 !important; text-shadow: 0 1px 3px rgba(0,0,0,0.7) !important; margin-bottom: 4px !important;');
  toastHeader.textContent = '🎬 Yeni Film Akışı';

  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';
  toastBody.setAttribute('style', 'color: #ffffff !important; font-weight: 500 !important; cursor: pointer; padding-right: 15px; font-size: 13.5px !important; line-height: 1.4 !important; text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important;');
  toastBody.textContent = 'Oda sahibi yeni bir film başlattı. Katılmak için tıklayın! 🍿';

  toast.appendChild(closeBtn);
  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  // 12 saniye sonra otomatik kaldır
  const autoRemoveTimer = setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
    }
  }, 12000);

  toast.addEventListener('click', () => {
    clearTimeout(autoRemoveTimer);
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
    window.filmsyncDismissedUrl = targetUrl;
    chrome.runtime.sendMessage({ type: 'redirect-tab', url: normalizeMovieUrl(targetUrl) });
  });
}

// --- 📺 TAM EKRAN DESTEĞİ ---
function setupFullscreenListener() {
  if (isFullscreenListenersAttached) return;
  isFullscreenListenersAttached = true;

  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  events.forEach(eventName => {
    document.addEventListener(eventName, () => {
      const fsElement = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

      if (window !== window.top) {
        // IFRAME BAĞLAMINDA (Dizipal, Vidmoly vb. player içi tam ekran)
        if (fsElement) {
          console.log('[FilmSync Iframe FS] Iframe tam ekran oldu, arayüz enjekte ediliyor.');
          createChatUI();
          
          // Arayüzü tam ekrana geçen elementin içine taşı (video katmanının üstünde görünmesi için!)
          const root = document.getElementById('filmsync-root');
          if (root && fsElement && fsElement !== root) {
            fsElement.appendChild(root);
            root.style.position = 'absolute';
            root.style.zIndex = '2147483647';
          }
          
          // Firebase bağlantısını doğrula ve senkronizasyonu tetikle
          initializeFirebase(firebaseConfig);
        } else {
          console.log('[FilmSync Iframe FS] Iframe tam ekrandan çıktı, arayüz siliniyor.');
          removeChatUI();
        }
      } else {
        // ANA SAYFA (TOP WINDOW) BAĞLAMINDA
        const root = document.getElementById('filmsync-root');
        if (!root) return;

        const targetContainer = fsElement || document.body;
        targetContainer.appendChild(root);
        
        console.log(`[FilmSync] Tam ekran: root → ${fsElement ? 'fullscreenElement' : 'body'}`);
      }
    });
  });
}

// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---
function showAutoJoinOverlay(roomName) {
  if (document.getElementById('filmsync-autojoin-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'filmsync-autojoin-overlay';
  overlay.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(9, 11, 18, 0.76); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2147483647 !important; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  overlay.innerHTML = `
    <div style="background: rgba(18, 21, 33, 0.82); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; padding: 36px 44px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.18); display: flex; flex-direction: column; align-items: center; text-align: center; position: relative;">
      <button id="filmsyncAutoJoinCancelBtn" style="position: absolute; top: 14px; right: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); color: rgba(255, 255, 255, 0.85); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Vazgeç (Escape)">✕</button>
      <div style="font-size: 32px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Film Partisi 🍿</div>
      <div id="filmsync-autojoin-text" style="font-size: 16px; color: #45f3ff; font-weight: 600; margin-bottom: 24px; text-shadow: 0 0 12px rgba(69, 243, 255, 0.4);"></div>
      <div style="width: 44px; height: 44px; border: 4px solid rgba(69, 243, 255, 0.18); border-top-color: #45f3ff; border-radius: 50%; animation: spin 1s linear infinite; box-shadow: 0 0 16px rgba(69, 243, 255, 0.35);"></div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  const textEl = overlay.querySelector('#filmsync-autojoin-text');
  if (textEl) textEl.textContent = `"${roomName}" Partisine Katılınıyor...`;
  
  const cancelBtn = overlay.querySelector('#filmsyncAutoJoinCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => overlay.remove());
  }

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);

  document.body.appendChild(overlay);
}

// --- 🏷️ İSİM PROMPT MODALI ---
function showNamePromptModal(roomName, callback) {
  if (document.getElementById('filmsync-name-prompt-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'filmsync-name-prompt-modal';
  modal.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(9, 11, 18, 0.76); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  modal.innerHTML = `
    <div style="width: 340px; background: rgba(18, 21, 33, 0.82); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; padding: 26px; box-shadow: 0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18); text-align: center; color: #fff; position: relative;">
      <button id="filmsyncPromptCloseBtn" style="position: absolute; top: 14px; right: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); color: rgba(255, 255, 255, 0.85); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Kapat (Escape)">✕</button>
      <div style="font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">Film Partisi 🍿</div>
      <div id="filmsync-prompt-room-title" style="font-size: 14px; color: #45f3ff; margin-bottom: 22px; font-weight: 600; text-shadow: 0 0 10px rgba(69, 243, 255, 0.3);"></div>
      
      <div style="text-align: left; margin-bottom: 18px;">
        <label style="font-size: 12px; text-transform: uppercase; color: #45f3ff; font-weight: 700; display: block; margin-bottom: 6px; letter-spacing: 0.5px;">Adınız</label>
        <input type="text" id="promptNameInput" placeholder="Adınızı yazın" style="width: 100%; box-sizing: border-box; padding: 11px 14px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 12px; color: #fff; font-size: 14px; outline: none; backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); transition: border 0.3s, box-shadow 0.3s;" />
      </div>
      
      <button id="promptJoinBtn" style="width: 100%; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; background: linear-gradient(135deg, #e50914, #ff3d47); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Partiye Katıl</button>
    </div>
  `;

  const titleEl = modal.querySelector('#filmsync-prompt-room-title');
  if (titleEl) titleEl.textContent = `"${roomName}" partisine katılıyorsunuz.`;

  const closeBtn = modal.querySelector('#filmsyncPromptCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.remove());
  }

  document.body.appendChild(modal);

  const nameInput = document.getElementById('promptNameInput');
  const joinBtn = document.getElementById('promptJoinBtn');

  nameInput.focus();

  // Önceden kayıtlı kullanıcı adı varsa otomatik doldur
  try {
    chrome.storage.local.get(['username'], (res) => {
      if (res && res.username && nameInput) {
        nameInput.value = res.username;
        nameInput.select();
      }
    });
  } catch(e) {}

  const handleJoin = () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('Lütfen adınızı girin.');
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

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);
}

// --- 🎬 NETFLIX DETAY KARTLARINA "FİLM PARTİSİ BAŞLAT" BUTONU ENJEKSİYONU ---
function injectNetflixStartButton() {
  const buttonContainers = document.querySelectorAll('.previewModal--buttons, .jawbone-actions, .l-play-parent');
  buttonContainers.forEach(container => {
    if (container.querySelector('.filmsync-netflix-start-btn')) return;

    const startBtn = document.createElement('button');
    startBtn.className = 'filmsync-netflix-start-btn';
    startBtn.setAttribute('style', `
      background-color: #e50914;
      background-image: linear-gradient(135deg, #e50914, #ff3d47);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px !important;
      cursor: pointer;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `);
    startBtn.innerHTML = '<span>Film Partisi Başlat</span> 🍿';

    startBtn.addEventListener('mouseover', () => {
      startBtn.style.transform = 'scale(1.04) translateY(-1px)';
      startBtn.style.boxShadow = '0 6px 24px rgba(229, 9, 20, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
    });
    startBtn.addEventListener('mouseout', () => {
      startBtn.style.transform = 'scale(1) translateY(0)';
      startBtn.style.boxShadow = '0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
    });

    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const playBtn = container.querySelector('a[href*="/watch/"], button[aria-label*="Oynat"], button[aria-label*="Play"], .playLink');
      if (playBtn) {
        // 4 Harfli Oda Kodu üret
        const generate4LetterCode = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let result = '';
          for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        const randomRoomId = generate4LetterCode();
        const randomUserId = 'user_' + Math.random().toString(36).substr(2, 9);

        // Firebase üzerinde odayı anında başlat
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        const tempDb = firebase.database();
        
        let playUrl = '';
        if (playBtn.tagName === 'A' && playBtn.href) {
          playUrl = playBtn.href;
        } else {
          // Play linki yoksa mevcut URL üzerinden /watch/ parametresi oluşturmaya çalış
          const movieCard = container.closest('[id*="post-"], .card-container, .previewModal--wrapper, .jawbone-container');
          const movieLink = movieCard?.querySelector('a[href*="/watch/"]');
          playUrl = movieLink ? movieLink.href : window.location.href;
        }

        tempDb.ref(`rooms/${randomRoomId}`).set({
          password: '',
          hostId: randomUserId,
          hostOnly: false,
          lastState: {
            isPlaying: true,
            currentTime: 0,
            url: normalizeMovieUrl(playUrl),
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
          }
        }).then(() => {
          // Depolamaya oda durumunu yaz (Sekme ID'si dahil)
          chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
            const currentTabId = tabResponse ? tabResponse.tabId : null;
            chrome.storage.local.get(['username'], (res) => {
              const savedName = res.username || '';
              chrome.storage.local.set({
                roomId: randomRoomId,
                userId: randomUserId,
                hostId: randomUserId,
                username: savedName,
                password: '',
                hostOnly: false,
                selectedAvatar: '🍿',
                activeTabId: currentTabId
              }, () => {
                // Davet linkini kopyala
                const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(randomRoomId)}&pass=`;
                
                // Clipboard Fallback kopyalama (Web page context)
                try {
                  const dummy = document.createElement("textarea");
                  document.body.appendChild(dummy);
                  dummy.value = inviteUrl;
                  dummy.select();
                  document.execCommand("copy");
                  document.body.removeChild(dummy);
                  console.log('[FilmSync] Davet linki panoya kopyalandı.');
                } catch (err) {
                  navigator.clipboard.writeText(inviteUrl);
                }

                // Videoyu başlat
                playBtn.click();
              });
            });
          });
        }).catch(err => {
          console.error('[FilmSync] Oynatma butonuyla oda kurulumu hatası:', err);
          playBtn.click();
        });
      } else {
        alert('Film oynatma butonu bulunamadı.');
      }
    });

    container.appendChild(startBtn);
  });
}

function startButtonObserver() {
  if (!window.location.host.includes('netflix.com')) return;
  
  if (netflixButtonObserver) {
    netflixButtonObserver.disconnect();
    netflixButtonObserver = null;
  }

  // /watch/ sayfasındaysak (oynatıcıdayken) browse kartı observer'ı kesinlikle çalıştırma!
  // Bu sayede video oynatılırken CPU %0 yük tüketir, donma ve kasma yaşanmaz.
  if (window.location.pathname.includes('/watch')) {
    return;
  }

  const debouncedInject = () => {
    if (netflixButtonDebounceTimer) clearTimeout(netflixButtonDebounceTimer);
    netflixButtonDebounceTimer = setTimeout(() => {
      if (!window.location.pathname.includes('/watch')) {
        injectNetflixStartButton();
      }
    }, 400);
  };

  // İlk yüklemede çalıştır
  debouncedInject();

  // Değişimleri izle (Debounce korumalı ve /watch'a geçildiğinde kendini kapatır)
  netflixButtonObserver = new MutationObserver(() => {
    if (window.location.pathname.includes('/watch')) {
      if (netflixButtonObserver) {
        netflixButtonObserver.disconnect();
        netflixButtonObserver = null;
      }
      return;
    }
    debouncedInject();
  });

  const targetNode = document.querySelector('.mainView') || document.body;
  netflixButtonObserver.observe(targetNode, { childList: true, subtree: true });
}

// --- 🖥️ TAM EKRAN VE SOHBET OTOMATİK GİZLEME MOTORU ---
let idleTimer = null;
let autoHideTimer = null;
let isMouseInsideChatPanel = false;
const AUTO_HIDE_DELAY = 3500; // 3.5 saniye
let isFullscreen = false;

function setupFullscreenIdleDetector() {
  if (isFullscreenIdleDetectorAttached) return;
  isFullscreenIdleDetectorAttached = true;

  const handleMouseMove = () => {
    const now = Date.now();
    if (now - lastMouseMoveTime < 150) return; // 150ms throttle: 60/120 FPS farenin CPU/DOM'u kilitlemesini engeller
    lastMouseMoveTime = now;
    
    showPanelAndToolbar();
    resetIdleTimer(isInputFocused ? 5000 : 3500);

    // Eğer sohbet paneli açıksa ve input odaksızsa auto-hide süresini tazele
    if (chatPanel && chatPanel.classList.contains('active') && !isInputFocused) {
      startAutoHideTimer(AUTO_HIDE_DELAY);
    }
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('keydown', handleMouseMove, { passive: true });

  // Tam ekran durum değişikliklerini dinle
  const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  fsEvents.forEach(eventName => {
    document.addEventListener(eventName, () => {
      isFullscreen = !!(document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement);
      
      const toolbar = document.getElementById('filmsync-mini-toolbar');
      const panel = document.getElementById('filmsync-chat-panel');
      
      if (isFullscreen) {
        if (navigator.keyboard && typeof navigator.keyboard.lock === 'function') {
          navigator.keyboard.lock(['Escape']).catch(() => {});
        }
      } else {
        if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
          try { navigator.keyboard.unlock(); } catch (err) {}
        }
        // Tam ekrandan çıkıldığında görünürlüğü sıfırla
        clearTimeout(idleTimer);
        if (toolbar && (!panel || !panel.classList.contains('active'))) {
          toolbar.style.opacity = '1';
          toolbar.style.pointerEvents = 'auto';
        }
        if (panel && panel.classList.contains('active')) {
          panel.style.opacity = '1';
          panel.style.pointerEvents = 'auto';
        }
      }
    });
  });
}

// --- ⚙️ YARDIMCI OTOMATİK GİZLEME FONKSİYONLARI ---
function showPanelAndToolbar() {
  const toolbar = document.getElementById('filmsync-mini-toolbar');
  const panel = document.getElementById('filmsync-chat-panel');
  if (toolbar && (!panel || !panel.classList.contains('active'))) {
    toolbar.style.opacity = '1';
    toolbar.style.pointerEvents = 'auto';
  }
  if (panel && panel.classList.contains('active')) {
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  }
  clearTimeout(idleTimer);
}

function startAutoHideTimer(duration = AUTO_HIDE_DELAY) {
  clearTimeout(autoHideTimer);
  autoHideTimer = setTimeout(() => {
    // Eğer input içinde kullanıcının henüz göndermediği bir taslak mesaj varsa gizleme
    if (messageInput && messageInput.value.trim().length > 0) {
      return;
    }
    const now = Date.now();
    // Son 3.5 saniye içinde aktif yazma olduysa süreyi uzat
    if (lastTypingTime && (now - lastTypingTime < duration)) {
      startAutoHideTimer(duration - (now - lastTypingTime));
      return;
    }
    // Mesaj gönderildikten veya 3.5s hareketsizlikten sonra otomatik gizle
    hideChatPanel(true);
  }, duration);
}

function hideChatPanel() {
  const force = arguments[0];
  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!chatPanel) return;
  if (!force && messageInput && messageInput.value.trim().length > 0) return;

  if (chatPanel.classList.contains('active')) {
    chatPanel.classList.remove('active');
    chatPanel.style.opacity = '0';
    chatPanel.style.pointerEvents = 'none';
    document.body.classList.remove('filmsync-sidebar-open');
    
    if (messageInput && document.activeElement === messageInput) {
      messageInput.blur();
    }
    isInputFocused = false;
    isMouseInsideChatPanel = false;
    broadcastChatState(false);

    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.remove('panel-active');
      if (!isFullscreen) {
        miniToolbar.style.opacity = '1';
        miniToolbar.style.pointerEvents = 'auto';
      }
    }

    const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
    }
    const logoToggleBtn = document.querySelector('.filmsync-tool-btn.tp-logo');
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbet');
      logoToggleBtn.title = 'Sohbet (Enter)';
    }
    window.dispatchEvent(new Event('resize'));
  }
}

function resetIdleTimer(duration = AUTO_HIDE_DELAY) {
  startAutoHideTimer(duration);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (isFullscreen) {
      const toolbar = document.getElementById('filmsync-mini-toolbar');
      if (toolbar && (!chatPanel || !chatPanel.classList.contains('active'))) {
        toolbar.style.opacity = '0';
        toolbar.style.pointerEvents = 'none';
      }
    }
  }, duration);
}

// --- 🖥️ IFRAME TAM EKRAN KORUYUCUSU (DİZİPAL, Vidmoly VB.) ---
function startIframeFullscreenKeeper() {
  if (window === window.top) return; // Sadece iframe'lerde çalışsın
  
  if (iframeKeeperInterval) clearInterval(iframeKeeperInterval);
  iframeKeeperInterval = setInterval(() => {
    const fsElement = document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.mozFullScreenElement || 
                      document.msFullscreenElement;
                      
    const root = document.getElementById('filmsync-root');
    
    if (fsElement) {
      // Iframe tam ekrandaysa ve UI yoksa oluştur
      if (!root) {
        console.log('[FilmSync Iframe Keeper] Tam ekran algılandı, UI oluşturuluyor.');
        createChatUI();
        initializeFirebase(firebaseConfig);
      }
      
      // filmsync-root'u tam ekran elementinin içine taşı (eğer henüz taşınmadıysa)
      const currentRoot = document.getElementById('filmsync-root');
      if (currentRoot && currentRoot.parentNode !== fsElement) {
        fsElement.appendChild(currentRoot);
        currentRoot.style.position = 'absolute';
        currentRoot.style.zIndex = '2147483647';
      }
    } else {
      // Iframe tam ekranda değilse ve UI varsa kesinlikle yok et!
      if (root) {
        console.log('[FilmSync Iframe Keeper] Tam ekrandan çıkış algılandı, UI temizleniyor.');
        removeChatUI();
      }
    }
  }, 1000);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
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

let isGlobalKeyListenersAttached = false;
function attachGlobalKeyListeners() {
  if (isGlobalKeyListenersAttached) return;
  isGlobalKeyListenersAttached = true;
  window.addEventListener('keydown', handleGlobalEnterKey, true);
  document.addEventListener('keydown', handleGlobalEnterKey, true);
  window.addEventListener('keyup', handleGlobalKeySuppression, true);
  document.addEventListener('keyup', handleGlobalKeySuppression, true);
  window.addEventListener('keypress', handleGlobalKeySuppression, true);
  document.addEventListener('keypress', handleGlobalKeySuppression, true);
}

// Global Chat-First Klavye Yakalayıcısı (Window & Document Çift Yakalama)
attachGlobalKeyListeners();

// Cross-Frame Klavye Köprüsü (Iframe içinden basılan tuşları ana pencereye aktarır)
window.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'filmsync-query-chat-state') {
    const panel = document.getElementById('filmsync-chat-panel');
    const isCurrentlyOpen = panel ? panel.classList.contains('active') : isChatOpenInTop;
    try {
      event.source?.postMessage({
        type: 'filmsync-chat-state',
        isOpen: !!isCurrentlyOpen
      }, '*');
    } catch (e) {}
  } else if (event.data.type === 'filmsync-chat-state') {
    isChatOpenInTop = !!event.data.isOpen;
  } else if (event.data.type === 'filmsync-iframe-keydown') {
    try { window.focus(); } catch (e) {}
    if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
    if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');
    
    // Panel kapalıysa ve alfanümerik veya Enter geldiyse paneli aç
    const isChatOpen = !!(chatPanel && chatPanel.classList.contains('active'));
    if (!isChatOpen) {
      if (event.data.key === 'Enter' || (event.data.key && event.data.key.length === 1 && event.data.key !== ' ')) {
        showPanelAndToolbar();
        if (chatPanel) {
          chatPanel.classList.add('active');
          chatPanel.style.opacity = '1';
          chatPanel.style.pointerEvents = 'auto';
          document.body.classList.add('filmsync-sidebar-open');
        }
        broadcastChatState(true);
        startAutoHideTimer(AUTO_HIDE_DELAY);
      }
    }
    
    if (messageInput) {
      messageInput.focus();
    }
    
    handleGlobalEnterKey({
      key: event.data.key,
      code: event.data.code,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: () => {},
      stopPropagation: () => {},
      stopImmediatePropagation: () => {}
    });
  }
});

// Iframe başlangıcında ana pencere sohbet durumunu sorgula
if (window !== window.top) {
  try {
    window.top.postMessage({ type: 'filmsync-query-chat-state' }, '*');
  } catch (e) {}
}


