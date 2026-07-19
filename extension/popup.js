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
  
  const usernameInput = document.getElementById('usernameInput');
  const hostOnlySwitch = document.getElementById('hostOnlySwitch');
  const avatarButtons = document.querySelectorAll('.avatar-btn');
  const platformCards = document.querySelectorAll('.platform-card');
  
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  
  const btnStartParty = document.getElementById('btnStartParty');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  const btnCopyInvite = document.getElementById('btnCopyInvite');
  const btnRetrySync = document.getElementById('btnRetrySync');
  const btnGoToMovie = document.getElementById('btnGoToMovie');
  
  // Katılma Buton ve Inputları
  const joinRoomCodeInput = document.getElementById('joinRoomCodeInput');
  const btnJoinWithCode = document.getElementById('btnJoinWithCode');
  const joinRoomCodeInputSelector = document.getElementById('joinRoomCodeInputSelector');
  const btnJoinWithCodeSelector = document.getElementById('btnJoinWithCodeSelector');
  
  const userCountTitle = document.getElementById('userCountTitle');
  const activeUsersList = document.getElementById('activeUsersList');
  
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');
  const copiedToast = document.getElementById('copiedToast');
  const globalToast = document.getElementById('globalToast');

  // Local storage'dan önceki durumları yükle
  chrome.storage.local.get(['selectedAvatar', 'username', 'roomId', 'password', 'hostOnly'], (result) => {
    if (result.selectedAvatar) {
      selectedAvatar = result.selectedAvatar;
      avatarButtons.forEach(btn => {
        if (btn.getAttribute('data-avatar') === selectedAvatar) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      });
    }
    if (result.username) {
      usernameInput.value = result.username;
    } else {
      usernameInput.value = ''; // Standart olarak boş kalsın, kullanıcı yazsın
    }
    if (result.hostOnly !== undefined) {
      hostOnlySwitch.checked = result.hostOnly;
    }

    updateUI();
  });

  // Avatar Seçim Olayı
  avatarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      avatarButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = btn.getAttribute('data-avatar');
      chrome.storage.local.set({ selectedAvatar });
      
      // Eğer bir odaya bağlıysa Firebase profilini de anlık güncelle
      chrome.storage.local.get(['roomId', 'userId'], (res) => {
        if (res.roomId && res.userId && db) {
          db.ref(`rooms/${res.roomId}/users/${res.userId}/avatar`).set(selectedAvatar);
        }
      });
    });
  });

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

    // Unique user id elde et veya oluştur (Çakışmaları önlemek için zamandamgası ekle)
    chrome.storage.local.get(['userId'], (res) => {
      let userId = res.userId;
      if (!userId) {
        userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }

      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
        
        if (!currentTabUrl || currentTabUrl.startsWith('chrome://') || currentTabUrl.startsWith('about:')) {
          showGlobalToast('Önce bir film/dizi sayfası açmalısınız!');
          resetStatus();
          return;
        }

        try {
          if (typeof firebase === 'undefined') {
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
            // Ayarları kaydet
            saveSettings(roomId, username, password, userId, hostOnly, () => {
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

  // Odaya Kod ile Katılma Fonksiyonu
  function joinRoomWithCode(codeValue) {
    const code = codeValue.trim().toUpperCase();
    if (!code || code.length !== 4) {
      showGlobalToast('Lütfen 4 haneli geçerli bir oda kodu girin!');
      return;
    }

    if (typeof firebase === 'undefined') {
      showGlobalToast('Firebase kütüphanesi yüklenemedi!');
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const tempDb = firebase.database();

    globalStatusDot.classList.add('active');
    globalStatusText.textContent = 'Oda aranıyor...';

    // Odanın varlığını Firebase'den sorgula
    tempDb.ref(`rooms/${code}`).once('value').then((snapshot) => {
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
        
        saveSettings(code, username, '', userId, roomData.hostOnly || false, () => {
          showGlobalToast('Odaya başarıyla katıldınız! 🎉');
          
          // Eklentiye bağlanması için bildirim gönder
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { type: 'force-sync' }, () => {
                if (chrome.runtime.lastError) {}
              });
            }
          });
        });
      });
    }).catch(err => {
      console.error(err);
      showGlobalToast('Bağlantı hatası yaşandı.');
      resetStatus();
    });
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
      if (url) {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { url }, () => {
              // Yönlendirme bittikten sonra popup'ı kapat
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
    globalStatusDot.classList.remove('active');
    globalStatusText.textContent = 'Bağlantı Yok';
  }

  function saveSettings(roomId, username, password, userId, hostOnly, callback) {
    chrome.storage.local.set({ roomId, username, password, userId, hostOnly, selectedAvatar }, () => {
      notifyContentScript();
      updateUI();
      if (callback) callback();
    });
  }

  // Arayüz ve Canlı Firebase Dinleyicileri
  function updateUI() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const currentTabUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
      const isVideoPage = currentTabUrl && (
        currentTabUrl.includes('netflix.com/watch/') || 
        currentTabUrl.includes('youtube.com/watch') || 
        currentTabUrl.includes('youtube.com/shorts/') ||
        currentTabUrl.includes('disneyplus.com/video/') ||
        currentTabUrl.includes('disneyplus.com/play/') ||
        currentTabUrl.includes('amazon.com/gp/video/') ||
        currentTabUrl.includes('primevideo.com/detail/') ||
        currentTabUrl.includes('max.com/watch/') ||
        currentTabUrl.includes('hulu.com/watch') ||
        currentTabUrl.includes('hdfilmcehennemi') ||
        // Genel test desteği (içinde video olan herhangi bir http/https sitesi)
        (currentTabUrl.startsWith('http') && !currentTabUrl.startsWith('https://www.google.com'))
      );

      chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
        if (result.roomId) {
          // Durum 1: Zaten bir odaya bağlı
          activeRoomContainer.classList.remove('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.add('hidden');
          roomIdDisplay.textContent = result.roomId;
          
          currentRoomId = result.roomId;
          setupFirebaseListeners(result.roomId);
        } else if (isVideoPage) {
          // Durum 2: Desteklenen bir video sitesinde ve oda kurulmamış
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.remove('hidden');
          platformSelectorContainer.classList.add('hidden');
          resetStatus();
          cleanupFirebaseListeners();
        } else {
          // Durum 3: Desteklenmeyen bir sayfada
          activeRoomContainer.classList.add('hidden');
          partyCreatorContainer.classList.add('hidden');
          platformSelectorContainer.classList.remove('hidden');
          resetStatus();
          cleanupFirebaseListeners();
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
      
      // Durumu 'Bağlandı & Senkronize' yap
      globalStatusDot.classList.add('active');
      globalStatusText.textContent = 'Bağlandı & Senkronize';

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
});
