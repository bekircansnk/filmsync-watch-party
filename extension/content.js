// Evo ve Beko Film Partisi (Teleparty Clone) 🍿
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
        
        // Kendi sekme ID'mizi alıp activeTabId olarak kaydet
        chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
          const myTabId = tabResponse ? tabResponse.tabId : null;
          const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
          
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
      });
      return;
    }
  }

  // Normal Başlatma
  chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
    const myTabId = tabResponse ? tabResponse.tabId : null;

    chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId'], (result) => {
      if (result.roomId) {
        // Aktif Sekme İzolasyonu: Sadece popup üzerinden oda kurulan/katılınan aktif sekmede çalıştır!
        // result.activeTabId tanımlıysa ve benim sekmemle eşleşmiyorsa diğer sekmelerdeki işlemleri bloke et.
        if (!result.activeTabId || (myTabId !== null && myTabId !== result.activeTabId)) {
          console.log(`[FilmSync İzolasyon] Eklenti bu sekmede pasif. Aktif Sekme ID: ${result.activeTabId}, Bu Sekme ID: ${myTabId}`);
          removeChatUI();
          cleanupFirebase();
          return;
        }

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
  });
}

// Sayfa yenilenirken veya kapanırken durum güncellemesi tetikle (REST API üzerinden Service Worker ile çalışır)
window.addEventListener('beforeunload', () => {
  if (roomId && isFirebaseInitialized && window === window.top) {
    // Sayfa kapanırken oynatıcı eventlerinin tetiklenmesini önlemek için dinleyicileri derhal kaldır
    removeVideoListeners();

    chrome.runtime.sendMessage({
      type: 'page-unload',
      roomId: roomId,
      username: username,
      userId: userId
    });
  }
});

// Storage ve Popup Mesaj Dinleyicileri
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settings-updated') {
    init(); // Ayarlar güncellendiğinde tekrar başlat
    sendResponse({ status: 'success' });
  } else if (message.type === 'force-sync') {
    forceSync();
    sendResponse({ status: 'success' });
  }
});

// Canlı Depolama Değişikliği Dinleyicisi (Iframe'ler ve Üst Sayfa Eşleşmesi İçin)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.roomId || changes.username || changes.password || changes.activeTabId) {
      console.log('[FilmSync Storage] Depolama değişikliği algılandı, oda ayarları yenileniyor.');
      
      // Mevcut Firebase dinleyicilerini temizle
      cleanupFirebase();
      isFirebaseInitialized = false;
      
      chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
        const myTabId = tabResponse ? tabResponse.tabId : null;

        chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId'], (result) => {
          if (!result.activeTabId || (myTabId !== null && myTabId !== result.activeTabId)) {
            console.log(`[FilmSync İzolasyon Storage] Eklenti bu sekmede pasif hale getiriliyor.`);
            removeChatUI();
            return;
          }

          roomId = result.roomId;
          username = result.username || 'Anonim';
          password = result.password || '';
          selectedAvatar = result.selectedAvatar || '🍿';
          
          if (result.userId) userId = result.userId;

          if (roomId) {
            console.log(`[FilmSync Storage] Yeni oda bağlantısı tetikleniyor: ${roomId}`);
            initializeFirebase(firebaseConfig);
            
            if (videoElement) {
              forceSync();
              if (!document.getElementById('filmsync-root')) {
                createChatUI();
                startUIKeeper();
              }
            }
          } else {
            removeChatUI();
          }
        });
      });
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
    
    const roomRef = db.ref(`rooms/${roomId}`);
    
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      const hasVideo = !!document.querySelector('video');
      
      if (roomData) {
        if (roomData.password && roomData.password !== password) {
          alert('[FilmSync Hata] Hatalı oda şifresi!');
          removeChatUI();
          cleanupFirebase();
          return;
        }
        
        // Eğer odaya giren kişi oda sahibi (host) ise ve geçerli bir video sayfasındaysa oda durumunu güncellesin.
        // F5 ile yenilemelerde veya tekrar girişlerde mevcuttaki lastState durumunu sıfırlamak yerine koruyacağız!
        // Sadece Firebase'de henüz lastState yoksa (veya url tanımsızsa) durum başlatılmalıdır.
        if (roomData.hostId === userId && window === window.top && hasVideo) {
          db.ref(`rooms/${roomId}/lastState`).once('value').then((stateSnap) => {
            const currentState = stateSnap.val();
            // Eğer Firebase'de zaten geçerli bir lastState varsa ve url bizim şu anki url ile aynıysa, sıfırlama yapma!
            if (currentState && currentState.url === window.location.href && currentState.currentTime > 0) {
              console.log('[FilmSync] Host yenileme algılandı, mevcut oda durumu korunuyor:', currentState);
            } else {
              // Oda yeni kuruluyorsa veya url değiştiyse durum güncellensin (sadece embed adresi değilse)
              const validUrl = (!isEmbedUrl(window.location.href)) ? window.location.href : (currentState?.url || '');
              db.ref(`rooms/${roomId}/lastState`).update({
                url: validUrl,
                isPlaying: false,
                currentTime: 0,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                senderId: userId
              });
            }
          });
        }
      } else {
        if (window === window.top) {
          // Oda ilk kez kurulurken eğer video varsa URL ile kur, yoksa boş veya mevcut URL ile kur ama durumları sıfırla.
          const initialUrl = (hasVideo && !isEmbedUrl(window.location.href)) ? window.location.href : '';
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

    // Bildirim Toast'u (Panel kapalıyken veya idle nedeniyle gizlenmişken tetiklenir)
    const msgAge = Date.now() - (msg.timestamp || 0);
    if (msgAge < 10000 && !msg.isSystem && msg.username !== username) {
      const isPanelActive = chatPanel && chatPanel.classList.contains('active');
      const isPanelHidden = chatPanel && chatPanel.style.opacity === '0';
      if (!isPanelActive || isPanelHidden) {
        showNotificationToast(msg.username, msg.message);
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
          bufferText.textContent = `${bufferingUsers.join(', ')} yükleniyor (buffering)...`;
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
    }
  });
}

