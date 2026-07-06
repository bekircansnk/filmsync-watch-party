// FilmSync Popup Logic
document.addEventListener('DOMContentLoaded', () => {
  const joinFormContainer = document.getElementById('joinFormContainer');
  const activeRoomContainer = document.getElementById('activeRoomContainer');
  
  const usernameInput = document.getElementById('usernameInput');
  const roomIdInput = document.getElementById('roomIdInput');
  const passwordInput = document.getElementById('passwordInput');
  const modeSelect = document.getElementById('modeSelect');
  
  const roomIdDisplay = document.getElementById('roomIdDisplay');
  const activeUsername = document.getElementById('activeUsername');
  const activeModeText = document.getElementById('activeModeText');
  const copiedToast = document.getElementById('copiedToast');
  
  const btnJoinRoom = document.getElementById('btnJoinRoom');
  const btnCreateRoom = document.getElementById('btnCreateRoom');
  const btnLeaveRoom = document.getElementById('btnLeaveRoom');
  
  const globalStatusDot = document.getElementById('globalStatusDot');
  const globalStatusText = document.getElementById('globalStatusText');

  // Arayüz durumunu güncelle
  updateUI();

  // "Oda Kur" butonuna tıklandığında
  btnCreateRoom.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Anonim';
    const password = passwordInput.value.trim();
    const mode = modeSelect.value;
    const generatedRoomId = generateRoomCode();

    saveSettings(generatedRoomId, username, password, mode);
  });

  // "Katıl" butonuna tıklandığında
  btnJoinRoom.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Anonim';
    const roomId = roomIdInput.value.trim().toUpperCase();
    const password = passwordInput.value.trim();
    const mode = modeSelect.value;

    if (!roomId) {
      alert('Lütfen geçerli bir oda kodu girin.');
      return;
    }

    saveSettings(roomId, username, password, mode);
  });

  // "Odan Ayrıl" butonuna tıklandığında
  btnLeaveRoom.addEventListener('click', () => {
    chrome.storage.local.remove(['roomId', 'password'], () => {
      notifyContentScript();
      updateUI();
    });
  });

  // Oda koduna tıklandığında kopyalama yap
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
  function saveSettings(roomId, username, password, mode) {
    chrome.storage.local.set({ roomId, username, password, mode }, () => {
      notifyContentScript();
      updateUI();
    });
  }

  // Arayüzü storage verilerine göre güncelleme
  function updateUI() {
    chrome.storage.local.get(['roomId', 'username', 'password', 'mode'], (result) => {
      if (result.roomId) {
        joinFormContainer.classList.add('hidden');
        activeRoomContainer.classList.remove('hidden');
        
        roomIdDisplay.textContent = result.roomId;
        activeUsername.textContent = result.username;
        activeModeText.textContent = result.mode === 'cloud' ? 'Firebase Bulut Bağlantısı Aktif' : 'Lokal Test Bağlantısı Aktif';
      } else {
        joinFormContainer.classList.remove('hidden');
        activeRoomContainer.classList.add('hidden');
        
        if (result.username) usernameInput.value = result.username;
        if (result.password) passwordInput.value = result.password;
        if (result.mode) modeSelect.value = result.mode;
        
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

  // Rastgele 6 haneli oda kodu üretir
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FS-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
});
