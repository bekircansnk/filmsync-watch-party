// Film Partisi Popup JS 🍿
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

// XSS Koruması: HTML karakterlerini güvenle kaçış karakterine dönüştür
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

// Yalnızca geçerli film/dizi izleme sayfalarını belirleyen koruma filtresi
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

// Aktif sekmeyi her ortamda (popup, bağımsız pencere vb.) garantili bulan yardımcı
function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      callback(tabs[0]);
    } else {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs2) => {
        if (tabs2 && tabs2[0]) {
          callback(tabs2[0]);
        } else {
          chrome.tabs.query({ active: true }, (tabs3) => {
            callback(tabs3 && tabs3[0] ? tabs3[0] : null);
          });
        }
      });
    }
  });
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
      showGlobalToast('Lütfen adınızı girin.');
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

      getActiveTab((tab) => {
        const currentTabUrl = (tab && tab.url) ? tab.url : '';
        const activeTabId = tab ? tab.id : null;
        const normalizedUrl = isMovieWatchUrl(currentTabUrl) ? normalizeMovieUrl(currentTabUrl) : '';

        // Arka plan Service Worker'ına REST oda kurulum isteği gönder
        chrome.runtime.sendMessage({
          type: 'create-room',
          roomId: roomId,
          hostId: userId,
          username: username,
          avatar: selectedAvatar,
          hostOnly: hostOnly,
          url: normalizedUrl
        }, (response) => {
          // Yerel depolamaya kaydet ve arayüzü anında güncelle
          saveSettings(roomId, username, '', userId, hostOnly, activeTabId, userId, () => {
            const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(roomId)}&pass=`;
            copyToClipboard(inviteUrl);
            showGlobalToast('Film partisi hazır! Davet bağlantısı kopyalandı.');

            if (activeTabId) {
              chrome.tabs.sendMessage(activeTabId, { type: 'force-sync' }, () => {
                if (chrome.runtime.lastError) {}
              });
            }

            // Partiyi başlattıktan sonra eklenti penceresini otomatik kapat (kullanıcıyı film sayfasına bırak)
            setTimeout(() => {
              window.close();
            }, 400);
          });
        });
      });
    });
  });

  // Odaya Kod ile Katılma Fonksiyonu (Sızdırmaz 0ms REST API + Otomatik Yönlendirme)
  function joinRoomWithCode(codeValue) {
    const code = codeValue.trim().toUpperCase();
    if (!code || code.length !== 4) {
      showGlobalToast('Lütfen 4 haneli oda kodunu girin.');
      return;
    }

    const username = usernameInput.value.trim();
    if (!username) {
      showGlobalToast('Lütfen önce adınızı girin.');
      return;
    }

    if (globalStatusDot) globalStatusDot.classList.add('active');

    chrome.storage.local.get(['userId'], (res) => {
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      getActiveTab((tab) => {
        const activeTabId = tab ? tab.id : null;
        const currentUrl = tab ? tab.url : '';

        // Doğrudan hedeflenen odayı çek (tüm veritabanını indirme!)
        fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${code}.json`)
          .then(r => r.json())
          .then(roomData => {
            if (!roomData) {
              showGlobalToast('Oda bulunamadı.');
              resetStatus();
              return;
            }

            const matchedRoomId = code;
            const matchedRoomData = roomData;

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
              saveSettings(matchedRoomId, username, '', userId, matchedRoomData.hostOnly || false, activeTabId, matchedRoomData.hostId || '', () => {
                showGlobalToast('Odaya katıldınız.');

                // Film Sayfasına Yönlendirme Kontrolü (Çift Sayfa Açılmasını ve Yenilenmeyi Önle)
                const cleanCurrentUrl = normalizeMovieUrl(currentUrl);
                const cleanRoomUrl = normalizeMovieUrl(roomMovieUrl);

                if (cleanRoomUrl && !areUrlsSameMovie(cleanCurrentUrl, cleanRoomUrl)) {
                  console.log(`[FilmSync Yönlendirme] Film sayfasına gidiliyor: ${cleanRoomUrl}`);
                  if (activeTabId) {
                    chrome.tabs.update(activeTabId, { url: cleanRoomUrl });
                  } else {
                    chrome.tabs.create({ url: cleanRoomUrl });
                  }
                } else if (activeTabId) {
                  console.log('[FilmSync] Zaten aynı film sayfasındayız, sekme yenilenmeyecek. force-sync gönderiliyor.');
                  chrome.tabs.sendMessage(activeTabId, { type: 'force-sync' }, () => {
                    if (chrome.runtime.lastError) {}
                  });
                }

                // Odaya katıldıktan sonra eklenti penceresini otomatik kapat
                setTimeout(() => {
                  window.close();
                }, 400);
              });
            }).catch(err => {
              console.error('[FilmSync Katılım Hatası]', err);
              showGlobalToast('Odaya katılırken bir sorun oluştu.');
              resetStatus();
            });
          })
          .catch(err => {
            console.error('[FilmSync REST Oda Arama Hatası]', err);
            showGlobalToast('Bağlantı kurulamadı.');
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
          getActiveTab((activeTab) => {
            if (activeTab) {
              const currentTabUrl = activeTab.url || '';
              if (areUrlsSameMovie(currentTabUrl, urlStr)) {
                chrome.tabs.sendMessage(activeTab.id, { type: 'force-sync' }, () => {
                  if (chrome.runtime.lastError) {}
                });
                showGlobalToast('Zaten film sayfasındasınız.');
              } else {
                chrome.tabs.update(activeTab.id, { url: normalizeMovieUrl(urlStr) }, () => {
                  showGlobalToast('Film sayfasına geçiliyor...');
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
                showGlobalToast('Film sekmesine geçildi.');
                setTimeout(() => window.close(), 300);
              });
            } else {
              showGlobalToast('Oda henüz bir filme bağlı değil. Bir film başlatın.');
            }
          });
        }
      })
      .catch(err => {
        console.error('[FilmSync REST Url Hatası]', err);
        showGlobalToast('Film bağlantısı alınamadı.');
      });
  });

  // "Senkronize Et"
  btnRetrySync.addEventListener('click', () => {
    getActiveTab((tab) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { type: 'force-sync' }, (response) => {
          if (chrome.runtime.lastError) {
            showGlobalToast('Oynatıcı bulunamadı. Lütfen film sayfasını açın.');
            return;
          }
          showGlobalToast('Senkronize ediliyor...');
        });
      }
    });
  });

  // "Odadan Ayrıl"
  btnLeaveRoom.addEventListener('click', () => {
    cleanupFirebaseListeners();
    getActiveTab((tab) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { type: 'leave-room' }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    });
    chrome.storage.local.remove(['roomId', 'password', 'activeTabId'], () => {
      notifyContentScript();
      updateUI();
    });
  });

  // "Davet Bağlantısını Kopyala"
  btnCopyInvite.addEventListener('click', () => {
    chrome.storage.local.get(['roomId', 'password'], (result) => {
      if (result.roomId) {
        const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(result.roomId)}&pass=${encodeURIComponent(result.password || '')}`;
        copyToClipboard(inviteUrl);
        showGlobalToast('Davet bağlantısı kopyalandı.');
      }
    });
  });

  const handleCopyCode = () => {
    const code = roomIdDisplay.textContent;
    if (code && code !== '----') {
      copyToClipboard(code);
      showGlobalToast('Oda kodu kopyalandı.');
      if (copiedToast) {
        copiedToast.style.display = 'block';
        setTimeout(() => { copiedToast.style.display = 'none'; }, 2000);
      }
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

  function saveSettings(roomId, username, password, userId, hostOnly, activeTabId, hostId, callback) {
    if (typeof hostId === 'function') {
      callback = hostId;
      hostId = '';
    }
    chrome.storage.local.set({ roomId, username, password, userId, hostOnly, activeTabId, hostId: hostId || '', selectedAvatar }, () => {
      notifyContentScript();
      updateUI();
      if (callback) callback();
    });
  }

  // Arayüz ve Canlı Firebase Dinleyicileri
  function updateUI() {
    const publicRoomsSection = document.getElementById('publicRoomsSection');
    const joinCodeSection = document.getElementById('joinCodeSection');

    getActiveTab((tab) => {
      const currentTabUrl = (tab && tab.url) ? tab.url : '';
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
        
        userCountTitle.textContent = `Katılımcılar (${count})`;
      });

      // 2. "Filme Git" Butonunu Daima Görünür Tut
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
          publicRoomCountBadge.textContent = '0 Oda';
          publicRoomList.innerHTML = '<div class="empty-room-msg">Açık oda bulunmuyor. Yeni bir parti başlatabilirsiniz.</div>';
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
          let platformName = 'Film Partisi';
          if (movieUrl.includes('netflix.com')) platformName = 'Netflix';
          else if (movieUrl.includes('hdfilmcehennemi')) platformName = 'HDFilmCehennemi';
          else if (movieUrl.includes('dizipal')) platformName = 'Dizipal';
          else if (movieUrl.includes('youtube.com')) platformName = 'YouTube';
          else if (movieUrl.includes('disneyplus.com')) platformName = 'Disney+';

          // Kullanıcı isimleri özeti (XSS korumalı)
          const userNames = validUserEntries.map(([_, u]) => escapeHtml(u.username || 'Katılımcı')).join(', ');
          const displayUsersText = activeUserCount > 0 ? `${activeUserCount} kişi (${userNames})` : 'Müsait oda';

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

        publicRoomCountBadge.textContent = `${processedRooms.length} Oda`;

        if (processedRooms.length === 0) {
          publicRoomList.innerHTML = '<div class="empty-room-msg">Açık oda bulunmuyor. Yeni bir parti başlatabilirsiniz.</div>';
          return;
        }

        processedRooms.forEach(({ roomId, platformName, displayUsersText, activeUserCount }) => {
          const safeRoomId = escapeHtml(roomId);
          const safePlatform = escapeHtml(platformName);
          const card = document.createElement('div');
          card.className = 'public-room-card';
          card.innerHTML = `
            <div class="public-room-info">
              <div class="public-room-code-badge">
                <span class="room-code-pill">${safeRoomId}</span>
              </div>
              <div class="public-room-platform">${safePlatform}</div>
              <div class="public-room-users">${displayUsersText}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn-join-public" data-code="${safeRoomId}">Katıl</button>
              ${activeUserCount === 0 ? `<button class="btn-delete-public" data-room="${safeRoomId}" title="Odayı Kapat">🗑️</button>` : ''}
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
                  showGlobalToast(`Oda (${roomId}) kapatıldı.`);
                  loadPublicRooms();
                })
                .catch(err => {
                  console.error('[FilmSync Oda Silme Hatası]', err);
                  showGlobalToast('Oda kapatılırken bir sorun oluştu.');
                });
            });
          }

          publicRoomList.appendChild(card);
        });
      })
      .catch(err => {
        console.error('[FilmSync Public Rooms REST Hatası]', err);
        publicRoomCountBadge.textContent = '0 Oda';
        publicRoomList.innerHTML = '<div class="empty-room-msg">Açık oda verisi alınamadı.</div>';
      });
  }
});