// Video elementinin hazır olup olmadığını sorgulayan ve bekleyen mekanizma
function ensureVideoReady(callback, retriesLeft = 10) {
  const activeVideo = document.querySelector('video');
  if (activeVideo) videoElement = activeVideo;

  if (videoElement && videoElement.readyState >= 1) {
    callback(true);
  } else if (retriesLeft > 0) {
    console.log(`[FilmSync] Video elementinin hazır olması bekleniyor... Kalan deneme: ${retriesLeft}`);
    setTimeout(() => {
      ensureVideoReady(callback, retriesLeft - 1);
    }, 500);
  } else {
    console.log('[FilmSync] Video elementi zaman aşımına uğradı veya bulunamadı.');
    callback(false);
  }
}

// Uzak Durumu Videoya Uygula
function applyRemoteState(state) {
  if (!state) return;
  
  // Yönlendirme bildirimi (Sadece video adresi farklıysa ve üst penceredeysek)
  if (state.url && state.url !== window.location.href && window === window.top) {
    showMovieRedirectNotification(state.url);
    return;
  }

  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) return;

    isSyncing = true;
    try {
      const timeDiff = state.isPlaying ? Math.max(0, (Date.now() - state.lastUpdated) / 1000) : 0;
      const targetTime = state.currentTime + timeDiff;

      // Programatik eylem öncesi yerel dinleyicileri kaldır
      removeVideoListeners();

      if (state.isPlaying && videoElement.paused) {
        PlayerAdapter.seek(targetTime);
        PlayerAdapter.play();
      } else if (!state.isPlaying && !videoElement.paused) {
        PlayerAdapter.seek(state.currentTime);
        PlayerAdapter.pause();
      } else if (Math.abs(videoElement.currentTime - targetTime) > 1.5) {
        PlayerAdapter.seek(targetTime);
      }
    } catch (e) {
      console.error('[FilmSync] Medya eşileme hatası:', e);
    }
    
    // Gecikmeli olarak yerel dinleyicileri geri tak ve kilidi kaldır (Kekelemeyi önlemek için 1.0 saniye kilit)
    setTimeout(() => {
      setupVideoListeners();
      isSyncing = false;
      isFirstSync = false; // İlk senkronizasyon kilidini kaldır
      
      // Kilit açıldığında sıradaki bekleyen durum varsa onu uygula
      if (pendingState) {
        const nextState = pendingState;
        pendingState = null;
        applyRemoteState(nextState);
      }
    }, 1000);
  });
}

// Zorla Senkronize Et
function forceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;

    // Yönlendirme bildirimi (Eğer veritabanındaki URL ile mevcut URL farklıysa ve üst penceredeysek, yönlendirme bildirimini göster)
    if (state.url && state.url !== window.location.href && window === window.top) {
      showMovieRedirectNotification(state.url);
      return;
    }

    ensureVideoReady((isReady) => {
      if (!isReady || !videoElement) {
        isFirstSync = false;
        return;
      }

      isSyncing = true;
      try {
        const timeDiff = state.isPlaying ? Math.max(0, (Date.now() - state.lastUpdated) / 1000) : 0;
        const targetTime = state.currentTime + timeDiff;

        removeVideoListeners(); // Dinleyicileri kaldır
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying) {
          PlayerAdapter.play();
        } else {
          PlayerAdapter.pause();
        }
      } catch (e) {
        console.error(e);
      }
      setTimeout(() => { 
        setupVideoListeners(); // Dinleyicileri geri tak
        isSyncing = false; 
        isFirstSync = false; // İlk senkronizasyon kilidini kaldır
        console.log('[FilmSync] İlk senkronizasyon başarıyla tamamlandı, kilit kaldırıldı.');
      }, 2000);
    });
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
    db.ref(`rooms/${roomId}/reactions`).off();
    
    renderedMessageKeys.clear();
  }
}

