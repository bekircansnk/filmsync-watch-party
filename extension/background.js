// Film Partisi Background Service Worker
const DEFAULT_DIZIPAL_URL = 'https://dizipal1590.com/';
const DIZIPAL_SHORTLINK_URL = 'https://t.ly/dizipalgiris';

// Eklenti kurulduğunda, güncellendiğinde veya yeniden başlatıldığında açık sekmeleri otomatik kurtar
function reinjectContentScriptsIntoOpenTabs() {
  try {
    chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
      if (!tabs || !tabs.length) return;
      tabs.forEach((tab) => {
        if (!tab || !tab.id || !tab.url) return;
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('https://chrome.google.com/webstore')) return;
        chrome.tabs.sendMessage(tab.id, { type: 'ping-content' }, (resp) => {
          if (chrome.runtime.lastError || !resp || !resp.alive) {
            if (chrome.scripting && chrome.scripting.executeScript) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                files: ['libs/firebase-app.js', 'libs/firebase-database.js', 'content.js']
              }, () => {
                if (chrome.runtime.lastError) {}
              });
            }
          }
        });
      });
    });
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Film Partisi eklentisi hazır.');
  chrome.storage.local.get(['dizipalCurrentUrl'], (res) => {
    if (!res || !res.dizipalCurrentUrl) {
      chrome.storage.local.set({ dizipalCurrentUrl: DEFAULT_DIZIPAL_URL });
    }
  });
  reinjectContentScriptsIntoOpenTabs();
});

if (chrome.runtime.onStartup) {
  chrome.runtime.onStartup.addListener(() => {
    reinjectContentScriptsIntoOpenTabs();
  });
}

// Metin/HTML içerisinden en güncel dizipalXXXX.com adresini ayıklayan yardımcı
function extractDizipalDomainFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const regex = /dizipal(\d{3,5})\.(com|org|net|tv|link)/gi;
  let match;
  let bestDomain = null;
  let bestNum = 0;
  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    const tld = match[2].toLowerCase();
    // İlk karşılaşılan (arama sonucunda en üstte çıkan) veya geçerli aralıktaki domaini seç
    if (!bestDomain && num >= 500 && num <= 9999) {
      bestDomain = `https://dizipal${num}.${tld}/`;
      bestNum = num;
    }
  }
  return bestDomain;
}

// Güncel Dizipal Adresini Arama Motorları ve Yönlendirme Zincirinden Otomatik Çözümleyen Motor
async function resolveLatestDizipalUrl(fallbackUrl = DEFAULT_DIZIPAL_URL) {
  // 1. Önce mevcut/bilinen adrese erişilebiliyor mu hızlıca kontrol et (2.2s timeout)
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2200);
    const probeResp = await fetch(fallbackUrl, { method: 'GET', cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timer);
    if (probeResp && (probeResp.ok || probeResp.status === 403 || probeResp.status === 503)) {
      const finalUrl = probeResp.url || fallbackUrl;
      const extracted = extractDizipalDomainFromText(finalUrl);
      if (extracted) {
        chrome.storage.local.set({ dizipalCurrentUrl: extracted });
        return extracted;
      }
      return fallbackUrl;
    }
  } catch (e) {
    // Mevcut domain engellenmiş veya düşmüş olabilir -> Arama ve kısa link çözümleyiciye geç
  }

  // 2. t.ly/dizipalgiris ve Arama Motorlarından En Üstteki Güncel Dizipal Adresini Bul
  const searchEndpoints = [
    DIZIPAL_SHORTLINK_URL,
    'https://html.duckduckgo.com/html/?q=dizipal+guncel+giris+adresi',
    'https://www.bing.com/search?q=dizipal+guncel+giris'
  ];

  for (const endpoint of searchEndpoints) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch(endpoint, { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(timer);

      const fromFinalUrl = extractDizipalDomainFromText(res.url || '');
      if (fromFinalUrl) {
        chrome.storage.local.set({ dizipalCurrentUrl: fromFinalUrl });
        return fromFinalUrl;
      }

      const bodyText = await res.text();
      const fromBody = extractDizipalDomainFromText(bodyText);
      if (fromBody) {
        chrome.storage.local.set({ dizipalCurrentUrl: fromBody });
        return fromBody;
      }
    } catch (e) {}
  }

  // 3. Ardışık Numara Tarama (Örn: 1590 kapandıysa 1591..1595 arasını paralel yokla)
  const currentMatch = (fallbackUrl || '').match(/dizipal(\d+)/i);
  const baseNum = currentMatch ? parseInt(currentMatch[1], 10) : 1590;
  for (let offset = 1; offset <= 4; offset++) {
    const candidate = `https://dizipal${baseNum + offset}.com/`;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(candidate, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal });
      clearTimeout(timer);
      if (res && (res.ok || res.status === 403)) {
        chrome.storage.local.set({ dizipalCurrentUrl: candidate });
        return candidate;
      }
    } catch (e) {}
  }

  return fallbackUrl || DEFAULT_DIZIPAL_URL;
}

