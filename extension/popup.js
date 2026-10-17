// Film Partisi — 2026 Frosted Glass Popup Controller 🍿
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
let selectedAvatar = '🍿';
let publicRoomsRef = null;
let currentTabPlatformName = 'Web Video';
let currentTabCleanTitle = '';

function generate4LetterCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function detectPlatformNameFromUrl(url) {
  if (!url) return 'Web Video';
  const u = url.toLowerCase();
  if (u.includes('netflix.com')) return 'Netflix';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('disneyplus.com')) return 'Disney+';
  if (u.includes('primevideo.com') || u.includes('amazon.')) return 'Prime Video';
  if (u.includes('dizipal')) return 'Dizipal';
  if (u.includes('hdfilmcehennemi')) return 'HDFilmCehennemi';
  if (u.includes('fullhdfilmizlesene')) return 'FullHDFilmizlesene';
  if (u.includes('filmcehennemi')) return 'FilmCehennemi';
  if (u.includes('exxen.com')) return 'Exxen';
  if (u.includes('blutv.com')) return 'BluTV';
  if (u.includes('gain.tv')) return 'GAİN';
  if (u.includes('mubi.com')) return 'MUBI';
  if (u.includes('twitch.tv')) return 'Twitch';
  if (u.includes('kick.com')) return 'Kick';
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const domainPart = host.split('.')[0];
    return domainPart.charAt(0).toUpperCase() + domainPart.slice(1);
  } catch (e) {
    return 'Web Video';
  }
}

