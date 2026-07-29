// Evo ve Beko Film Partisi Popup JS 🍿
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

let db = null;
let currentRoomId = null;
let selectedAvatar = '🍿'; // Varsayılan avatar

// 50+ Zengin Sinema, Animasyon ve Karakter Emojisi Havuzu
const MOVIE_AVATARS = [
  '🍿', '🎬', '🚀', '🎭', '🦁', '🦊', '🤖', '👑', '⚡', '🐲', 
  '🐺', '🦄', '🐼', '🐯', '🦅', '🛸', '👾', '🎮', '🍕', '🍔', 
  '🍩', '🔥', '🔮', '🎯', '🎸', '🍿', '🎩', '🦸', '🥷', '🕵️', 
  '🧜', '🧚', '🧞', '🧟', '🧛', '🎃', '🎉', '🌟', '💎', '🚀'
];

function getRandomMovieAvatar(nameStr) {
  if (!nameStr) {
    return MOVIE_AVATARS[Math.floor(Math.random() * MOVIE_AVATARS.length)];
  }
  let hash = 0;
  for (let i = 0; i < nameStr.length; i++) {
    hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MOVIE_AVATARS.length;
  return MOVIE_AVATARS[index];
}

// 4 Harfli Büyük Harflerden Oluşan Oda Kodu Üretici
function generate4LetterCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Güvenli Kopyalama Metodu (Popup bağlamında sorunsuz çalışır)
function copyToClipboard(text) {
  try {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    return true;
  } catch (err) {
    console.error("[FilmSync] execCommand kopyalama hatası, API denenecek:", err);
    navigator.clipboard.writeText(text).catch(e => {
      console.error("[FilmSync] Kopyalama tamamen başarısız oldu:", e);
    });
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const activeRoomContainer = document.getElementById('activeRoomContainer');
  const partyCreatorContainer = document.getElementById('partyCreatorContainer');
  const platformSelectorContainer = document.getElementById('platformSelectorContainer');
  const commonUserConfig = document.getElementById('commonUserConfig');
  
  const usernameInput = document.getElementById('usernameInput');
  const userAvatarDisplay = document.getElementById('userAvatarDisplay');
  const hostOnlySwitch = document.getElementById('hostOnlySwitch');
  const platformCards = document.querySelectorAll('.platform-card');
  
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  
  const btnStartParty = document.getElementById('btnStartParty');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  const btnCopyInvite = document.getElementById('btnCopyInvite');
  const btnRetrySync = document.getElementById('btnRetrySync');
  const btnGoToMovie = document.getElementById('btnGoToMovie');
  
  const userCountTitle = document.getElementById('userCountTitle');
  const activeUsersList = document.getElementById('activeUsersList');
  
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');
  const copiedToast = document.getElementById('copiedToast');
  const globalToast = document.getElementById('globalToast');

  // Local storage'dan önceki durumları yükle
  chrome.storage.local.get(['selectedAvatar', 'username', 'roomId', 'password', 'hostOnly'], (result) => {
    if (result.username) {
      usernameInput.value = result.username;
      selectedAvatar = result.selectedAvatar || getRandomMovieAvatar(result.username);
    } else {
      usernameInput.value = '';
      selectedAvatar = getRandomMovieAvatar('');
    }
    
    if (userAvatarDisplay) userAvatarDisplay.textContent = selectedAvatar;

    if (result.hostOnly !== undefined) {
      hostOnlySwitch.checked = result.hostOnly;
    }

    updateUI();
  });

  // Kullanıcı adı değiştiğinde veya tıklanıldığında dinamik avatar ata
  if (userAvatarDisplay) {
    userAvatarDisplay.addEventListener('click', () => {
      selectedAvatar = MOVIE_AVATARS[Math.floor(Math.random() * MOVIE_AVATARS.length)];
      userAvatarDisplay.textContent = selectedAvatar;
      chrome.storage.local.set({ selectedAvatar });
      
      chrome.storage.local.get(['roomId', 'userId'], (res) => {
        if (res.roomId && res.userId && db) {
          db.ref(`rooms/${res.roomId}/users/${res.userId}/avatar`).set(selectedAvatar);
        }
      });
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener('input', () => {
      const val = usernameInput.value.trim();
      selectedAvatar = getRandomMovieAvatar(val);
      if (userAvatarDisplay) userAvatarDisplay.textContent = selectedAvatar;
      chrome.storage.local.set({ username: val, selectedAvatar });
    });
  }

  // Platform Butonları Yönlendirme Olayı
  platformCards.forEach(card => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-url');
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });

  // "Partiyi Başlat" (Doğrudan Oda Kurma & Link Kopyalama)
  btnStartParty.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
      showGlobalToast('Lütfen bir kullanıcı adı girin! 🍿');
      return;
    }
    const hostOnly = hostOnlySwitch.checked;

    // 4 Harfli Oda Kodu üret
    const roomId = generate4LetterCode();
    const password = ''; 

    globalStatusDot.classList.add('active');
    globalStatusText.textContent = 'Bağlanıyor...';

    // 7 saniyelik timeout koruması
    let isTimeout = false;
    const connectionTimeout = setTimeout(() => {
      isTimeout = true;
      showGlobalToast('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin! ⚠️');
      resetStatus();
    }, 7000);

    // Unique user id elde et veya oluştur (Çakışmaları önlemek için zamandamgası ekle)
    chrome.storage.local.get(['userId'], (res) => {
      if (isTimeout) return;
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        if (isTimeout) return;
        const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
        
        if (!currentTabUrl || currentTabUrl.startsWith('chrome://') || currentTabUrl.startsWith('about:')) {
          clearTimeout(connectionTimeout);
          showGlobalToast('Önce bir film/dizi sayfası açmalısınız!');
          resetStatus();
          return;
        }

        try {
          if (typeof firebase === 'undefined') {
            clearTimeout(connectionTimeout);
            showGlobalToast('Firebase kütüphanesi yüklenemedi!');
            resetStatus();
            return;
          }

          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          db = firebase.database();

          // Firebase'de odayı kur
          db.ref(`rooms/${roomId}`).set({
            password: password,
            hostId: userId,
            hostOnly: hostOnly,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: currentTabUrl,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          }).then(() => {
            if (isTimeout) return;
            clearTimeout(connectionTimeout);

            // Ayarları kaydet
            saveSettings(roomId, username, password, userId, hostOnly, (tabs && tabs[0] ? tabs[0].id : null), () => {
              // Davet linkini kopyala
              const inviteUrl = `https://github.com/bekircansnk/filmsync-watch-party?join=${encodeURIComponent(roomId)}&pass=`;
              copyToClipboard(inviteUrl);
              
              showGlobalToast('Evo & Beko Partisi kuruldu! Davet linki kopyalandı! 🍿');
              
              // Content script'e hemen bağlanma mesajı gönder
              chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, (response) => {
                if (chrome.runtime.lastError) {
                  console.log("[Evo ve Beko Film Partisi] Content script mesaj alma hatası.");
                }
              });
            });
          }).catch(e => {
            if (isTimeout) return;
            clearTimeout(connectionTimeout);
            console.error(e);
            showGlobalToast('Oda kurulumu başarısız.');
            resetStatus();
          });

        } catch (e) {
          clearTimeout(connectionTimeout);
          console.error(e);
          resetStatus();
        }
      });
    });
  });

  // Odaya Kod ile Katılma Fonksiyonu
  function joinRoomWithCode(codeValue) {
    const code = codeValue.trim().toUpperCase();
    if (!code || code.length !== 4) {
      showGlobalToast('Lütfen 4 haneli geçerli bir oda kodu girin!');
      return;
    }

    globalStatusDot.classList.add('active');
    globalStatusText.textContent = 'Oda aranıyor...';

    // 7 saniyelik timeout koruması
    let isTimeout = false;
    const joinTimeout = setTimeout(() => {
      isTimeout = true;
      showGlobalToast('Odaya katılma zaman aşımına uğradı! ⚠️');
      resetStatus();
    }, 7000);

    try {
      if (typeof firebase === 'undefined') {
        clearTimeout(joinTimeout);
        showGlobalToast('Firebase kütüphanesi yüklenemedi!');
        resetStatus();
        return;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const tempDb = firebase.database();

      // Odanın varlığını Firebase'den sorgula
      tempDb.ref(`rooms/${code}`).once('value').then((snapshot) => {
        if (isTimeout) return;
        clearTimeout(joinTimeout);

        const roomData = snapshot.val();
        if (!roomData) {
          showGlobalToast('Böyle bir oda bulunamadı! ❌');
          resetStatus();
          return;
        }

        // Başarılı: Odaya katılım ayarlarını yerel depolamaya kaydet
        chrome.storage.local.get(['userId'], (res) => {
          let userId = res.userId;
          // Çakışmaları önlemek için her odaya katılımda benzersiz ID üret
          userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          
          const username = usernameInput.value.trim();
          if (!username) {
            showGlobalToast('Lütfen odaya katılmadan önce adınızı girin! 🍿');
            resetStatus();
            return;
          }
          
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const activeTabId = tabs && tabs[0] ? tabs[0].id : null;
            const currentUrl = tabs && tabs[0] ? tabs[0].url : '';
            const roomMovieUrl = roomData.lastState ? roomData.lastState.url : '';

            saveSettings(code, username, '', userId, roomData.hostOnly || false, activeTabId, () => {
              showGlobalToast('Odaya başarıyla katıldınız! 🎉');
              
              // Odanın film URL'si mevcutsa ve aktif sekme o adreste değilse doğrudan film sayfasına yönlendir
              if (roomMovieUrl && currentUrl !== roomMovieUrl) {
                if (activeTabId) {
                  chrome.tabs.update(activeTabId, { url: roomMovieUrl });
                } else {
                  chrome.tabs.create({ url: roomMovieUrl });
                }
              } else if (activeTabId) {
                chrome.tabs.sendMessage(activeTabId, { type: 'force-sync' }, () => {
                  if (chrome.runtime.lastError) {}
                });
              }
            });
          });
        });
      }).catch(err => {
        if (isTimeout) return;
        clearTimeout(joinTimeout);
        console.error(err);
        showGlobalToast('Bağlantı hatası yaşandı.');
        resetStatus();
      });
    } catch (e) {
      clearTimeout(joinTimeout);
      console.error(e);
      resetStatus();
    }
  }

  // Odaya Katıl Düğmeleri Tetikleyicileri
  btnJoinWithCode.addEventListener('click', () => {
    joinRoomWithCode(joinRoomCodeInput.value);
  });
  joinRoomCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      joinRoomWithCode(joinRoomCodeInput.value);
    }
  });

  btnJoinWithCodeSelector.addEventListener('click', () => {
    joinRoomWithCode(joinRoomCodeInputSelector.value);
  });
  joinRoomCodeInputSelector.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      joinRoomWithCode(joinRoomCodeInputSelector.value);
    }
  });

  // "Film Sayfasına Git"
  btnGoToMovie.addEventListener('click', () => {
    if (!db && typeof firebase !== 'undefined' && firebase.apps.length) db = firebase.database();
    if (!db || !currentRoomId) return;
    
    db.ref(`rooms/${currentRoomId}/lastState/url`).once('value').then((snapshot) => {
      const url = snapshot.val();
      if (url && !isEmbedUrl(url)) {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url !== url) {
            chrome.tabs.update(tabs[0].id, { url }, () => {
              window.close();
            });
          }
        });
      }
    });
  });

  // "Senkronizasyonu Yenile"
  btnRetrySync.addEventListener('click', () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, (response) => {
          if (chrome.runtime.lastError) {
            showGlobalToast('Oynatıcı bulunamadı. Film sayfasını açın!');
            return;
          }
          showGlobalToast('Senkronizasyon yenileniyor...');
        });
      }
    });
  });

  // "Odadan Ayrıl"
  btnLeaveRoom.addEventListener('click', () => {
    cleanupFirebaseListeners();
    chrome.storage.local.remove(['roomId', 'password', 'activeTabId'], () => {
      notifyContentScript();
      updateUI();
    });
  });

  // "Davet Linkini Kopyala"
  btnCopyInvite.addEventListener('click', () => {
    chrome.storage.local.get(['roomId', 'password'], (result) => {
      if (result.roomId) {
        const inviteUrl = `https://github.com/bekircansnk/filmsync-watch-party?join=${encodeURIComponent(result.roomId)}&pass=${encodeURIComponent(result.password || '')}`;
        copyToClipboard(inviteUrl);
        showGlobalToast('Davet linki kopyalandı! 📋');
      }
    });
  });

  const handleCopyCode = () => {
    const code = roomIdDisplay.textContent;
    if (code && code !== '----') {
      copyToClipboard(code);
      showGlobalToast('Oda kodu kopyalandı! 📋');
    }
  };

  roomIdDisplay.addEventListener('click', handleCopyCode);
  roomIdDisplay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopyCode();
    }
  });

  function resetStatus() {
    if (globalStatusDot) globalStatusDot.classList.remove('active');
  }

  function saveSettings(roomId, username, password, userId, hostOnly, activeTabId, callback) {
    chrome.storage.local.set({ roomId, username, password, userId, hostOnly, activeTabId, selectedAvatar }, () => {
      notifyContentScript();
      updateUI();
      if (callback) callback();
    });
  }

  // Arayüz ve Canlı Firebase Dinleyicileri
  function updateUI() {
    const publicRoomsSection = document.getElementById('publicRoomsSection');

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
      const isVideoPage = currentTabUrl && (
        currentTabUrl.includes('netflix.com/watch/') || 
        currentTabUrl.includes('hdfilmcehennemi') ||
        currentTabUrl.includes('dizipal') ||
        currentTabUrl.includes('youtube.com/watch') || 
        currentTabUrl.includes('disneyplus.com') ||
        (currentTabUrl.startsWith('http') && !currentTabUrl.startsWith('https://www.google.com'))
      );

      chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
        if (result.roomId) {
          // Durum 1: Zaten bir odaya bağlı
          activeRoomContainer.classList.remove('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.add('hidden');
          if (commonUserConfig) commonUserConfig.classList.add('hidden');
          if (publicRoomsSection) publicRoomsSection.classList.add('hidden');
          roomIdDisplay.textContent = result.roomId;
          
          currentRoomId = result.roomId;
          setupFirebaseListeners(result.roomId);
        } else if (isVideoPage) {
          // Durum 2: Desteklenen bir video sitesinde ve oda kurulmamış
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.remove('hidden');
          platformSelectorContainer.classList.add('hidden');
          if (commonUserConfig) commonUserConfig.classList.remove('hidden');
          if (publicRoomsSection) publicRoomsSection.classList.remove('hidden');
          resetStatus();
          cleanupFirebaseListeners();
          loadPublicRooms();
        } else {
          // Durum 3: Desteklenmeyen bir sayfada
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.remove('hidden');
          if (commonUserConfig) commonUserConfig.classList.remove('hidden');
          if (publicRoomsSection) publicRoomsSection.classList.remove('hidden');
          resetStatus();
          cleanupFirebaseListeners();
          loadPublicRooms();
        }
      });
    });
  }

  // Firebase üzerinden Canlı Kullanıcı ve URL Dinleme
  function setupFirebaseListeners(roomId) {
    try {
      if (typeof firebase === 'undefined') return;

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      
      // Durumu aktif yap (Yeşil Neon Dot)
      if (globalStatusDot) globalStatusDot.classList.add('active');

      // Eski dinleyicileri temizle
      db.ref(`rooms/${roomId}/users`).off();
      db.ref(`rooms/${roomId}/lastState/url`).off();

      // 1. Canlı Kullanıcıları ve Avatarları Dinle (Map isim çakışma hatası giderildi!)
      db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
        const usersData = snapshot.val();
        activeUsersList.innerHTML = '';
        
        let count = 0;
        if (usersData) {
          Object.entries(usersData).forEach(([uId, u]) => {
            if (u.username) {
              count++;
              const el = document.createElement('div');
              el.className = 'user-badge';
              
              const dot = document.createElement('span');
              dot.className = 'user-badge-online-dot';
              
              const textSpan = document.createElement('span');
              textSpan.textContent = `${u.avatar || '🍿'} ${u.username}`;
              
              el.appendChild(dot);
              el.appendChild(textSpan);
              activeUsersList.appendChild(el);
            }
          });
        }
        
        userCountTitle.textContent = `Aktif Üyeler (${count})`;
      });

      // 2. Canlı URL Eşleşmesini Dinle
      db.ref(`rooms/${roomId}/lastState/url`).on('value', (snapshot) => {
        const targetUrl = snapshot.val();
        if (!targetUrl) {
          btnGoToMovie.classList.add('hidden');
          return;
        }

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          if (tabs[0]) {
            const currentUrl = tabs[0].url;
            if (currentUrl !== targetUrl) {
              btnGoToMovie.classList.remove('hidden');
            } else {
              btnGoToMovie.classList.add('hidden');
            }
          }
        });
      });

    } catch (e) {
      console.error(e);
    }
  }

  function cleanupFirebaseListeners() {
    if (db && currentRoomId) {
      db.ref(`rooms/${currentRoomId}/users`).off();
      db.ref(`rooms/${currentRoomId}/lastState/url`).off();
    }
    currentRoomId = null;
  }

  function showGlobalToast(text) {
    globalToast.textContent = text;
    globalToast.style.display = 'block';
    setTimeout(() => {
      globalToast.style.display = 'none';
    }, 3000);
  }

  function notifyContentScript() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
          chrome.tabs.sendMessage(tab.id, { type: 'settings-updated' }, (response) => {
            if (chrome.runtime.lastError) {
              return;
            }
          });
        }
      });
    });
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

  // 🍿 CANLI AÇIK ODALARI LİSTELEME VE ZAMAN AŞIMI TEMİZLİK (3 Saat İnaktif / 24 Saat Max TTL)
  function loadPublicRooms() {
    const publicRoomList = document.getElementById('publicRoomList');
    const publicRoomCountBadge = document.getElementById('publicRoomCountBadge');
    if (!publicRoomList || !publicRoomCountBadge) return;

    try {
      if (typeof firebase === 'undefined') return;
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      const tempDb = firebase.database();

      tempDb.ref('rooms').on('value', (snapshot) => {
        const rooms = snapshot.val();
        publicRoomList.innerHTML = '';

        if (!rooms) {
          publicRoomCountBadge.textContent = '0 Aktif Oda';
          publicRoomList.innerHTML = '<div style="font-size: 0.75rem; color: #888; text-align: center; padding: 10px 0;">Şu anda açık oda bulunmuyor. Hemen yukarıdan parti başlatın! 🍿</div>';
          return;
        }

        const now = Date.now();
        const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        
        let validRoomsCount = 0;

        Object.entries(rooms).forEach(([roomId, roomData]) => {
          if (!roomData || !roomId || roomId.length !== 4) return;

          const lastUpdated = (roomData.lastState && roomData.lastState.lastUpdated) ? roomData.lastState.lastUpdated : 0;
          const users = roomData.users || {};
          const userEntries = Object.entries(users);
          const activeUserCount = userEntries.length;

          // Son aktiflik zamanı bul
          let latestUserActivity = lastUpdated;
          userEntries.forEach(([_, u]) => {
            if (u.lastActive && u.lastActive > latestUserActivity) {
              latestUserActivity = u.lastActive;
            }
          });

          // 🚨 ZAMAN AŞIMI VE İMHA KURALLARI:
          // Kural A: 24 saati (1 gün) aştıysa otomatik imha et
          // Kural B: Üye sayısı 0 ise veya 3 saattir inaktifse otomatik imha et
          const isExpired24h = (lastUpdated > 0 && (now - lastUpdated > TWENTY_FOUR_HOURS_MS));
          const isInactive3h = (now - latestUserActivity > THREE_HOURS_MS);

          if (isExpired24h || (activeUserCount === 0 && isInactive3h)) {
            console.log(`[FilmSync İmha Motoru] Oda ${roomId} süresi dolduğu/inaktif kaldığı için siliniyor.`);
            tempDb.ref(`rooms/${roomId}`).remove();
            return; // Bu odayı listede gösterme
          }

          // Geçerli oda: Listeye ekle
          validRoomsCount++;

          // Platform / Film Başlığı Tespiti
          const movieUrl = (roomData.lastState && roomData.lastState.url) ? roomData.lastState.url : '';
          let platformName = '🍿 İzleme Partisi';
          if (movieUrl.includes('netflix.com')) platformName = '🍿 Netflix';
          else if (movieUrl.includes('hdfilmcehennemi')) platformName = '🎬 HDFilmCehennemi';
          else if (movieUrl.includes('dizipal')) platformName = '🎥 Dizipal';
          else if (movieUrl.includes('youtube.com')) platformName = '📺 YouTube';
          else if (movieUrl.includes('disneyplus.com')) platformName = '✨ Disney+';

          // Kullanıcı İsimleri Özeti
          let userNames = 'Katılımcı Yok';
          if (activeUserCount > 0) {
            userNames = userEntries.map(([_, u]) => u.username || 'Anonim').join(', ');
          }

          const card = document.createElement('div');
          card.className = 'public-room-card';

          card.innerHTML = `
            <div class="public-room-info">
              <div class="public-room-code-badge">
                ${roomId}
                <span style="font-size: 0.65rem; color: #888; font-weight: normal;">${platformName}</span>
              </div>
              <div class="public-room-users">👥 ${activeUserCount} Kişi: ${userNames}</div>
            </div>
            <button class="btn-join-public" data-room="${roomId}">Katıl</button>
          `;

          // Katıl Butonu Olayı
          const joinBtn = card.querySelector('.btn-join-public');
          joinBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            joinRoomWithCode(roomId);
          });

          publicRoomList.appendChild(card);
        });

        publicRoomCountBadge.textContent = `${validRoomsCount} Aktif Oda`;

        if (validRoomsCount === 0) {
          publicRoomList.innerHTML = '<div style="font-size: 0.75rem; color: #888; text-align: center; padding: 10px 0;">Şu anda açık oda bulunmuyor. Hemen yukarıdan parti başlatın! 🍿</div>';
        }
      });

    } catch (e) {
      console.error("[FilmSync] Açık odalar yükleme hatası:", e);
    }
  }
});
