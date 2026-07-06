// FilmSync Popup Logic
document.addEventListener('DOMContentLoaded', () => {
  const joinFormContainer = document.getElementById('joinFormContainer');
  const activeRoomContainer = document.getElementById('activeRoomContainer');
  
  const usernameInput = document.getElementById('usernameInput');
  const roomIdInput = document.getElementById('roomIdInput');
  const passwordInput = document.getElementById('passwordInput');
  
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  const activeUsername = document.getElementById('activeUsername');
  
  const btnJoinRoom = document.getElementById('btnJoinRoom');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');
  const copiedToast = document.getElementById('copiedToast');

  // Arayüzü güncelle
  updateUI();

  // "Odaya Katıl / Kur" butonuna tıklandığında
  btnJoinRoom.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Anonim';
    const roomId = roomIdInput.value.trim().replace(/\s+/g, '-'); // Boşlukları tire ile değiştir
    const password = passwordInput.value.trim();

    if (!roomId) {
      alert('Lütfen geçerli bir oda adı girin.');
      return;
    }

    saveSettings(roomId, username, password);
  });

  // "Odan Ayrıl" butonuna tıklandığında
  btnLeaveRoom.addEventListener('click', () => {
    chrome.storage.local.remove(['roomId', 'password'], () => {
      notifyContentScript();
      updateUI();
    });
  });

  // Oda adına tıklandığında kopyalama yap
  roomIdDisplay.addEventListener('click', () => {
    const code = roomIdDisplay.textContent;
    if (code && code !== '-----') {
      navigator.clipboard.writeText(code).then(() => {
        copiedToast.style.display = 'block';
        setTimeout(() => {
          copiedToast.style.display = 'none';
        }, 2000);
      });
    }
  });

  // Ayarları storage'a kaydet ve sekmeyi bilgilendir
  function saveSettings(roomId, username, password) {
    chrome.storage.local.set({ roomId, username, password }, () => {
      notifyContentScript();
      updateUI();
    });
  }

  // Arayüzü güncelleme
  function updateUI() {
    chrome.storage.local.get(['roomId', 'username', 'password'], (result) => {
      if (result.roomId) {
        joinFormContainer.classList.add('hidden');
        activeRoomContainer.classList.remove('hidden');
        
        roomIdDisplay.textContent = result.roomId;
        activeUsername.textContent = result.username;
      } else {
        joinFormContainer.classList.remove('hidden');
        activeRoomContainer.classList.add('hidden');
        
        if (result.username) usernameInput.value = result.username;
        if (result.roomId) roomIdInput.value = result.roomId;
        if (result.password) passwordInput.value = result.password;
        
        globalStatusDot.classList.remove('active');
        globalStatusText.textContent = 'Bağlantı Yok';
      }
    });
  }

  // Aktif sekmelerdeki content script'e haber ver
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
