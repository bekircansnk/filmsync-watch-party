// FilmSync Popup Logic
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

  // Arayüzü başlat ve Firebase dinleyicilerini kur
  updateUI();

  // "Odaya Katıl / Kur"
  btnJoinRoom.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Anonim';
    const roomId = roomIdInput.value.trim().replace(/\s+/g, '-');
    const password = passwordInput.value.trim();

    if (!roomId) {
      alert('Lütfen geçerli bir oda adı girin.');
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
            alert('Hatalı oda şifresi!');
            resetStatus();
            return;
          }
          
          saveSettings(roomId, username, password, () => {
            if (roomData.lastState && roomData.lastState.url) {
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                  chrome.tabs.update(tabs[0].id, { url: roomData.lastState.url });
                }
              });
            }
          });

        } else {
          // Oda yoksa yeni kur (Film sayfası gerektirir)
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTabUrl = (tabs[0] && tabs[0].url) ? tabs[0].url : '';
            
            if (!currentTabUrl || currentTabUrl.startsWith('chrome://') || currentTabUrl.startsWith('about:')) {
              alert('Oda kurabilmek için önce bir film veya dizi sayfası açmalısınız!');
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
            });
          });
        }
      }).catch(err => {
        console.error(err);
        alert('Bulut sunucusuna bağlanılamadı.');
        resetStatus();
      });

    } catch (e) {
      console.error(e);
      resetStatus();
    }
  });

  // "Film Sayfasına Git"
  btnGoToMovie.addEventListener('click', () => {
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
            alert('Oynatıcı bulunamadı. Lütfen film sayfasını açtığınızdan emin olun!');
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

  // Firebase üzerinden Canlı Kullanıcı ve URL Dinleme
  function setupFirebaseListeners(roomId) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.database();

      // 1. Canlı Kullanıcıları Dinle
      db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
        const usersData = snapshot.val();
        activeUsersList.innerHTML = '';
        
        let count = 0;
        if (usersData) {
          Object.values(usersData).forEach(u => {
            if (u.username) {
              count++;
              const el = document.createElement('div');
              el.classList.add('user-list-item');
              el.innerHTML = `<span class="user-online-dot"></span><span>${u.username}</span>`;
              activeUsersList.appendChild(el);
            }
          });
        }
        userCountTitle.textContent = `Aktif Üyeler (${count})`;
      });

      // 2. Canlı URL Eşleşmesini Dinle (Film Sayfasına Git Butonunu göstermek için)
      db.ref(`rooms/${roomId}/lastState/url`).on('value', (snapshot) => {
        const targetUrl = snapshot.val();
        if (!targetUrl) {
          btnGoToMovie.classList.add('hidden');
          return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            const currentUrl = tabs[0].url;
            // Eğer oda sahibi farklı bir film sayfasındaysa butonu görünür kıl
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