// Sekme Yönlendirme ve Bilgi Dinleyicisi
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'open-dizipal-direct') {
    chrome.storage.local.get(['dizipalCurrentUrl'], (st) => {
      const initialUrl = (st && st.dizipalCurrentUrl) ? st.dizipalCurrentUrl : (message.fallbackUrl || DEFAULT_DIZIPAL_URL);
      chrome.tabs.create({ url: initialUrl }, (createdTab) => {
        sendResponse({ status: 'success', opened: true, url: initialUrl });
        // Arka planda güncel adresi doğrula; adres değişmişse sekmeyi otomatik yeni adrese geçir
        resolveLatestDizipalUrl(initialUrl).then((resolvedUrl) => {
          if (resolvedUrl && resolvedUrl !== initialUrl && createdTab && createdTab.id) {
            chrome.tabs.update(createdTab.id, { url: resolvedUrl });
          }
        }).catch(() => {});
      });
    });
    return true;
  } else if (message.type === 'redirect-tab' && message.url) {
    const tabId = sender.tab ? sender.tab.id : null;
    if (tabId) {
      console.log(`[FilmSync Background] Sekme ${tabId} yeni adrese yönlendiriliyor: ${message.url}`);
      chrome.tabs.update(tabId, { url: message.url }, () => {
        sendResponse({ status: 'success' });
      });
      return true;
    }
  } else if (message.type === 'get-tab-id') {
    const tabId = sender.tab ? sender.tab.id : null;
    const topUrl = (sender.tab && sender.tab.url) ? sender.tab.url : '';
    const topTitle = (sender.tab && sender.tab.title) ? sender.tab.title : '';
    sendResponse({ tabId: tabId, topUrl: topUrl, topTitle: topTitle });
    return false;
  } else if (message.type === 'page-unload') {
    const { roomId, username, userId, currentTime, isHost, isWatchPage } = message;
    if (roomId && username) {
      // Video oynatılıyorsa (> 1s) veya aktif izleme sayfasında yetkili kullanıcı sayfayı yenilediyse filmi duraklat
      if ((typeof currentTime === 'number' && currentTime > 1.0) || (isWatchPage && isHost !== false)) {
        if (isHost !== false) {
          const patchBody = {
            action: 'pause',
            isPlaying: false,
            lastUpdated: Date.now(),
            senderId: (userId || 'unloaded_user') + '_reload'
          };
          if (typeof currentTime === 'number' && currentTime > 1.0) {
            patchBody.currentTime = currentTime;
          }

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
    const { roomId, hostId, username, avatar, hostOnly, isPublic, url, pageTitle, platformName } = message;
    const cleanRoomId = (roomId || '').trim().toUpperCase();
    const nowTs = Date.now();

    const roomData = {
      password: '',
      createdAt: nowTs,
      hostId: hostId,
      hostOnly: hostOnly || false,
      isPublic: isPublic !== false,
      users: {
        [hostId]: {
          username: username || 'Anonim',
          avatar: avatar || '🍿',
          lastActive: nowTs,
          lastSeen: nowTs
        }
      },
      lastState: {
        isPlaying: false,
        currentTime: 0,
        url: url ? normalizeMovieUrl(url) : '',
        pageTitle: (pageTitle || '').slice(0, 200),
        platformName: (platformName || detectPlatformName(url || '')).slice(0, 80),
        lastUpdated: nowTs
      }
    };

    fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${cleanRoomId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
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

// Platform adını URL'den tespit eden yardımcı
function detectPlatformName(url) {
  if (!url || typeof url !== 'string') return 'Film Partisi';
  const u = url.toLowerCase();
  if (u.includes('netflix.com')) return 'Netflix';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('primevideo.com') || u.includes('amazon.')) return 'Prime Video';
  if (u.includes('disneyplus.com')) return 'Disney+';
  if (u.includes('fullhdfilmizlesene')) return 'FullHDFilmizlesene';
  if (u.includes('hdfilmcehennemi')) return 'HDFilmCehennemi';
  if (u.includes('filmcehennemi')) return 'FilmCehennemi';
  if (u.includes('dizipal')) return 'Dizipal';
  if (u.includes('hdfilmizle')) return 'HDFilmİzle';
  if (u.includes('blutv.com')) return 'BluTV';
  if (u.includes('exxen.com')) return 'Exxen';
  if (u.includes('gain.tv')) return 'GAİN';
  if (u.includes('todtv.com')) return 'TOD';
  if (u.includes('tabii.com')) return 'tabii';
  if (u.includes('mubi.com')) return 'MUBI';
  if (u.includes('crunchyroll.com')) return 'Crunchyroll';
  if (u.includes('twitch.tv')) return 'Twitch';
  if (u.includes('kick.com')) return 'Kick';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Web Video';
  }
}

// Film/Dizi Adres Doğrulayıcı (Yalnızca gerçek oynatma sayfalarını hedefle, arama/browse sayfalarını filtrele)
function isMovieWatchUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return false;

  // Arama motorları, eklenti sayfaları ve bilinen liste/browse sayfaları hariç
  if (u.includes('google.com/search') || u.includes('bing.com/search') || u.includes('yandex.com')) return false;
  if (u.includes('github.com/') || u.includes('github.io/filmsync')) return false;

  // Netflix: Sadece /watch/ aktif oynatma sayfasıdır (/browse ve /title fragmanları atlanır)
  if (u.includes('netflix.com')) {
    return u.includes('netflix.com/watch');
  }
  // YouTube: Sadece /watch veya /shorts aktif oynatma sayfasıdır (/feed, /results ve anasayfa atlanır)
  if (u.includes('youtube.com')) {
    return u.includes('youtube.com/watch') || u.includes('youtube.com/shorts/');
  }
  if (u.includes('youtu.be/')) return true;

  // Disney+: /video/ sayfası
  if (u.includes('disneyplus.com')) {
    return u.includes('disneyplus.com/video/') || u.includes('/video/');
  }

  // Amazon Prime Video
  if (u.includes('primevideo.com')) {
    return u.includes('/detail') || u.includes('/watch') || u.includes('/gp/video') || u.includes('/region/');
  }

  // Bilinen Türk ve Global Film/Dizi Platformları
  if (
    u.includes('hdfilmcehennemi') ||
    u.includes('filmcehennemi') ||
    u.includes('fullhdfilmizlesene') ||
    u.includes('dizipal') ||
    u.includes('hdfilmizle') ||
    u.includes('filmizle') ||
    u.includes('jetfilmizle') ||
    u.includes('kultfilmler') ||
    u.includes('yabancidizi') ||
    u.includes('dizibox') ||
    u.includes('sezonlukdizi') ||
    u.includes('sinefy') ||
    u.includes('dizilla') ||
    u.includes('dizigom') ||
    u.includes('webteizle') ||
    u.includes('blutv.com') ||
    u.includes('exxen.com') ||
    u.includes('gain.tv') ||
    u.includes('todtv.com.tr') ||
    u.includes('tabii.com') ||
    u.includes('puhutv.com') ||
    u.includes('mubi.com') ||
    u.includes('crunchyroll.com')
  ) {
    return true;
  }

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
      if (parsed.pathname.includes('/shorts/')) {
        return `https://www.youtube.com${parsed.pathname.replace(/\/$/, '')}`;
      }
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
  if (n1 && n2 && n1 === n2) return true;
  // Dizipal numara değişse bile (örn. dizipal1590.com vs dizipal1591.com) aynı dizi/bölüm yolunu eşleştir
  try {
    const p1 = new URL(url1);
    const p2 = new URL(url2);
    if (/dizipal\d*\./i.test(p1.hostname) && /dizipal\d*\./i.test(p2.hostname)) {
      const path1 = p1.pathname.replace(/\/$/, '');
      const path2 = p2.pathname.replace(/\/$/, '');
      if (path1 && path1.length > 1 && path1 === path2) return true;
    }
  } catch (e) {}
  return false;
}

let lastSyncedMovieUrl = '';
let syncMovieUrlTimer = null;

// Sekme Güncellendiğinde Arka Planda Film Adresini Firebase'e Yaz
function syncCurrentTabMovieUrl(tabId, url, tabTitle = '') {
  if (!isMovieWatchUrl(url)) return;
  const cleanUrl = normalizeMovieUrl(url);
  if (areUrlsSameMovie(cleanUrl, lastSyncedMovieUrl)) return;

  chrome.storage.local.get(['roomId', 'userId', 'username', 'activeTabId', 'hostId', 'hostOnly'], (res) => {
    // Sadece aktif bir oda varsa ve bu sekme belirlenmiş aktif sekme ise yaz
    if (!res.roomId) return;
    if (res.activeTabId && res.activeTabId !== tabId) return;

    // Eğer "Yalnızca ben kontrol edeyim" (hostOnly) açıksa sadece host değiştirebilir.
    // Ancak serbest moddaysa (hostOnly === false) ve kullanıcı zaten aktif parti sekmesindeyse yeni bölüme geçebilir.
    const isHost = !res.hostId || res.userId === res.hostId;
    const canControlUrl = isHost || !res.hostOnly;
    if (!canControlUrl) {
      return;
    }

    if (syncMovieUrlTimer) clearTimeout(syncMovieUrlTimer);
    syncMovieUrlTimer = setTimeout(() => {
      const previousUrl = lastSyncedMovieUrl;
      lastSyncedMovieUrl = cleanUrl;
      console.log(`[FilmSync Background] Canlı film adresi Firebase'e yazılıyor: ${cleanUrl}`);
      const payload = {
        url: cleanUrl,
        platformName: detectPlatformName(cleanUrl),
        senderId: res.userId || 'system'
      };
      if (tabTitle) {
        payload.pageTitle = tabTitle.slice(0, 200);
      }
      fetch(`https://movieparty-af87f-default-rtdb.firebaseio.com/rooms/${res.roomId}/lastState.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        if (previousUrl && !areUrlsSameMovie(previousUrl, cleanUrl)) {
          console.log(`[FilmSync Background] ${res.username || 'Katılımcı'} yeni bölüme/filme geçti: ${cleanUrl}`);
        }
      }).catch(err => console.error('[FilmSync URL Sync Hatası]', err));
    }, 800);
  });
}

// Tab Olay Dinleyicileri (SPA içi URL değişiminde, Dizipal güncel domain takibinde ve sayfa tamamlanmasında tetikle)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab && tab.url) {
    try {
      const parsed = new URL(tab.url);
      // 1. Kullanıcı güncel bir dizipalXXXX.com adresine girdiğinde otomatik öğren ve kaydet
      if (/^dizipal\d+\.(com|org|net|tv|link)$/i.test(parsed.hostname.replace(/^www\./, ''))) {
        const latestOrigin = `${parsed.protocol}//${parsed.hostname}/`;
        chrome.storage.local.set({ dizipalCurrentUrl: latestOrigin });
      }
      // 2. t.ly/dizipalgiris sonrası Google aramasına düşüldüğünde sorguda dizipalXXXX.com varsa anında yönlendir
      if (parsed.hostname.includes('google.') && parsed.pathname === '/search') {
        const q = parsed.searchParams.get('q') || '';
        const directFromQuery = extractDizipalDomainFromText(q);
        if (directFromQuery) {
          chrome.storage.local.set({ dizipalCurrentUrl: directFromQuery });
          chrome.tabs.update(tabId, { url: directFromQuery });
          return;
        }
      }
    } catch (e) {}

    syncCurrentTabMovieUrl(tabId, tab.url, tab.title || '');
  }
});
