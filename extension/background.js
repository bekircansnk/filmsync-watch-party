// Film Partisi Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Film Partisi eklentisi hazır.');
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
    return false;
  } else if (message.type === 'page-unload') {
    const { roomId, username, userId, currentTime, isHost } = message;
    if (roomId && username) {
      // Yalnızca video gerçekten oynatılıyorsa (> 1s) ve oda sahibi veya serbest moddaysa duraklat
      // Sekme ilk açılırken, yeniden yüklenirken veya video başlamamışken odayı sıfırlama!
      if (typeof currentTime === 'number' && currentTime > 1.0) {
        if (isHost !== false) {
          const patchBody = {
            isPlaying: false,
            currentTime: currentTime,
            lastUpdated: Date.now(),
            senderId: userId || 'unloaded_user'
          };

          fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/lastState.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBody)
          }).catch(err => console.error('[FilmSync Unload Patch Hatası]', err));

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
        } else {
          fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/messages.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'Sistem',
              message: `${username} sayfayı yeniledi.`,
              isSystem: true,
              timestamp: Date.now()
            })
          }).catch(err => console.error('[FilmSync Unload Msg Hatası]', err));
        }
      } else {
        fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${roomId}/messages.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'Sistem',
            message: `${username} sayfayı yeniledi.`,
            isSystem: true,
            timestamp: Date.now()
          })
        }).catch(err => console.error('[FilmSync Unload Msg Hatası]', err));
      }

      // Otomatik zaman aşımı olan inaktif odaları temizle
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
        url: url ? normalizeMovieUrl(url) : '',
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

    // Doğrudan spesifik odayı çek (tüm veritabanını indirme!)
    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${cleanRoomId}.json`)
      .then(res => res.json())
      .then(roomData => {
        if (!roomData) {
          sendResponse({ status: 'not_found' });
          return;
        }

        // Kullanıcıyı odaya ekle
        fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${cleanRoomId}/users/${userId}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username || 'Anonim',
            avatar: avatar || '🍿',
            lastActive: Date.now()
          })
        })
          .then(() => sendResponse({ status: 'success', roomData, roomId: cleanRoomId, hostId: roomData.hostId }))
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

// Film/Dizi Adres Doğrulayıcı (Yalnızca gerçek oynatma sayfalarını hedefle)
function isMovieWatchUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (u.includes('hdfilmcehennemi')) return true;
  if (u.includes('dizipal')) return true;
  if (u.includes('netflix.com/watch')) return true; // Sadece aktif video izleme sayfası!
  if (u.includes('youtube.com/watch')) return true;
  if (u.includes('disneyplus.com/video/')) return true;
  if (u.includes('primevideo.com/detail') || u.includes('primevideo.com/watch')) return true;
  if (u.includes('blutv.com') || u.includes('exxen.com') || u.includes('gain.tv') || u.includes('todtv.com.tr')) return true;
  return false;
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

let lastSyncedMovieUrl = '';
let syncMovieUrlTimer = null;

// Sekme Güncellendiğinde Arka Planda Film Adresini Sadece Oda Sahibi (Host) İçin Firebase'e Yaz
function syncCurrentTabMovieUrl(tabId, url) {
  if (!isMovieWatchUrl(url)) return;
  const cleanUrl = normalizeMovieUrl(url);
  if (areUrlsSameMovie(cleanUrl, lastSyncedMovieUrl)) return;

  chrome.storage.local.get(['roomId', 'userId', 'activeTabId', 'hostId'], (res) => {
    // Sadece aktif bir oda varsa ve bu sekme belirlenmiş aktif sekme ise yaz
    if (!res.roomId) return;
    if (res.activeTabId && res.activeTabId !== tabId) return;

    // SADECE ODA SAHİBİ (HOST) FİLM URL'SİNİ DEĞİŞTİREBİLİR!
    // Misafir kullanıcılar başka sekmeye geçtiğinde veya odaya katıldığında oda linkini bozamaz.
    if (res.hostId && res.userId && res.userId !== res.hostId) {
      return;
    }

    if (syncMovieUrlTimer) clearTimeout(syncMovieUrlTimer);
    syncMovieUrlTimer = setTimeout(() => {
      lastSyncedMovieUrl = cleanUrl;
      console.log(`[FilmSync Background] Canlı film adresi Firebase'e yazılıyor: ${cleanUrl}`);
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${res.roomId}/lastState.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: cleanUrl,
          senderId: res.userId || 'system'
        })
      }).catch(err => console.error('[FilmSync URL Sync Hatası]', err));
    }, 800);
  });
}

// Tab Olay Dinleyicileri (SPA içi URL değişiminde ve sayfa tamamlanmasında tetikle)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab && tab.url) {
    syncCurrentTabMovieUrl(tabId, tab.url);
  }
});
