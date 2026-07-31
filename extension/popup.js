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
  const joinCodeSection = document.getElementById('joinCodeSection');
  
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
  
  const joinRoomCodeInput = document.getElementById('joinRoomCodeInput');
  const btnJoinWithCode = document.getElementById('btnJoinWithCode');
  
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
    const handleAvatarChange = () => {
      selectedAvatar = MOVIE_AVATARS[Math.floor(Math.random() * MOVIE_AVATARS.length)];
      userAvatarDisplay.textContent = selectedAvatar;
      chrome.storage.local.set({ selectedAvatar });
      
      chrome.storage.local.get(['roomId', 'userId'], (res) => {
        if (res.roomId && res.userId && db) {
          db.ref(`rooms/${res.roomId}/users/${res.userId}/avatar`).set(selectedAvatar);
        }
      });
    };

    userAvatarDisplay.addEventListener('click', handleAvatarChange);

    userAvatarDisplay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAvatarChange();
      }
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
    const roomId = generate4LetterCode();

    if (globalStatusDot) globalStatusDot.classList.add('active');

    chrome.storage.local.get(['userId'], (res) => {
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
        const activeTabId = (tabs && tabs[0]) ? tabs[0].id : null;

        // Arka plan Service Worker'ına REST oda kurulum isteği gönder
        chrome.runtime.sendMessage({
          type: 'create-room',
          roomId: roomId,
          hostId: userId,
          username: username,
          avatar: selectedAvatar,
          hostOnly: hostOnly,
          url: currentTabUrl
        }, (response) => {
          // Yerel depolamaya kaydet ve arayüzü anında güncelle
          saveSettings(roomId, username, '', userId, hostOnly, activeTabId, () => {
            const inviteUrl = `https://github.com/bekircansnk/filmsync-watch-party?join=${encodeURIComponent(roomId)}&pass=`;
            copyToClipboard(inviteUrl);
            showGlobalToast('Parti kuruldu! Davet linki kopyalandı! 🍿');

            if (activeTabId) {
              chrome.tabs.sendMessage(activeTabId, { type: 'force-sync' }, () => {
                if (chrome.runtime.lastError) {}
              });
            }
          });
        });
      });
    });
  });

  // Odaya Kod ile Katılma Fonksiyonu (Sızdırmaz 0ms REST API + Otomatik Yönlendirme)
  function joinRoomWithCode(codeValue) {
    const code = codeValue.trim().toUpperCase();
    if (!code || code.length !== 4) {
      showGlobalToast('Lütfen 4 haneli geçerli bir oda kodu girin!');
      return;
    }

    const username = usernameInput.value.trim();
    if (!username) {
      showGlobalToast('Lütfen odaya katılmadan önce adınızı girin! 🍿');
      return;
    }

    if (globalStatusDot) globalStatusDot.classList.add('active');

    chrome.storage.local.get(['userId'], (res) => {
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const activeTabId = tabs && tabs[0] ? tabs[0].id : null;
        const currentUrl = tabs && tabs[0] ? tabs[0].url : '';

        // Doğrudan Firebase REST API ile tüm odaları tara (Harf büyüklüğü bağımsız)
        fetch('https://movieparty-af87f-default-rtdb.firebaseio.com/rooms.json')
          .then(r => r.json())
          .then(allRooms => {
            if (!allRooms) {
              showGlobalToast('Böyle bir oda bulunamadı! ❌');
              resetStatus();
              return;
            }

            // Case-Insensitive oda arama
            let matchedRoomId = null;
            let matchedRoomData = null;

            Object.entries(allRooms).forEach(([rId, rData]) => {
              if (rId.trim().toUpperCase() === code) {
                matchedRoomId = rId;
                matchedRoomData = rData;
              }
            });

            if (!matchedRoomData || !matchedRoomId) {
              showGlobalToast('Böyle bir oda bulunamadı! ❌');
              resetStatus();
              return;
            }

            // Odaya katılan kullanıcıyı kaydet
            const roomMovieUrl = (matchedRoomData.lastState && matchedRoomData.lastState.url) ? matchedRoomData.lastState.url : '';
            
            // Eğer oda boşsa veya katılan kullanıcı host olmak istiyorsa host yetkisi ver
            const updatePayload = {
              username: username,
              avatar: selectedAvatar,
              lastActive: Date.now()
            };

            fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${matchedRoomId}/users/${userId}.json`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload)
            }).then(() => {
              saveSettings(matchedRoomId, username, '', userId, matchedRoomData.hostOnly || false, activeTabId, () => {
                showGlobalToast('Odaya başarıyla katıldınız! 🎉');

                // Film Sayfasına Yönlendirme Kontrolü
                if (roomMovieUrl && currentUrl !== roomMovieUrl && !currentUrl.includes(roomMovieUrl)) {
                  console.log(`[FilmSync Yönlendirme] Film sayfasına gidiliyor: ${roomMovieUrl}`);
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
            }).catch(err => {
              console.error('[FilmSync Katılım Hatası]', err);
              showGlobalToast('Odaya katılırken hata oluştu!');
              resetStatus();
            });
          })
          .catch(err => {
            console.error('[FilmSync REST Oda Arama Hatası]', err);
            showGlobalToast('Oda doğrulanırken bağlantı hatası oluştu!');
            resetStatus();
          });
      });
    });
  }

  // Odaya Katıl Düğmeleri Tetikleyicileri
  if (btnJoinWithCode && joinRoomCodeInput) {
    btnJoinWithCode.addEventListener('click', () => {
      joinRoomWithCode(joinRoomCodeInput.value);
    });
    joinRoomCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        joinRoomWithCode(joinRoomCodeInput.value);
      }
    });
  }

  // "Film Sayfasına Git 🎬"
  btnGoToMovie.addEventListener('click', () => {
    if (!currentRoomId) {
      showGlobalToast('Aktif oda bulunamadı!');
      return;
    }
    
    // Doğrudan oda düğümünden en güncel URL'yi oku
    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${currentRoomId}.json`)
      .then(res => res.json())
      .then(roomData => {
        let targetUrl = (roomData && roomData.lastState) ? roomData.lastState.url : '';
        
        // Yönlendirme yardımcısı
        const redirectTab = (urlStr) => {
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              const currentTabUrl = tabs[0].url || '';
              if (currentTabUrl === urlStr || (currentTabUrl.includes(urlStr) && urlStr.length > 15)) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, () => {
                  if (chrome.runtime.lastError) {}
                });
                showGlobalToast('Zaten bu film sayfasındasınız! 🍿');
              } else {
                chrome.tabs.update(tabs[0].id, { url: urlStr }, () => {
                  showGlobalToast('Film sayfasına gidiliyor... 🍿');
                  setTimeout(() => window.close(), 300);
                });
              }
            }
          });
        };

        if (targetUrl && targetUrl.length > 8 && !targetUrl.includes('chrome://')) {
          redirectTab(targetUrl);
        } else {
          // Fallback: Veritabanında url henüz yoksa açık sekmeler arasında film sekmesini bulup odaklan ve yönlendir!
          chrome.tabs.query({}, (allTabs) => {
            let foundTab = null;
            if (allTabs) {
              allTabs.forEach(t => {
                if (t.url && (t.url.includes('hdfilmcehennemi') || t.url.includes('dizipal') || t.url.includes('netflix.com/watch') || t.url.includes('youtube.com/watch'))) {
                  if (!foundTab) foundTab = t;
                }
              });
            }

            if (foundTab) {
              chrome.tabs.update(foundTab.id, { active: true }, () => {
                chrome.windows.update(foundTab.windowId, { focused: true });
                showGlobalToast('Film sekmesine geçildi! 🍿');
                setTimeout(() => window.close(), 300);
              });
            } else {
              showGlobalToast('Oda henüz film sayfasına bağlanmamış. Bir film açın! 🍿');
            }
          });
        }
      })
      .catch(err => {
        console.error('[FilmSync REST Url Hatası]', err);
        showGlobalToast('Film adresi alınamadı!');
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
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'leave-room' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });
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
    const joinCodeSection = document.getElementById('joinCodeSection');

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
          if (joinCodeSection) joinCodeSection.classList.add('hidden');
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
          if (joinCodeSection) joinCodeSection.classList.remove('hidden');
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
          if (joinCodeSection) joinCodeSection.classList.remove('hidden');
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

      // 2. "Film Sayfasına Git 🎬" Butonunu Daima Görünür Tut
      if (btnGoToMovie) {
        btnGoToMovie.classList.remove('hidden');
      }

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

  // Açık Odaları Yükleme (REST API ile 0ms Latency)
  function loadPublicRooms() {
    const publicRoomList = document.getElementById('publicRoomList');
    const publicRoomCountBadge = document.getElementById('publicRoomCountBadge');
    if (!publicRoomList || !publicRoomCountBadge) return;

    fetch('https://movieparty-af87f-default-rtdb.firebaseio.com/rooms.json')
      .then(res => res.json())
      .then(rooms => {
        publicRoomList.innerHTML = '';

        if (!rooms) {
          publicRoomCountBadge.textContent = '0 Aktif Oda';
          publicRoomList.innerHTML = '<div style="font-size: 0.72rem; color: #888; text-align: center; padding: 6px 0;">Şu anda açık oda bulunmuyor. Hemen yukarıdan parti başlatın! 🍿</div>';
          return;
        }

        const now = Date.now();
        const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        const STALE_USER_MS = 45 * 1000; // 45 saniye inaktif olan hayalet üyeleri düş
        
        let processedRooms = [];

        Object.entries(rooms).forEach(([roomId, roomData]) => {
          if (!roomData || !roomId || roomId.length !== 4) return;

          const lastUpdated = (roomData.lastState && roomData.lastState.lastUpdated) ? roomData.lastState.lastUpdated : 0;
          const createdAt = roomData.createdAt || lastUpdated || 0;
          const users = roomData.users || {};
          const userEntries = Object.entries(users);

          // 👻 HAYALET ÜYE FİLTRESİ: Son 45 saniyedir canlı sinyal (heartbeat) göndermeyen takılı üyeleri düş
          const validUserEntries = userEntries.filter(([_, u]) => u.lastActive && (now - u.lastActive < STALE_USER_MS));
          const activeUserCount = validUserEntries.length;

          // Son aktiflik zamanı bul
          let latestUserActivity = lastUpdated;
          userEntries.forEach(([_, u]) => {
            if (u.lastActive && u.lastActive > latestUserActivity) {
              latestUserActivity = u.lastActive;
            }
          });

          // ZAMAN AŞIMI VE İMHA KURALLARI:
          const isExpired24h = (lastUpdated > 0 && (now - lastUpdated > TWENTY_FOUR_HOURS_MS));
          const isInactive3h = (now - latestUserActivity > THREE_HOURS_MS);

          if (isExpired24h || isInactive3h) {
            console.log(`[FilmSync İmha Motoru] Oda ${roomId} 3 saattir inaktif veya 24h dolduğu için siliniyor.`);
            fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' }).catch(e => {});
            return;
          }

          const movieUrl = (roomData.lastState && roomData.lastState.url) ? roomData.lastState.url : '';
          let platformName = '🍿 İzleme Partisi';
          if (movieUrl.includes('netflix.com')) platformName = '🍿 Netflix';
          else if (movieUrl.includes('hdfilmcehennemi')) platformName = '🎬 HDFilmCehennemi';
          else if (movieUrl.includes('dizipal')) platformName = '🎥 Dizipal';
          else if (movieUrl.includes('youtube.com')) platformName = '📺 YouTube';
          else if (movieUrl.includes('disneyplus.com')) platformName = '✨ Disney+';

          // Kullanıcı isimleri özeti
          const userNames = validUserEntries.map(([_, u]) => u.username || 'Üye').join(', ');
          const displayUsersText = activeUserCount > 0 ? `${activeUserCount} Üye (${userNames})` : 'Boş Oda (Katılabilirsiniz)';

          processedRooms.push({
            roomId,
            roomData,
            createdAt,
            lastUpdated: latestUserActivity,
            platformName,
            displayUsersText,
            activeUserCount
          });
        });

        // 📅 EN YENİ AÇILAN ODA EN ÜSTTE SIRALAMASI (Desc Order by createdAt / lastUpdated)
        processedRooms.sort((a, b) => b.createdAt - a.createdAt || b.lastUpdated - a.lastUpdated);

        publicRoomCountBadge.textContent = `${processedRooms.length} Aktif Oda`;

        if (processedRooms.length === 0) {
          publicRoomList.innerHTML = '<div style="font-size: 0.72rem; color: #888; text-align: center; padding: 6px 0;">Şu anda açık oda bulunmuyor. Hemen yukarıdan parti başlatın! 🍿</div>';
          return;
        }

        processedRooms.forEach(({ roomId, platformName, displayUsersText, activeUserCount }) => {
          const card = document.createElement('div');
          card.className = 'public-room-card';
          card.innerHTML = `
            <div class="public-room-info">
              <div class="public-room-code-badge">
                <span>🔑 ${roomId}</span>
              </div>
              <div class="public-room-platform">${platformName}</div>
              <div class="public-room-users">${displayUsersText}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button class="btn-join-public" data-code="${roomId}">Katıl</button>
              ${activeUserCount === 0 ? `<button class="btn-delete-public" data-room="${roomId}" title="Boş Odayı Sil (İmha Et)">🗑️</button>` : ''}
            </div>
          `;

          card.querySelector('.btn-join-public').addEventListener('click', () => {
            joinRoomWithCode(roomId);
          });

          const deleteBtn = card.querySelector('.btn-delete-public');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}.json`, { method: 'DELETE' })
                .then(() => {
                  showGlobalToast(`Oda ${roomId} başarıyla imha edildi! 🗑️`);
                  loadPublicRooms();
                })
                .catch(err => {
                  console.error('[FilmSync Oda Silme Hatası]', err);
                  showGlobalToast('Oda silinirken hata oluştu!');
                });
            });
          }

          publicRoomList.appendChild(card);
        });
      })
      .catch(err => {
        console.error('[FilmSync Public Rooms REST Hatası]', err);
        publicRoomCountBadge.textContent = '0 Aktif';
        publicRoomList.innerHTML = '<div style="font-size: 0.72rem; color: #888; text-align: center; padding: 6px 0;">Açık oda verisi alınamadı.</div>';
      });
  }
});
