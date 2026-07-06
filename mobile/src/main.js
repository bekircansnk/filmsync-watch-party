// FilmSync Mobile Logic
let socket = null;
let iframe = document.getElementById('videoIframe');
let playerContainer = document.getElementById('playerContainer');
let loginForm = document.getElementById('loginForm');

let roomId = '';
let username = '';
let serverUrl = '';
let filmUrl = '';
let isSyncing = false;

document.getElementById('btnConnect').addEventListener('click', () => {
  username = document.getElementById('username').value.trim() || 'Mobil Kullanıcı';
  roomId = document.getElementById('roomCode').value.trim().toUpperCase();
  filmUrl = document.getElementById('filmUrl').value.trim();
  serverUrl = document.getElementById('serverUrl').value.trim();

  if (!roomId || !filmUrl) {
    alert('Lütfen oda kodu ve film URL alanlarını doldurun.');
    return;
  }

  // Arayüz geçişi
  loginForm.classList.add('hidden');
  playerContainer.style.display = 'block';

  // Iframe kaynağını yükle
  iframe.src = filmUrl;

  // WebSocket sunucusuna bağlan
  connectWebSocket();
});

document.getElementById('btnBack').addEventListener('click', () => {
  if (socket) {
    socket.close();
  }
  iframe.src = 'about:blank';
  playerContainer.style.display = 'none';
  loginForm.classList.remove('hidden');
});

function connectWebSocket() {
  try {
    socket = new WebSocket(serverUrl);

    socket.onopen = () => {
      console.log('Sunucuya bağlanıldı. Odaya katılınıyor:', roomId);
      socket.send(JSON.stringify({
        type: 'join',
        payload: { roomId, username }
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleServerMessage(data);
    };

    socket.onclose = () => {
      console.log('Bağlantı kapandı.');
    };

    socket.onerror = (err) => {
      console.error('WebSocket Hatası:', err);
    };
  } catch (e) {
    console.error('Bağlantı hatası:', e);
  }
}

function handleServerMessage(data) {
  const { type, payload } = data;
  console.log('Gelen mesaj:', type, payload);

  // WebView/Iframe içerisindeki video elementini kontrol etme
  // Same-Origin kısıtlamalarını aşmak için Android yerel tarafında eklenti enjeksiyonu gerekecektir.
  // Burada iframe içi video elementine postMessage veya enjeksiyon yoluyla erişmeye çalışıyoruz:
  try {
    const video = iframe.contentWindow.document.querySelector('video');
    if (video) {
      isSyncing = true;
      if (type === 'sync-play') {
        video.currentTime = payload.currentTime;
        video.play();
      } else if (type === 'sync-pause') {
        video.currentTime = payload.currentTime;
        video.pause();
      } else if (type === 'sync-seek') {
        video.currentTime = payload.currentTime;
      }
      setTimeout(() => { isSyncing = false; }, 300);
    }
  } catch (e) {
    // Tarayıcı güvenlik sınırı nedeniyle cross-origin iframe içeriğine doğrudan erişilemezse
    console.warn('Cross-Origin kısıtlaması nedeniyle doğrudan video elementine erişilemedi. Android Native Bridge kullanılmalıdır.', e);
  }
}

// Iframe içindeki video olaylarını yakalama döngüsü (Eğer aynı origin ise)
setInterval(() => {
  try {
    const video = iframe.contentWindow.document.querySelector('video');
    if (video && !video.dataset.listened) {
      video.dataset.listened = 'true';
      
      video.addEventListener('play', () => {
        if (isSyncing) return;
        sendMediaEvent('play', { currentTime: video.currentTime });
      });

      video.addEventListener('pause', () => {
        if (isSyncing) return;
        sendMediaEvent('pause', { currentTime: video.currentTime });
      });

      video.addEventListener('seeked', () => {
        if (isSyncing) return;
        sendMediaEvent('seek', { currentTime: video.currentTime });
      });
    }
  } catch (e) {
    // Cross-origin ise sessizce yakala
  }
}, 1000);

function sendMediaEvent(type, payload) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type,
      payload
    }));
  }
}
