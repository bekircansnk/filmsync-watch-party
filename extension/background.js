// FilmSync Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('FilmSync Watch Party eklentisi başarıyla kuruldu.');
});

// Sekme Yönlendirme ve Bilgi Dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'redirect-tab' && message.url) {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      console.log(`[FilmSync Background] Sekme ${tabId} yeni adrese yönlendiriliyor: ${message.url}`);
      chrome.tabs.update(tabId, { url: message.url }, () => {
        sendResponse({ status: 'success' });
      });
      return true; // Asenkron yanıt için true dön
    }
  } else if (message.type === 'get-tab-id') {
    const tabId = sender.tab ? sender.tab.id : null;
    sendResponse({ tabId: tabId });
    return true;
  } else if (message.type === 'page-unload') {
    const { roomId, username, userId } = message;
    if (roomId && username) {
      // 1. lastState nesnesini duraklatıldı olarak güncelle
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/lastState.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPlaying: false,
          lastUpdated: Date.now(),
          senderId: userId || 'unloaded_user'
        })
      }).catch(err => console.error('[FilmSync Unload Patch Hatası]', err));

      // 2. Sistem mesajı gönder
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/messages.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Sistem',
          message: `${username} sayfayı yeniledi, film duraklatıldı.`,
          isSystem: true,
          timestamp: Date.now()
        })
      }).catch(err => console.error('[FilmSync Unload Msg Hatası]', err));

      // 3. Otomatik zaman aşımı olan inaktif odaları temizle
      cleanupExpiredRoomsREST();
    }
    sendResponse({ status: 'success' });
    return true;
  } else if (message.type === 'create-room') {
    const { roomId, hostId, username, avatar, hostOnly, url } = message;
    const cleanRoomId = (roomId || '').trim().toUpperCase();

    const roomData = {
      password: '',
      hostId: hostId,
      hostOnly: hostOnly || false,
      users: {
        [hostId]: {
          username: username || 'Anonim',
          avatar: avatar || '🍿',
          lastActive: Date.now()
        }
      },
      lastState: {
        isPlaying: false,
        currentTime: 0,
        url: url || '',
        lastUpdated: Date.now()
      }
    };

    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${cleanRoomId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    })
      .then(res => res.json())
      .then(data => sendResponse({ status: 'success', data }))
      .catch(err => sendResponse({ status: 'error', error: err.toString() }));

    return true;
  } else if (message.type === 'join-room') {
    const { roomId, userId, username, avatar } = message;
    const cleanRoomId = (roomId || '').trim().toUpperCase();

    // Önce tüm odaları çekip büyük/küçük harf bağımsız sorgula
    fetch('https://movieparty-af87f-default-rtdb.firebaseio.com/rooms.json')
      .then(res => res.json())
      .then(allRooms => {
        if (!allRooms) {
          sendResponse({ status: 'not_found' });
          return;
        }

        // Büyük/küçük harf duyarsız oda arama
        let matchedRoomId = null;
        let matchedRoomData = null;

        Object.entries(allRooms).forEach(([rId, rData]) => {
          if (rId.trim().toUpperCase() === cleanRoomId) {
            matchedRoomId = rId;
            matchedRoomData = rData;
          }
        });

        if (!matchedRoomData || !matchedRoomId) {
          sendResponse({ status: 'not_found' });
          return;
        }

        // Kullanıcıyı odaya ekle
        fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${matchedRoomId}/users/${userId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username || 'Anonim',
            avatar: avatar || '🍿',
            lastActive: Date.now()
          })
        })
          .then(() => sendResponse({ status: 'success', roomData: matchedRoomData, roomId: matchedRoomId }))
          .catch(err => sendResponse({ status: 'error', error: err.toString() }));
      })
      .catch(err => sendResponse({ status: 'error', error: err.toString() }));

    return true;
  }
});

// Arka planda 3 saattir inaktif veya 24 saatliği geçmiş odaları temizleyen REST fonksiyonu
function cleanupExpiredRoomsREST() {
  fetch('https://movieparty-af87f-default-rtdb.firebaseio.com/rooms.json')
    .then(res => res.json())
    .then(rooms => {
      if (!rooms) return;
      const now = Date.now();
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

      Object.entries(rooms).forEach(([rId, rData]) => {
        if (!rData || !rId || rId.length !== 4) return;
        const lastUpdated = (rData.lastState && rData.lastState.lastUpdated) ? rData.lastState.lastUpdated : 0;
        const users = rData.users || {};
        const activeUserCount = Object.keys(users).length;

        let latestUserActivity = lastUpdated;
        Object.values(users).forEach(u => {
          if (u.lastActive && u.lastActive > latestUserActivity) {
            latestUserActivity = u.lastActive;
          }
        });

        const isExpired24h = (lastUpdated > 0 && (now - lastUpdated > TWENTY_FOUR_HOURS_MS));
        const isInactive3h = (now - latestUserActivity > THREE_HOURS_MS);

        if (isExpired24h || (activeUserCount === 0 && isInactive3h)) {
          console.log(`[FilmSync Background İmha] Oda ${rId} siliniyor.`);
          fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${rId}.json`, {
            method: 'DELETE'
          }).catch(err => console.error(`[FilmSync Delete Hatası ${rId}]`, err));
        }
      });
    })
    .catch(err => console.error('[FilmSync REST Cleanup Hatası]', err));
}

// Film/Dizi Adres Doğrulayıcı
function isMovieWatchUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (u.includes('hdfilmcehennemi')) return true;
  if (u.includes('dizipal')) return true;
  if (u.includes('netflix.com')) return true;
  if (u.includes('youtube.com')) return true;
  if (u.includes('disneyplus.com')) return true;
  if (u.includes('primevideo.com') || u.includes('amazon.com')) return true;
  if (u.includes('blutv.com') || u.includes('exxen.com') || u.includes('gain.tv') || u.includes('todtv.com.tr')) return true;
  return false;
}

// Sekme Güncellendiğinde veya Değiştiğinde Arka Planda Film Adresini Anında Firebase'e Yaz
function syncCurrentTabMovieUrl(tabId, url) {
  if (!isMovieWatchUrl(url)) return;

  chrome.storage.local.get(['roomId'], (res) => {
    if (res.roomId) {
      console.log(`[FilmSync Background] Canlı film adresi Firebase'e yazılıyor: ${url}`);
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${res.roomId}/lastState.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url,
          lastUpdated: Date.now()
        })
      }).catch(err => console.error('[FilmSync URL Sync Hatası]', err));
    }
  });
}

// Tab Olay Dinleyicileri
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab && tab.url) {
    syncCurrentTabMovieUrl(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      syncCurrentTabMovieUrl(activeInfo.tabId, tab.url);
    }
  });
});