// Medya Olayını Gönderme
function sendMediaEvent(isPlaying, currentTime) {
  if (!db || !roomId || isSyncing || isFirstSync) return;
  
  // Sadece host kontrolü aktifse ve ben host değilsem engelle
  if (hostOnly && userId !== hostId) {
    console.log('[FilmSync] Medya kontrolü engellendi: Sadece oda sahibi kontrol edebilir.');
    return;
  }

  // Video sayfası olmayan sayfalardan veritabanına play/pause/seek yazılmasını engelle
  const activeVideo = document.querySelector('video');
  if (!activeVideo) {
    console.log('[FilmSync] Video elementi olmayan sayfadan medya olayı gönderilmesi engellendi.');
    return;
  }

  // Video henüz yüklenmediyse (hazır değilse) veya süresi tanımsız ise gönderme
  if (activeVideo.readyState < 1 || isNaN(activeVideo.duration) || activeVideo.duration === 0) {
    console.log('[FilmSync] Video henüz hazır değil, medya olayı atlanıyor.');
    return;
  }

  const updatePayload = {
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  // URL güncelleme yetkisi sadece oda sahibine (host), ana pencereye (window.top) ve embed olmayan adreslere aittir.
  if (userId === hostId && window === window.top && !isEmbedUrl(window.location.href)) {
    updatePayload.url = window.location.href;
  }

  db.ref(`rooms/${roomId}/lastState`).update(updatePayload).then(() => {
    const formattedTime = formatTime(currentTime);
    const msgText = isPlaying 
      ? `${username} filmi başlattı. (Kaldığı yer: ${formattedTime})`
      : `${username} filmi duraklattı.`;
    sendSystemMessage(msgText);
  }).catch(err => console.error('[FilmSync] Medya durum yazma hatası:', err));
}

// Videolu Sayfalarda UI Motoru
function startVideoTracking() {
  setInterval(() => {
    const activeVideo = document.querySelector('video');
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
      
      console.log('[FilmSync] Video tespit edildi. Eşitleme yapılıyor.');
      forceSync();

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

// Akıllı Eşitleme ve Sağlık Denetleyicisi (Heartbeat & Auto-Sync)
function startDriftCorrection() {
  setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing) return;
    if (videoElement.readyState < 3) return; // Oynatıcı hazır değilse bekle

    // 1. BEN HOST (ODA SAHİBİ) İSEM: Firebase'deki durumu periyodik güncelle (Heartbeat)
    if (userId === hostId) {
      if (!videoElement.paused) {
        db.ref(`rooms/${roomId}/lastState`).update({
          isPlaying: true,
          currentTime: videoElement.currentTime,
          senderId: userId,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      }
      return;
    }

    // 2. BEN GUEST (KATILAN KİŞİ) İSEM: Host durumunu oku ve sapma varsa otomatik düzelt
    db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
      const state = snapshot.val();
      if (!state || state.senderId === userId || isSyncing) return;

      const timeDiff = state.isPlaying ? Math.max(0, (Date.now() - state.lastUpdated) / 1000) : 0;
      const expectedTime = state.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - expectedTime);

      // Oynatma durumu uyuşmuyorsa veya süre sapması 2.5 saniyeden büyükse otomatik eşitle
      const playStateMismatch = state.isPlaying !== !videoElement.paused;

      if (playStateMismatch || drift > 2.5) {
        console.log(`[FilmSync Auto-Sync] Sapma veya durum uyumsuzluğu düzeltiliyor. Sapma: ${drift.toFixed(1)}sn`);
        isSyncing = true;
        
        removeVideoListeners(); // Dinleyicileri kaldır
        PlayerAdapter.seek(expectedTime);
        if (state.isPlaying && videoElement.paused) {
          PlayerAdapter.play();
        } else if (!state.isPlaying && !videoElement.paused) {
          PlayerAdapter.pause();
        }
        
        setTimeout(() => {
          setupVideoListeners(); // Dinleyicileri geri tak
          isSyncing = false;
        }, 1500);
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
  // Eğer bu olay programatik bir senkronizasyon ise veya event isTrusted değilse yut
  const isProgrammatic = isSyncing || (e && e.isTrusted === false);
  if (isProgrammatic) return;

  sendMediaEvent(true, videoElement.currentTime);
}

function handlePauseEvent(e) {
  // Eğer bu olay programatik bir senkronizasyon ise veya event isTrusted değilse yut
  const isProgrammatic = isSyncing || (e && e.isTrusted === false);
  if (isProgrammatic) return;

  sendMediaEvent(false, videoElement.currentTime);
}

function handleSeekEvent(e) {
  // Eğer bu olay programatik bir senkronizasyon ise veya event isTrusted değilse yut
  const isProgrammatic = isSyncing || (e && e.isTrusted === false);
  if (isProgrammatic) return;

  sendMediaEvent(!videoElement.paused, videoElement.currentTime);
}

function handleWaitingEvent() {
  if (!db || !roomId || !userId) return;
  db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: true });
}

function handlePlayingEvent() {
  if (!db || !roomId || !userId) return;
  db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: false });
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
    'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
  ].join(' !important; ') + ' !important;');

  const style = document.createElement('style');
  style.textContent = `
    /* Mini Dikey Araç Çubuğu (Mini-Toolbar) */
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
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease !important;
    }
    #filmsync-mini-toolbar.panel-active {
      right: 282px !important; /* Panel genişliği (270px) + boşluk */
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
    .filmsync-tool-btn.exit-btn:hover {
      background: rgba(229, 9, 20, 0.2);
    }
    .filmsync-tool-btn.exit-btn:hover svg {
      fill: #e50914;
    }
    
    /* TP Logosu Kırmızı Ripple Efekti */
    @keyframes red-ripple {
      0% {
        box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.8), 0 0 0 0 rgba(229, 9, 20, 0.5);
      }
      100% {
        box-shadow: 0 0 0 15px rgba(229, 9, 20, 0), 0 0 0 30px rgba(229, 9, 20, 0);
      }
    }
    .filmsync-tool-btn.tp-logo.clicked {
      animation: red-ripple 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards !important;
    }
    
    /* Araç İpucu (Tooltip) */
    .filmsync-tool-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      right: 48px;
      top: 50%;
      transform: translateY(-50%) scale(0.95);
      background: rgba(10, 10, 10, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: all 0.15s ease;
    }
    .filmsync-tool-btn:hover::after {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    /* Dikey Sohbet Paneli (Sidebar) */
    #filmsync-chat-panel {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      transform: translateX(280px) !important;
      width: 270px;
      height: 100%;
      background: rgba(15, 15, 15, 0.65) !important;
      backdrop-filter: blur(20px) saturate(120%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(120%) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease !important;
      will-change: transform;
      z-index: 2147483646 !important;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
      pointer-events: auto !important;
    }
    #filmsync-chat-panel.active {
      transform: translateX(0) !important;
    }

    /* Header Bileşenleri */
    .filmsync-header {
      padding: 16px 15px;
      background: rgba(20, 20, 20, 0.4) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .filmsync-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filmsync-header-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .filmsync-header-title span {
      background: linear-gradient(135deg, #e50914, #ff3d47);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .filmsync-premium-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #e1b12c;
      color: #000;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .filmsync-premium-badge:hover {
      opacity: 0.9;
    }
    .filmsync-close-btn {
      background: transparent;
      border: none;
      color: #aaa;
      cursor: pointer;
      font-size: 1.4rem;
      line-height: 1;
      transition: color 0.2s;
    }
    .filmsync-close-btn:hover {
      color: #fff;
    }
    .filmsync-users {
      font-size: 0.78rem;
      font-weight: 500;
      color: #aaa;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .filmsync-users-dot {
      width: 8px;
      height: 8px;
      background-color: #2ed573;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px #2ed573;
    }

    /* Mesaj Listesi */
    #filmsync-messages {
      flex: 1;
      padding: 20px 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #141414;
    }
    #filmsync-messages::-webkit-scrollbar {
      width: 6px;
    }
    #filmsync-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .filmsync-msg-row {
      display: flex;
      flex-direction: column;
      max-width: 82%;
    }
    .filmsync-msg-row.self { align-self: flex-end; }
    .filmsync-msg-row.other { align-self: flex-start; }
    .filmsync-msg-row.system { align-self: center; max-width: 90%; }

    .filmsync-msg-sender {
      font-size: 1.05rem !important;
      color: #888 !important;
      margin-bottom: 4px !important;
      margin-left: 6px !important;
      font-weight: 600 !important;
    }
    .filmsync-msg-row.self .filmsync-msg-sender {
      text-align: right !important;
      margin-right: 6px !important;
    }

    .filmsync-msg-bubble {
      padding: 12px 18px !important;
      border-radius: 18px !important;
      font-size: 1.35rem !important;
      line-height: 1.45 !important;
      word-break: break-word !important;
      color: #fff !important;
    }
    .filmsync-msg-row.self .filmsync-msg-bubble {
      background: #e50914 !important;
      border-bottom-right-radius: 3px !important;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.25) !important;
    }
    .filmsync-msg-row.other .filmsync-msg-bubble {
      background: #2f2f2f !important;
      border-bottom-left-radius: 3px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    }
    .filmsync-msg-row.system .filmsync-msg-bubble {
      background: transparent !important;
      border: none !important;
      color: #e1b12c !important;
      font-size: 1.05rem !important;
      text-align: center !important;
      font-style: italic !important;
      box-shadow: none !important;
      padding: 4px !important;
    }

    /* Buffering Göstergesi */
    .filmsync-buffering-indicator {
      font-size: 0.75rem;
      color: #aaa;
      padding: 4px 15px;
      background: rgba(229, 9, 20, 0.15);
      border-top: 1px solid rgba(229, 9, 20, 0.3);
      display: none;
      align-items: center;
      gap: 6px;
    }
    .filmsync-buffering-indicator.active {
      display: flex;
    }
    .filmsync-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: fs-spin 0.8s linear infinite;
    }

    /* Reaksiyon Emojileri Barı */
    .filmsync-reaction-bar {
      display: flex;
      justify-content: space-around;
      padding: 8px 10px;
      background: rgba(20, 20, 20, 0.4) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
    }
    .filmsync-react-btn {
      font-size: 1.25rem;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: transform 0.15s ease;
      padding: 4px;
    }
    .filmsync-react-btn:hover {
      transform: scale(1.3) translateY(-2px);
    }

    /* Mesaj Giriş Alanı */
    .filmsync-input-area {
      padding: 14px 15px 20px 15px;
      background: rgba(20, 20, 20, 0.4) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
      display: flex;
      gap: 8px;
    }
    .filmsync-input-area input {
      flex: 1;
      padding: 11px 14px;
      background: #2f2f2f !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      color: #fff;
      font-size: 0.85rem;
      outline: none;
      transition: all 0.2s ease;
    }
    .filmsync-input-area input:focus {
      border-color: #e50914;
      background: #3a3a3a !important;
      box-shadow: 0 0 10px rgba(229, 9, 20, 0.2);
    }
    .filmsync-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #e50914;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .filmsync-send-btn:hover {
      background: #ff2d38;
      box-shadow: 0 0 10px rgba(229, 9, 20, 0.4);
    }
    .filmsync-send-btn svg {
      width: 16px;
      height: 16px;
      fill: #fff;
      margin-left: 2px;
    }

    /* Uçan Emojiler Animasyon Alanı */
    #filmsync-reaction-layer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483645 !important;
      overflow: hidden;
    }
    .flying-emoji {
      position: absolute;
      bottom: -50px;
      font-size: 2.2rem;
      animation: flyUp 3.5s cubic-bezier(0.075, 0.82, 0.165, 1) forwards;
      opacity: 0.9;
    }

    /* Toast Bildirim */
    .filmsync-toast {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      transform: translateX(340px) !important;
      width: 280px;
      background: rgba(20, 20, 20, 0.95) !important;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 14px 18px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2147483647 !important;
      cursor: pointer;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
      pointer-events: auto !important;
    }
    .filmsync-toast.active { transform: translateX(0) !important; }
    .filmsync-toast-header {
      font-size: 0.72rem;
      font-weight: 700;
      color: #e50914;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filmsync-toast-body {
      font-size: 0.85rem;
      color: #fff;
    }

    /* Sayfa Daraltma & Kaydırma Kuralları */
    body.filmsync-sidebar-open {
      width: calc(100% - 270px) !important;
      transition: width 0.3s ease;
    }
    /* Netflix, YouTube, Disney+ Player İzolasyonları */
    body.filmsync-sidebar-open .watch-video,
    body.filmsync-sidebar-open .nf-player-container,
    body.filmsync-sidebar-open #ytd-player,
    body.filmsync-sidebar-open .html5-video-player,
    body.filmsync-sidebar-open disney-web-player,
    body.filmsync-sidebar-open .btm-media-player,
    body.filmsync-sidebar-open .media-client-container {
      width: calc(100% - 270px) !important;
      left: 0 !important;
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

  const parser = new DOMParser();
  const rawHtml = `
    <!-- Dikey Araç Çubuğu (Mini-Toolbar) -->
    <div id="filmsync-mini-toolbar" class="panel-active">
      <button class="filmsync-tool-btn tp-logo" data-tooltip="Evo & Beko Partisi">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
      </button>
    </div>
    
    <!-- Sohbet Dikey Paneli (Sidebar) -->
    <div id="filmsync-chat-panel" class="active">
      <div class="filmsync-header">
        <div class="filmsync-header-top">
          <div class="filmsync-header-title">Evo & Beko<span>.</span>🍿</div>
          <div class="filmsync-premium-badge">PREMIUM</div>
          <button class="filmsync-close-btn" id="filmsyncCloseBtn">×</button>
        </div>
        <div class="filmsync-users" id="filmsyncUserList">
          <span class="filmsync-users-dot"></span>
          <span id="filmsyncUserListText">Üyeler yükleniyor...</span>
        </div>
      </div>

      <div id="filmsync-messages"></div>
      
      <!-- Yükleniyor / Buffer Göstergesi -->
      <div class="filmsync-buffering-indicator" id="filmsyncBufferingIndicator">
        <div class="filmsync-spinner"></div>
        <span id="filmsyncBufferingText">Birileri yükleniyor...</span>
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
        <input type="text" id="filmsyncMsgInput" placeholder="Mesaj yazın..." autocomplete="off">
        <button class="filmsync-send-btn" id="filmsyncSendBtn">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

    <!-- Reaksiyon Katmanı -->
    <div id="filmsync-reaction-layer"></div>
  `;
  const doc = parser.parseFromString(rawHtml, 'text/html');
  Array.from(doc.body.childNodes).forEach(node => {
    root.appendChild(node.cloneNode(true));
  });

  document.body.appendChild(root);
  document.head.appendChild(style);

  // Arayüz açıkken sayfa yerleşimini daralt
  document.body.classList.add('filmsync-sidebar-open');

  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  messageList = document.getElementById('filmsync-messages');
  userListDisplay = document.getElementById('filmsyncUserListText');
  reactionContainer = document.getElementById('filmsync-reaction-layer');
  const sendBtn = document.getElementById('filmsyncSendBtn');

  // Input durumuna göre gönder butonu aktifliği
  if (sendBtn && messageInput) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
    messageInput.addEventListener('input', () => {
      const hasText = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.4';
    });
    messageInput.addEventListener('focus', () => {
      isInputFocused = true;
      showPanelAndToolbar();
      resetIdleTimer(5000);
    });
    messageInput.addEventListener('blur', () => {
      isInputFocused = false;
      resetIdleTimer(3000);
    });
    messageInput.addEventListener('keydown', () => {
      if (isInputFocused) {
        resetIdleTimer(5000);
      }
    });
  }

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

  // Gönderme olayları
  sendBtn.addEventListener('click', sendChatMessage);
  messageInput.addEventListener('keydown', (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.key === 'Enter') {
      sendChatMessage();
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

  // Emoji reaksiyonları gönderme olayları
  document.querySelectorAll('.filmsync-react-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      sendEmojiReaction(emoji);
    });
  });

  document.addEventListener('keydown', handleGlobalEnterKey, true);

  // Eğer kuyrukta birikmiş geçmiş mesajlar varsa onları anında render et!
  if (messagesQueue.length > 0) {
    console.log(`[Evo ve Beko Queue] Kuyrukta biriken ${messagesQueue.length} mesaj ekrana basılıyor.`);
    messagesQueue.forEach(msg => appendMessage(msg));
    messagesQueue = [];
  }

  // Eğer Firebase zaten kurulmuşsa, yeni DOM oluşturulduğu için geçmiş mesajları tekrar çekip render edelim!
  if (db && roomId) {
    renderedMessageKeys.clear();
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).once('value').then((snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        if (messageList) messageList.textContent = '';
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
  setInterval(() => {
    if (roomId && !document.getElementById('filmsync-root') && window === window.top) {
      console.log('[FilmSync UI Keeper] Arayüz yenileniyor.');
      createChatUI();
    }
  }, 2000);
}

function removeChatUI() {
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
      chatToggleBtn.textContent = '';
      const svgDoc = new DOMParser().parseFromString('<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>', 'image/svg+xml');
      chatToggleBtn.appendChild(svgDoc.documentElement.cloneNode(true));
    }
  } else {
    document.body.classList.remove('filmsync-sidebar-open');
    if (miniToolbar) miniToolbar.classList.remove('panel-active');
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.textContent = '';
      const svgDoc = new DOMParser().parseFromString('<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>', 'image/svg+xml');
      chatToggleBtn.appendChild(svgDoc.documentElement.cloneNode(true));
    }
  }
  
  // Oynatıcı boyutlandırmasını tetiklemek için resize olayı fırlat
  window.dispatchEvent(new Event('resize'));
}


function handleGlobalEnterKey(e) {
  const activeEl = document.activeElement;
  const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable;
  if (isInput) return;

  // 1. Enter tuşu ile paneli açma/kapatma
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

  // 2. Alfanümerik tuşlar ve Space (boşluk) tuşlarının yakalanması
  const isAlphanumericOrSpace = (e.key.length === 1 || e.key === 'Spacebar' || e.key === ' ') && 
                                 !e.ctrlKey && !e.metaKey && !e.altKey;

  if (isAlphanumericOrSpace) {
    // Oynatıcının kısayollarını tamamen bloke et!
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Paneli aç (eğer açık değilse)
    if (chatPanel && !chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }

    // Input alanına odaklan ve basılan karakteri yaz
    if (messageInput) {
      messageInput.focus();
      const char = e.key === ' ' || e.key === 'Spacebar' ? ' ' : e.key;
      messageInput.value += char;
      messageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
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
  
  if (messageInput) {
    messageInput.blur();
  }
  resetIdleTimer(5000);
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
    timeSpan.setAttribute('style', 'font-size: 0.65rem; color: #666; font-weight: normal; margin-left: 6px;');
    timeSpan.textContent = timeStr;
    msgSender.appendChild(timeSpan);

    const msgBubble = document.createElement('div');
    msgBubble.className = 'filmsync-msg-bubble';
    msgBubble.textContent = message;

    row.appendChild(msgSender);
    row.appendChild(msgBubble);
  }

  messageList.appendChild(row);
  messageList.scrollTop = messageList.scrollHeight;
}

function updateUsersDisplay(usersList) {
  if (!userListDisplay) return;
  userListDisplay.textContent = '';
  
  usersList.forEach(u => {
    const userBadge = document.createElement('span');
    userBadge.className = 'filmsync-user-badge';
    userBadge.setAttribute('style', 'margin-right: 6px; margin-bottom: 4px; display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.08); padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; color: #fff;');
    
    const avatarSpan = document.createElement('span');
    avatarSpan.textContent = u.avatar || '🍿';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = u.username;
    nameSpan.style.fontWeight = '600';
    
    userBadge.appendChild(avatarSpan);
    userBadge.appendChild(nameSpan);
    
    if (u.isBuffering) {
      const bufferDot = document.createElement('span');
      bufferDot.setAttribute('style', 'width: 6px; height: 6px; background-color: #ff3d47; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #ff3d47; margin-left: 2px;');
      userBadge.appendChild(bufferDot);
    }
    
    userListDisplay.appendChild(userBadge);
  });
}

// --- 🔔 APPLE TARZI BİLDİRİM TOAST MOTORU ---
function showNotificationToast(sender, text) {
  const container = document.getElementById('filmsync-root') || document.body;

  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  
  const toastHeader = document.createElement('div');
  toastHeader.className = 'filmsync-toast-header';
  toastHeader.textContent = sender;

  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';
  toastBody.setAttribute('style', 'font-size: 0.95rem; line-height: 1.3; font-weight: 500;');
  toastBody.textContent = text;

  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  // Toast'a tıklanınca paneli aç ve toast'u kaldır
  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
    
    // Eğer panel kapalıysa veya idle ile gizlendiyse aç
    const toolbar = document.getElementById('filmsync-mini-toolbar');
    const panel = document.getElementById('filmsync-chat-panel');
    if (toolbar) {
      toolbar.style.opacity = '1';
      toolbar.style.pointerEvents = 'auto';
    }
    if (panel) {
      panel.style.opacity = '1';
      panel.style.pointerEvents = 'auto';
      if (!panel.classList.contains('active')) {
        toggleChatPanel();
      }
    }
  });

  // Mesaj uzunluğuna göre dinamik bekleme süresi (Minimum 5 saniye)
  const duration = Math.max(5000, text.length * 100);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }
  }, duration);
}

// --- 🎬 YÖNLENDİRME BİLDİRİM TOASTI ---
function showMovieRedirectNotification(targetUrl) {
  if (isEmbedUrl(targetUrl)) {
    console.log('[FilmSync] Hedef URL bir embed adresi olduğundan yönlendirme toastu engellendi:', targetUrl);
    return;
  }
  // Eğer sayfada zaten video/film oynatıcısı varsa veya toast zaten açık ise gösterme
  if (videoElement || document.querySelector('video')) {
    console.log('[FilmSync] Sayfada zaten video/film oynatıcısı var, yeni film bildirim toastu atlanıyor.');
    return;
  }
  if (document.getElementById('filmsync-redirect-toast')) return;

  const container = document.getElementById('filmsync-root') || document.body;
  const toast = document.createElement('div');
  toast.id = 'filmsync-redirect-toast';
  toast.classList.add('filmsync-toast');
  toast.style.background = 'rgba(69, 243, 255, 0.2)';
  toast.style.borderColor = '#45f3ff';
  toast.style.position = 'relative'; // Kapatma butonu için relative
  
  // Kapatma Tuşu (X)
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('style', 'position: absolute; top: 6px; right: 10px; color: #888; font-weight: bold; cursor: pointer; font-size: 0.8rem; z-index: 10;');
  closeBtn.addEventListener('mouseover', () => closeBtn.style.color = '#fff');
  closeBtn.addEventListener('mouseout', () => closeBtn.style.color = '#888');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Toast tıklama olayını engelle
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  });
  
  const toastHeader = document.createElement('div');
  toastHeader.className = 'filmsync-toast-header';
  toastHeader.textContent = 'Yeni Film Akışı 🎬';

  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';
  toastBody.setAttribute('style', 'color: #45f3ff; font-weight: bold; cursor: pointer; padding-right: 15px;');
  toastBody.textContent = 'Oda sahibi yeni bir film açtı. Katılmak için tıklayın! 🍿';

  toast.appendChild(closeBtn);
  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('active');
  }, 50);

  // 10 saniye sonra otomatik kaldır
  const autoRemoveTimer = setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 10000);

  toast.addEventListener('click', () => {
    clearTimeout(autoRemoveTimer);
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
  const overlay = document.createElement('div');
  overlay.id = 'filmsync-autojoin-overlay';
  overlay.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 12, 16, 0.9); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2147483647 !important; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  const parser = new DOMParser();
  const rawHtml = `
    <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 10px;">FilmSync 🍿</div>
    <div style="font-size: 1.2rem; color: #45f3ff; font-weight: 600; margin-bottom: 20px;" id="filmsync-autojoin-room-text">
    </div>
    <div style="width: 40px; height: 40px; border: 4px solid rgba(69, 243, 255, 0.1); border-top-color: #45f3ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  const doc = parser.parseFromString(rawHtml, 'text/html');
  const roomTextDiv = doc.getElementById('filmsync-autojoin-room-text');
  if (roomTextDiv) {
    roomTextDiv.textContent = '"' + roomName + '" Odasına Katılınıyor...';
  }
  Array.from(doc.body.childNodes).forEach(node => {
    overlay.appendChild(node.cloneNode(true));
  });
  Array.from(doc.head.childNodes).forEach(node => {
    overlay.appendChild(node.cloneNode(true));
  });
  document.body.appendChild(overlay);
}