function cleanPageTitle(rawTitle, platformName) {
  if (!rawTitle) return platformName || 'Video Sayfası';
  const cleaned = rawTitle
    .replace(/^\(\d+\)\s*/, '')
    .replace(/\s*[-|•]\s*(YouTube|Netflix|Prime Video|Disney\+|HDFilmCehennemi|FullHDFilmizlesene|FilmCehennemi|izle|Full HD).*$/i, '')
    .trim();
  return cleaned || platformName || 'Video Sayfası';
}

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
    navigator.clipboard.writeText(text).catch(() => {});
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const activeRoomContainer = document.getElementById('activeRoomContainer');
  const partyCreatorContainer = document.getElementById('partyCreatorContainer');
  const platformSelectorContainer = document.getElementById('platformSelectorContainer');
  const profileSection = document.getElementById('profileSection');

  const usernameInput = document.getElementById('usernameInput');
  const hostOnlySwitch = document.getElementById('hostOnlySwitch');
  const isPublicSwitch = document.getElementById('isPublicSwitch');
  const avatarButtons = document.querySelectorAll('.avatar-btn');
  const platformCards = document.querySelectorAll('.platform-card');

  const roomIdDisplay = document.getElementById('roomIdDisplay');
  const activeMovieTitle = document.getElementById('activeMovieTitle');
  const currentPlatformTag = document.getElementById('currentPlatformTag');
  const currentPageTitle = document.getElementById('currentPageTitle');

  const btnStartParty = document.getElementById('btnStartParty');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  const btnCopyInvite = document.getElementById('btnCopyInvite');
  const btnRetrySync = document.getElementById('btnRetrySync');
  const btnGoToMovie = document.getElementById('btnGoToMovie');

  const joinRoomCodeInput = document.getElementById('joinRoomCodeInput');
  const btnJoinWithCode = document.getElementById('btnJoinWithCode');
  const joinRoomCodeInputSelector = document.getElementById('joinRoomCodeInputSelector');
  const btnJoinWithCodeSelector = document.getElementById('btnJoinWithCodeSelector');

  const userCountTitle = document.getElementById('userCountTitle');
  const activeUsersList = document.getElementById('activeUsersList');
  const publicRoomsList = document.getElementById('publicRoomsList');
  const publicRoomsCountPill = document.getElementById('publicRoomsCountPill');
  const btnRefreshPublicRooms = document.getElementById('btnRefreshPublicRooms');

  const globalStatusDot = document.getElementById('globalStatusDot');
  const connStatusLabel = document.getElementById('connStatusLabel');
  const globalToast = document.getElementById('globalToast');

  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
    }
  } catch (e) {
    console.error("Firebase init error:", e);
  }

  // Aktif sekmeyi algıla
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (tab && tab.url) {
      currentTabPlatformName = detectPlatformNameFromUrl(tab.url);
      currentTabCleanTitle = cleanPageTitle(tab.title || '', currentTabPlatformName);
      if (currentPlatformTag) currentPlatformTag.textContent = `🎬 ${currentTabPlatformName}`;
      if (currentPageTitle) currentPageTitle.textContent = currentTabCleanTitle;
    }
  });

  // Kayıtlı bilgileri yükle
  chrome.storage.local.get(['selectedAvatar', 'username', 'roomId', 'password', 'hostOnly', 'isPublic'], (result) => {
    if (result.selectedAvatar) {
      selectedAvatar = result.selectedAvatar;
      avatarButtons.forEach(btn => {
        btn.classList.toggle('selected', btn.getAttribute('data-avatar') === selectedAvatar);
      });
    }
    if (result.username) {
      usernameInput.value = result.username;
    } else {
      usernameInput.value = 'Bekir';
    }
    if (result.hostOnly !== undefined && hostOnlySwitch) {
      hostOnlySwitch.checked = result.hostOnly;
    }
    if (result.isPublic !== undefined && isPublicSwitch) {
      isPublicSwitch.checked = result.isPublic;
    }

    updateUI();
    loadPublicRooms();
  });

  // Avatar seçimi
  avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.getAttribute('data-avatar');
      chrome.storage.local.set({ selectedAvatar });

      chrome.storage.local.get(['roomId', 'userId'], (res) => {
        if (res.roomId && res.userId && db) {
          db.ref(`rooms/${res.roomId}/users/${res.userId}/avatar`).set(selectedAvatar);
        }
      });
    });
  });

  // Hızlı platform kartları
  platformCards.forEach(card => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-url');
      if (url) {
        chrome.tabs.create({ url });
      }
    });
  });

  if (btnRefreshPublicRooms) {
    btnRefreshPublicRooms.addEventListener('click', () => {
      loadPublicRooms();
      showGlobalToast('Açık odalar güncellendi 🔄');
    });
  }

  // Parti Başlat
  btnStartParty.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) {
      showGlobalToast('Lütfen adınızı girin.');
      usernameInput.focus();
      return;
    }
    const hostOnly = hostOnlySwitch ? hostOnlySwitch.checked : false;
    const isPublic = isPublicSwitch ? isPublicSwitch.checked : true;

    const roomId = generate4LetterCode();
    const password = '';

    globalStatusDot.classList.add('active');
    if (connStatusLabel) connStatusLabel.textContent = 'Bağlanıyor';

    chrome.storage.local.get(['userId'], (res) => {
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentTab = tabs && tabs[0];
        const currentTabUrl = (currentTab && currentTab.url) ? currentTab.url : '';

        if (!currentTabUrl || currentTabUrl.startsWith('chrome://') || currentTabUrl.startsWith('about:') || currentTabUrl.startsWith('edge://')) {
          showGlobalToast('Önce bir film veya video sayfası açmalısınız!');
          resetStatus();
          return;
        }

        const platformName = detectPlatformNameFromUrl(currentTabUrl);
        const pageTitle = cleanPageTitle(currentTab.title || '', platformName);

        try {
          if (!db && typeof firebase !== 'undefined') {
            if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
            db = firebase.database();
          }
          if (!db) {
            showGlobalToast('Veritabanı bağlantısı kurulamadı.');
            resetStatus();
            return;
          }

          const nowTs = Date.now();
          db.ref(`rooms/${roomId}`).set({
            password: password,
            hostId: userId,
            hostOnly: hostOnly,
            isPublic: isPublic,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            users: {
              [userId]: {
                username: username,
                avatar: selectedAvatar,
                isHost: true,
                online: true,
                lastSeen: nowTs
              }
            },
            lastState: {
              isPlaying: false,
              status: 'pause',
              currentTime: 0,
              url: currentTabUrl,
              pageTitle: pageTitle,
              platformName: platformName,
              updatedBy: username,
              senderId: userId,
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          }).then(() => {
            saveSettings(roomId, username, password, userId, hostOnly, isPublic, currentTab ? currentTab.id : null, () => {
              const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(roomId)}&pass=`;
              copyToClipboard(inviteUrl);
              showGlobalToast('Parti kuruldu! Davet bağlantısı kopyalandı 🍿');

              if (currentTab) {
                chrome.tabs.sendMessage(currentTab.id, { type: 'force-sync' }, () => {
                  if (chrome.runtime.lastError) {}
                });
              }

              setTimeout(() => {
                window.close();
              }, 400);
            });
          }).catch(e => {
            console.error(e);
            showGlobalToast('Oda kurulumu başarısız.');
            resetStatus();
          });
        } catch (e) {
          console.error(e);
          resetStatus();
        }
      });
    });
  });

  // Odaya Kod ile Katılma (Tekil Oda REST Sorgusu)
  function joinRoomWithCode(codeValue) {
    const code = (codeValue || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!code || code.length < 2) {
      showGlobalToast('Lütfen geçerli bir oda kodu girin!');
      return;
    }

    const username = usernameInput.value.trim();
    if (!username) {
      showGlobalToast('Lütfen adınızı girin.');
      usernameInput.focus();
      return;
    }

    globalStatusDot.classList.add('active');
    if (connStatusLabel) connStatusLabel.textContent = 'Aranıyor';

    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${code}.json`)
      .then(res => res.json())
      .then(roomData => {
        if (!roomData) {
          showGlobalToast('Böyle bir oda bulunamadı!');
          resetStatus();
          return;
        }

        chrome.storage.local.get(['userId'], (res) => {
          const userId = res.userId || ('usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
          const targetUrl = roomData.lastState && roomData.lastState.url ? roomData.lastState.url : '';

          if (db) {
            db.ref(`rooms/${code}/users/${userId}`).update({
              username: username,
              avatar: selectedAvatar,
              isHost: roomData.hostId === userId,
              online: true,
              lastSeen: Date.now()
            }).catch(() => {});
          }

          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const activeTab = tabs && tabs[0];
            const activeTabId = activeTab ? activeTab.id : null;

            saveSettings(code, username, '', userId, roomData.hostOnly || false, roomData.isPublic !== false, activeTabId, () => {
              showGlobalToast('Odaya katıldınız! Yönlendiriliyorsunuz 🎉');

              if (activeTab) {
                if (targetUrl && targetUrl.startsWith('http') && activeTab.url !== targetUrl) {
                  chrome.tabs.update(activeTab.id, { url: targetUrl }, () => {
                    setTimeout(() => {
                      window.close();
                    }, 400);
                  });
                } else {
                  chrome.tabs.sendMessage(activeTab.id, { type: 'force-sync' }, () => {
                    if (chrome.runtime.lastError) {}
                  });
                  setTimeout(() => {
                    window.close();
                  }, 400);
                }
              }
            });
          });
        });
      })
      .catch(err => {
        console.error(err);
        showGlobalToast('Bağlantı hatası yaşandı.');
        resetStatus();
      });
  }

  // Canlı Açık Odaları Yükle ve Dinle
  function loadPublicRooms() {
    if (!publicRoomsList) return;
    if (!db && typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.database();
      } catch (e) {}
    }
    if (!db) {
      publicRoomsList.innerHTML = '<div class="empty-room-msg">Veritabanı bağlantısı bekleniyor...</div>';
      return;
    }

    if (publicRoomsRef) {
      publicRoomsRef.off();
    }

    publicRoomsRef = db.ref('rooms').limitToLast(40);
    publicRoomsRef.on('value', (snapshot) => {
      const roomsObj = snapshot.val();
      if (!roomsObj) {
        if (publicRoomsCountPill) publicRoomsCountPill.textContent = '0';
        publicRoomsList.innerHTML = '<div class="empty-room-msg">Şu an aktif açık oda yok. İlk partiyi sen başlat! 🍿</div>';
        return;
      }

      const now = Date.now();
      const activePublicRooms = [];

      Object.entries(roomsObj).forEach(([roomId, room]) => {
        if (!room || typeof room !== 'object') return;
        const isPublicRoom = room.isPublic !== false && (!room.password || room.password === '');
        if (!isPublicRoom) return;

        const usersMap = room.users && typeof room.users === 'object' ? room.users : {};
        const userEntries = Object.entries(usersMap);
        const activeUsers = [];

        userEntries.forEach(([uId, u]) => {
          if (!u || typeof u !== 'object') return;
          const lastSeen = u.lastSeen || 0;
          // 15 dakika tolerans veya odadaki son aktif kullanıcılar
          if ((now - lastSeen < 900000) || userEntries.length <= 5) {
            activeUsers.push({
              id: uId,
              username: u.username || 'Katılımcı',
              avatar: u.avatar || '🍿',
              isHost: uId === room.hostId || Boolean(u.isHost)
            });
          }
        });

        const roomUrl = (room.lastState && room.lastState.url) ? room.lastState.url : '';
        const lastUpdated = (room.lastState && (room.lastState.lastUpdated || room.lastState.timestamp)) || room.createdAt || 0;
        const isRoomFresh = activeUsers.length > 0 || (now - lastUpdated < 3600000);

        if (isRoomFresh && roomUrl) {
          const platformName = (room.lastState && room.lastState.platformName)
            ? room.lastState.platformName
            : detectPlatformNameFromUrl(roomUrl);
          const pageTitle = (room.lastState && room.lastState.pageTitle)
            ? room.lastState.pageTitle
            : platformName;

          activePublicRooms.push({
            roomId,
            platformName,
            pageTitle,
            url: roomUrl,
            users: activeUsers,
            userCount: Math.max(activeUsers.length, 1),
            isPlaying: Boolean(room.lastState && (room.lastState.isPlaying || room.lastState.status === 'play')),
            lastUpdated
          });
        }
      });

      activePublicRooms.sort((a, b) => b.userCount - a.userCount || b.lastUpdated - a.lastUpdated);

      if (publicRoomsCountPill) {
        publicRoomsCountPill.textContent = String(activePublicRooms.length);
      }

      if (activePublicRooms.length === 0) {
        publicRoomsList.innerHTML = '<div class="empty-room-msg">Şu an aktif açık oda yok. İlk partiyi sen başlat! 🍿</div>';
        return;
      }

      publicRoomsList.innerHTML = '';
      activePublicRooms.forEach(({ roomId, platformName, pageTitle, users, userCount }) => {
        const safeRoomId = escapeHtml(roomId);
        const safePlatform = escapeHtml(platformName);
        const safePageTitle = escapeHtml(pageTitle);

        const userBadgesHtml = users.slice(0, 4).map(u => {
          const safeName = escapeHtml(u.username || 'Katılımcı');
          const safeAvatar = escapeHtml(u.avatar || '🍿');
          return `<span class="user-badge" style="padding:2px 7px;font-size:0.66rem;">${safeAvatar} ${safeName}</span>`;
        }).join('');

        const card = document.createElement('div');
        card.className = 'public-room-card';
        card.innerHTML = `
          <div class="public-room-top">
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="room-code-pill">#${safeRoomId}</span>
              <span class="room-platform-tag">${safePlatform}</span>
            </div>
            <span style="font-size:0.68rem;font-weight:700;color:#2ed573;">👥 ${userCount} Kişi</span>
          </div>
          <div class="room-page-title" title="${safePageTitle}">🎬 ${safePageTitle}</div>
          <div class="room-users-row">
            <div class="room-users-badges">${userBadgesHtml}</div>
            <button class="btn-join-public" data-code="${safeRoomId}">Katıl &rarr;</button>
          </div>
        `;
        publicRoomsList.appendChild(card);
      });

      publicRoomsList.querySelectorAll('.btn-join-public').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetCode = btn.getAttribute('data-code');
          if (targetCode) {
            joinRoomWithCode(targetCode);
          }
        });
      });
    });
  }

  btnJoinWithCode.addEventListener('click', () => {
    joinRoomWithCode(joinRoomCodeInput.value);
  });
  joinRoomCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinRoomWithCode(joinRoomCodeInput.value);
  });

  btnJoinWithCodeSelector.addEventListener('click', () => {
    joinRoomWithCode(joinRoomCodeInputSelector.value);
  });
  joinRoomCodeInputSelector.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinRoomWithCode(joinRoomCodeInputSelector.value);
  });

  // Filme Git
  btnGoToMovie.addEventListener('click', () => {
    if (!db || !currentRoomId) return;
    db.ref(`rooms/${currentRoomId}/lastState/url`).once('value').then((snapshot) => {
      const url = snapshot.val();
      if (url) {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { url }, () => {
              window.close();
            });
          }
        });
      }
    });
  });

  // Senkronize Et
  btnRetrySync.addEventListener('click', () => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, () => {
          if (chrome.runtime.lastError) {
            showGlobalToast('Oynatıcı bulunamadı. Film sayfasını açın!');
            return;
          }
          showGlobalToast('Senkronizasyon yenilendi ⚡');
        });
      }
    });
  });

  // Odadan Ayrıl
  btnLeaveRoom.addEventListener('click', () => {
    chrome.storage.local.get(['roomId', 'userId'], (res) => {
      if (db && res.roomId && res.userId) {
        db.ref(`rooms/${res.roomId}/users/${res.userId}`).remove().catch(() => {});
      }
      cleanupFirebaseListeners();
      chrome.storage.local.remove(['roomId', 'password', 'activeTabId'], () => {
        notifyContentScript();
        updateUI();
        showGlobalToast('Odadan ayrıldınız.');
      });
    });
  });

  // Davet Bağlantısını Kopyala
  btnCopyInvite.addEventListener('click', () => {
    chrome.storage.local.get(['roomId', 'password'], (result) => {
      if (result.roomId) {
        const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(result.roomId)}&pass=${encodeURIComponent(result.password || '')}`;
        copyToClipboard(inviteUrl);
        showGlobalToast('Davet bağlantısı kopyalandı! 📋');
      }
    });
  });

  roomIdDisplay.addEventListener('click', () => {
    const code = roomIdDisplay.textContent;
    if (code && code !== '----') {
      copyToClipboard(code);
      showGlobalToast('Oda kodu kopyalandı! 📋');
    }
  });

  function resetStatus() {
    globalStatusDot.classList.remove('active');
    if (connStatusLabel) connStatusLabel.textContent = 'Hazır';
  }

  function saveSettings(roomId, username, password, userId, hostOnly, isPublic, activeTabId, callback) {
    const payload = { roomId, username, password, userId, hostOnly, isPublic, selectedAvatar };
    if (activeTabId) payload.activeTabId = activeTabId;
    chrome.storage.local.set(payload, () => {
      notifyContentScript();
      updateUI();
      if (callback) callback();
    });
  }

  function updateUI() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
      const isVideoPage = Boolean(currentTabUrl && currentTabUrl.startsWith('http'));

      chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
        if (result.roomId) {
          activeRoomContainer.classList.remove('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.add('hidden');
          roomIdDisplay.textContent = result.roomId;

          currentRoomId = result.roomId;
          setupFirebaseListeners(result.roomId);
        } else if (isVideoPage) {
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.remove('hidden');
          platformSelectorContainer.classList.add('hidden');
          resetStatus();
          cleanupFirebaseListeners();
        } else {
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.remove('hidden');
          resetStatus();
          cleanupFirebaseListeners();
        }
      });
    });
  }

  function setupFirebaseListeners(roomId) {
    try {
      if (!db && typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.database();
      }
      if (!db) return;

      globalStatusDot.classList.add('active');
      if (connStatusLabel) connStatusLabel.textContent = `#${roomId}`;

      db.ref(`rooms/${roomId}/users`).off();
      db.ref(`rooms/${roomId}/lastState`).off();

      db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
        const usersData = snapshot.val();
        activeUsersList.innerHTML = '';

        let count = 0;
        if (usersData) {
          Object.entries(usersData).forEach(([, u]) => {
            if (u && u.username) {
              count++;
              const el = document.createElement('div');
              el.className = 'user-badge';
              const safeUName = escapeHtml(u.username || 'Katılımcı');
              const safeAvatar = escapeHtml(u.avatar || '🍿');
              el.innerHTML = `<span class="user-badge-online-dot"></span><span>${safeAvatar} ${safeUName}</span>`;
              activeUsersList.appendChild(el);
            }
          });
        }

        userCountTitle.textContent = `Katılımcılar (${count})`;
      });

      db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
        const state = snapshot.val();
        const targetUrl = state && state.url ? state.url : '';
        const pTitle = state && state.pageTitle ? state.pageTitle : '';
        const pName = state && state.platformName ? state.platformName : detectPlatformNameFromUrl(targetUrl);

        if (activeMovieTitle) {
          activeMovieTitle.textContent = pTitle ? `🎬 ${pName} • ${pTitle}` : (targetUrl ? `🎬 ${pName}` : '');
        }

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
      db.ref(`rooms/${currentRoomId}/lastState`).off();
    }
    currentRoomId = null;
  }

  function showGlobalToast(text) {
    globalToast.textContent = text;
    globalToast.style.display = 'block';
    clearTimeout(showGlobalToast._t);
    showGlobalToast._t = setTimeout(() => {
      globalToast.style.display = 'none';
    }, 3000);
  }

  function notifyContentScript() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
          chrome.tabs.sendMessage(tab.id, { type: 'settings-updated' }, () => {
            if (chrome.runtime.lastError) return;
          });
        }
      });
    });
  }
});
