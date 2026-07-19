// FilmSync Partisi 🍿
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

let db = null;
let currentRoomId = null;

document.addEventListener('DOMContentLoaded', () => {
  const joinFormContainer = document.getElementById('joinFormContainer');
  const activeRoomContainer = document.getElementById('activeRoomContainer');
  
  const usernameInput = document.getElementById('usernameInput');
  const roomIdInput = document.getElementById('roomIdInput');
  const passwordInput = document.getElementById('passwordInput');
  
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  
  const btnJoinRoom = document.getElementById('btnJoinRoom');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  const btnCopyInvite = document.getElementById('btnCopyInvite');
  const btnRetrySync = document.getElementById('btnRetrySync');
  const btnGoToMovie = document.getElementById('btnGoToMovie');
  
  const userCountTitle = document.getElementById('userCountTitle');
  const activeUsersList = document.getElementById('activeUsersList');
  
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');
  const copiedToast = document.getElementById('copiedToast');

  // Arayüzü başlat
  updateUI();

  // "Odaya Katıl / Kur"
  btnJoinRoom.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Anonim';
    const roomId = roomIdInput.value.trim().replace(/\s+/g, '-');
    const password = passwordInput.value.trim();

    if (!roomId) {
      showToast('Lütfen geçerli bir oda adı girin.');
      return;
    }

    globalStatusDot.classList.add('active');
    globalStatusText.textContent = 'Bağlanıyor...';

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      
      db.ref(`rooms/${roomId}`).once('value').then((snapshot) => {
        const roomData = snapshot.val();
        
        if (roomData) {
          if (roomData.password && roomData.password !== password) {
            showToast('Hatalı oda şifresi!');
            resetStatus();
            return;
          }
          
          saveSettings(roomId, username, password, () => {
            if (roomData.lastState && roomData.lastState.url) {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs[0]) {
                  chrome.tabs.update(tabs[0].id, { url: roomData.lastState.url });
                }
              });
            }
          });

        } else {
          // Oda yoksa yeni kur (Film sayfası gerektirir)
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
            
            if (!currentTabUrl || currentTabUrl.startsWith('chrome://') || currentTabUrl.startsWith('about:')) {
              showToast('Önce bir film/dizi sayfası açmalısınız!');
              resetStatus();
              return;
            }

            db.ref(`rooms/${roomId}`).set({
              password: password,
              lastState: {
                isPlaying: false,
                currentTime: 0,
                url: currentTabUrl,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
              }
            }).then(() => {
              saveSettings(roomId, username, password);
            }).catch(e => {
              console.error(e);
              showToast('Oda kurulumu başarısız.');
              resetStatus();
            });
          });
        }
      }).catch(err => {
        console.error(err);
        showToast('Bulut sunucusuna bağlanılamadı.');
        resetStatus();
      });

    } catch (e) {
      console.error(e);
      resetStatus();
    }
  });



  // "Film Sayfasına Git"
  btnGoToMovie.addEventListener('click', () => {
    if (!db && firebase.apps.length) db = firebase.database();
    if (!db || !currentRoomId) return;
    
    db.ref(`rooms/${currentRoomId}/lastState/url`).once('value').then((snapshot) => {
      const url = snapshot.val();
      if (url) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { url });
          }
        });
      }
    });
  });

  // "Senkronizasyonu Yenile"
  btnRetrySync.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, (response) => {
          if (chrome.runtime.lastError) {
            showToast('Oynatıcı bulunamadı. Film sayfasını açın!');
            return;
          }
          showToast('Senkronizasyon yenileniyor...');
        });
      }
    });
  });

  // "Odan Ayrıl"
  btnLeaveRoom.addEventListener('click', () => {
    cleanupFirebaseListeners();
    chrome.storage.local.remove(['roomId', 'password'], () => {
      notifyContentScript();
      updateUI();
    });
  });

  // "Davet Linkini Kopyala"
  btnCopyInvite.addEventListener('click', () => {
    chrome.storage.local.get(['roomId', 'password'], (result) => {
      if (result.roomId) {
        const inviteUrl = `https://github.com/bekircansnk/filmsync-watch-party?join=${encodeURIComponent(result.roomId)}&pass=${encodeURIComponent(result.password || '')}`;
        navigator.clipboard.writeText(inviteUrl).then(() => {
          showToast('Davet linki kopyalandı!');
        });
      }
    });
  });

  roomIdDisplay.addEventListener('click', () => {
    const code = roomIdDisplay.textContent;
    if (code && code !== '-----') {
      navigator.clipboard.writeText(code).then(() => {
        showToast('Oda adı kopyalandı!');
      });
    }
  });

  function resetStatus() {
    globalStatusDot.classList.remove('active');
    globalStatusText.textContent = 'Bağlantı Yok';
  }

  function saveSettings(roomId, username, password, callback) {
    chrome.storage.local.set({ roomId, username, password }, () => {
      notifyContentScript();
      updateUI();
      if (callback) callback();
    });
  }

  // Arayüz ve Canlı Firebase Dinleyicileri
  function updateUI() {
    chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
      if (result.roomId) {
        joinFormContainer.classList.add('hidden');
        activeRoomContainer.classList.remove('hidden');
        roomIdDisplay.textContent = result.roomId;
        
        currentRoomId = result.roomId;
        setupFirebaseListeners(result.roomId);
      } else {
        joinFormContainer.classList.remove('hidden');
        activeRoomContainer.classList.add('hidden');
        if (result.username) usernameInput.value = result.username;
        if (result.roomId) roomIdInput.value = result.roomId;
        if (result.password) passwordInput.value = result.password;
        resetStatus();
        cleanupFirebaseListeners();
      }
    });
  }

  // Firebase üzerinden Canlı Kullanıcı, URL ve Host Lock Dinleme
  function setupFirebaseListeners(roomId) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();
      
      // Durumu 'Bağlandı & Senkronize' yap
      globalStatusDot.classList.add('active');
      globalStatusText.textContent = 'Bağlandı & Senkronize';

      // Eski dinleyicileri temizle
      db.ref(`rooms/${roomId}/users`).off();
      db.ref(`rooms/${roomId}/lastState/url`).off();
      db.ref(`rooms/${roomId}/lastState/hostOnly`).off();

      // 1. Canlı Kullanıcıları Dinle
      db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
        const usersData = snapshot.val();
        activeUsersList.innerHTML = '';
        
        const uniqueUsernames = new Set();
        if (usersData) {
          Object.values(usersData).forEach(u => {
            if (u.username) {
              uniqueUsernames.add(u.username);
            }
          });
        }
        
        uniqueUsernames.forEach(username => {
          const el = document.createElement('div');
          el.className = 'user-list-item';
          el.innerHTML = `<span class="user-online-dot"></span><span>${username}</span>`;
          activeUsersList.appendChild(el);
        });
        
        userCountTitle.textContent = `Aktif Üyeler (${uniqueUsernames.size})`;
      });

      // 2. Canlı URL Eşleşmesini Dinle
      db.ref(`rooms/${roomId}/lastState/url`).on('value', (snapshot) => {
        const targetUrl = snapshot.val();
        if (!targetUrl) {
          btnGoToMovie.classList.add('hidden');
          return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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

  function showToast(text) {
    copiedToast.textContent = text;
    copiedToast.style.display = 'block';
    setTimeout(() => {
      copiedToast.style.display = 'none';
    }, 2000);
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
});