// --- 🏷️ İSİM PROMPT MODALI ---
function showNamePromptModal(roomName, callback) {
  if (document.getElementById('filmsync-name-prompt-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'filmsync-name-prompt-modal';
  modal.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 12, 16, 0.85); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  const parser = new DOMParser();
  const rawHtml = `
    <div style="width: 320px; background: rgba(31, 40, 51, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); text-align: center; color: #fff;">
      <div style="font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; color: #fff;">FilmSync <span>Partisi</span> 🍿</div>
      <div style="font-size: 0.85rem; color: #66fcf1; margin-bottom: 20px;" id="filmsync-prompt-room-text"></div>
      
      <div style="text-align: left; margin-bottom: 15px;">
        <label style="font-size: 0.75rem; text-transform: uppercase; color: #45f3ff; font-weight: 600; display: block; margin-bottom: 5px;">Adınız</label>
        <input type="text" id="promptNameInput" placeholder="Kullanıcı adınızı yazın" style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.85rem; outline: none; transition: border 0.3s;" />
      </div>
      
      <button id="promptJoinBtn" style="width: 100%; padding: 11px; border: none; border-radius: 8px; background: linear-gradient(135deg, #45f3ff, #66fcf1); color: #0b0c10; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: transform 0.2s;">Odaya Katıl</button>
    </div>
  `;

  const doc = parser.parseFromString(rawHtml, 'text/html');
  const roomTextDiv = doc.getElementById('filmsync-prompt-room-text');
  if (roomTextDiv) {
    roomTextDiv.textContent = '"' + roomName + '" odasına katılacaksınız.';
  }
  Array.from(doc.body.childNodes).forEach(node => {
    modal.appendChild(node.cloneNode(true));
  });

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

// --- 🎬 NETFLIX DETAY KARTLARINA "EVO & BEKO PARTİSİ BAŞLAT" BUTONU ENJEKSİYONU ---
function injectNetflixStartButton() {
  const buttonContainers = document.querySelectorAll('.previewModal--buttons, .jawbone-actions, .l-play-parent');
  buttonContainers.forEach(container => {
    if (container.querySelector('.filmsync-netflix-start-btn')) return;

    const startBtn = document.createElement('button');
    startBtn.className = 'filmsync-netflix-start-btn';
    startBtn.setAttribute('style', `
      background-color: #ff3d47;
      background-image: linear-gradient(135deg, #e50914, #ff3d47);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4);
      transition: all 0.2s ease;
      font-family: inherit;
    `);
    const startBtnSpan = document.createElement('span');
    startBtnSpan.textContent = 'Evo & Beko Partisi Başlat';
    startBtn.appendChild(startBtnSpan);
    startBtn.appendChild(document.createTextNode(' 🍿'));

    startBtn.addEventListener('mouseover', () => {
      startBtn.style.transform = 'scale(1.04)';
      startBtn.style.boxShadow = '0 6px 20px rgba(229, 9, 20, 0.6)';
    });
    startBtn.addEventListener('mouseout', () => {
      startBtn.style.transform = 'scale(1)';
      startBtn.style.boxShadow = '0 4px 15px rgba(229, 9, 20, 0.4)';
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
            url: playUrl,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
          }
        }).then(() => {
          // Depolamaya oda durumunu yaz
          chrome.storage.local.get(['username'], (res) => {
            const savedName = res.username || '';
            chrome.storage.local.set({
              roomId: randomRoomId,
              userId: randomUserId,
              username: savedName,
              password: '',
              hostOnly: false,
              selectedAvatar: '🍿'
            }, () => {
              // Davet linkini kopyala
              const inviteUrl = `https://github.com/bekircansnk/filmsync-watch-party?join=${encodeURIComponent(randomRoomId)}&pass=`;
              
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
  
  // İlk yüklemede çalıştır
  setTimeout(injectNetflixStartButton, 1000);

  // Değişimleri izle
  const observer = new MutationObserver((mutations) => {
    injectNetflixStartButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- 🖥️ TAM EKRAN IDLE GİZLEME MOTORU (FARE HAREKET ETMEDİĞİNDE GİZLE) ---
let idleTimer = null;
let isFullscreen = false;

function setupFullscreenIdleDetector() {
  const handleMouseMove = () => {
    if (!isFullscreen) return;
    
    showPanelAndToolbar();
    resetIdleTimer(isInputFocused ? 5000 : 3000);
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('keydown', handleMouseMove);

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
      
      if (!isFullscreen) {
        // Tam ekrandan çıkıldığında görünürlüğü sıfırla
        clearTimeout(idleTimer);
        if (toolbar) {
          toolbar.style.opacity = '1';
          toolbar.style.pointerEvents = 'auto';
        }
        if (panel) {
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
  if (toolbar) {
    toolbar.style.opacity = '1';
    toolbar.style.pointerEvents = 'auto';
  }
  if (panel && panel.classList.contains('active')) {
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  }
  clearTimeout(idleTimer);
}

function resetIdleTimer(duration = 3000) {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (isFullscreen) {
      if (messageInput && document.activeElement === messageInput) {
        messageInput.blur();
      }
      isInputFocused = false;
      
      const toolbar = document.getElementById('filmsync-mini-toolbar');
      const panel = document.getElementById('filmsync-chat-panel');
      if (toolbar) {
        toolbar.style.opacity = '0';
        toolbar.style.pointerEvents = 'none';
      }
      if (panel) {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
      }
    }
  }, duration);
}

// --- 🖥️ IFRAME TAM EKRAN KORUYUCUSU (DİZİPAL, Vidmoly VB.) ---
function startIframeFullscreenKeeper() {
  if (window === window.top) return; // Sadece iframe'lerde çalışsın
  
  setInterval(() => {
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
  if (isNaN(seconds)) return '00:00';
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

