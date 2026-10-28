(function() {
  'use strict';
  if (typeof window !== 'undefined' && window.__FILMSYNC_CONTENT_LOADED__) {
    return;
  }
  if (typeof window !== 'undefined') {
    window.__FILMSYNC_CONTENT_LOADED__ = true;
  }

// Film Partisi (FilmSync) — Evrensel Watch Party & Sohbet Motoru 🍿
let roomId = null;
let username = 'Anonim';
let password = '';
let userId = null;
let selectedAvatar = '🍿';
let hostId = null;
let hostOnly = false;
let db = null;


const Logger = {
  log: (...args) => {
    // Sadece debug modunda veya belirli durumlarda aktif edilebilir.
    // console.log('[FilmSync]', ...args);
  },
  warn: (...args) => {
    // Düzeltildi: console.warn kullanılabilir, kendi kendisini çağırmaz
    console.warn('[FilmSync Warn]', ...args);
  },
  error: (...args) => {
    // Düzeltildi: console.error kullanılabilir, kendi kendisini çağırmaz
    console.error('[FilmSync Error]', ...args);
  }
};





let videoElement = null;
let isSyncing = false;
let chatPanel = null;
let messageInput = null;
let messageList = null;
let userListDisplay = null;

let isFirebaseInitialized = false;
let renderedMessageKeys = new Set();
let pendingState = null;
let isFirstSync = true;
let messagesQueue = [];
let isInputFocused = false;
let lastTypingTime = 0;
let lastKnownState = null;
let hasChildFrameVideo = false;
let isParentIframeFullscreen = false;
let isRoomActiveInTop = false;
let lastIframeVideoTime = 0;
let lastTrackedVideoTime = -1;
let lastTrackedVideoTimestamp = 0;
let isReloadPauseGuardActive = false;
let reloadPauseGuardUntil = 0;

// Zaman, Ses ve Senkronizasyon Korumaları
let serverTimeOffset = 0;
let lastProgrammaticSeekTime = -1;
let lastProgrammaticSeekTimestamp = 0;
let isProgrammaticSeeking = false;
let userSeekDebounceTimer = null;
let syncSafetyTimer = null;
let isFullscreenListenersAttached = false;
let isFullscreenIdleDetectorAttached = false;
let lastMouseMoveTime = 0;
let videoTrackingInterval = null;
let driftCorrectionInterval = null;
let uiKeeperInterval = null;
let iframeKeeperInterval = null;
let netflixButtonObserver = null;
let netflixButtonDebounceTimer = null;
let bufferingDebounceTimer = null;
let currentBufferingState = false;
let heartbeatInterval = null;
let lastPingRTT = null;
let lastEscapeTime = 0;

// Ses Kısma (M Tuşu) Geri Alma Koruması (Hardware/Player Mute Guard) ve Cross-World Tuş Tekilleştiricisi
let lastBlockedKeyTimestamp = 0;
let lastTrustedMuted = false;
let lastTrustedVolume = 1.0;
let lastForwardedKeySignature = '';
let lastForwardedKeyTime = 0;
let lastForwardedKeyVal = '';

// UI, Otomatik Gizleme, Medya Takibi ve Cross-Frame Durum Değişkenleri (TDZ Korumalı Üst Bildirim)
let forceSyncDebounceTimer = null;
let lastSentSeekTime = -999;
let lastSentSeekTimestamp = 0;
let lastSentPlayPauseAction = '';
let lastSentPlayPauseTimestamp = 0;
let lastTrackedLocationHref = typeof window !== 'undefined' && window.location ? window.location.href : '';
let lastSeekActivityTimestamp = 0;
let lastIframeTimePostTimestamp = 0;
let reactionContainer = null;
let cachedUsersList = [];
let panelForceOpenUntil = 0;
let isChatOpenInTop = false;
let idleTimer = null;
let autoHideTimer = null;
let isMouseInsideChatPanel = false;
const AUTO_HIDE_DELAY = 3500; // 3.5 saniye
let isFullscreen = false;
let isGlobalKeyListenersAttached = false;

// --- 🔊 WEB AUDIO API SES MOTORU (Sıfır Harici Dosya) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggle() {
    this.enabled = true;
    return true;
  }

  // 1. Mesaj Gönderimi: Hafif ve net dokunma sesi
  playSendTap() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch(e) {}
  }

  // 2. Mesaj Alımı: Yumuşak su damlası / baloncuk tonu
  playMessageBubble() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  // 3. Emoji Reaksiyon: Dingin ve tatlı 3-ses akoru (C5 Majör)
  playReactionChord() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = this.ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.1, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.35);
      });
    } catch(e) {}
  }
}
const soundEffects = new SoundEffects();

// --- 📡 15s HEARTBEAT VE SIFIR-MALİYET CANLI RTT (PİNG) MOTORU ---
function startHeartbeat(userRef) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  const sendHeartbeat = () => {
    if (!db || !roomId || !userId) return;
    const tReq = Date.now();
    userRef.update({
      username: username || 'Anonim',
      avatar: selectedAvatar || '🍿',
      lastActive: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      const rtt = Date.now() - tReq;
      lastPingRTT = rtt;
      updatePingIndicator(rtt);
    }).catch(err => {
      Logger.warn('[FilmSync Heartbeat] Hata:', err);
    });
  };

  sendHeartbeat();
  heartbeatInterval = setInterval(sendHeartbeat, 15000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function updatePingIndicator(rtt) {
  if (typeof rtt === 'number' && !isNaN(rtt)) {
    lastPingRTT = Math.max(0, Math.round(rtt));
  }
}

function getEstimatedServerTime() {
  return Date.now() + serverTimeOffset;
}

// Firebase Canlı Yapılandırması
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

// Reklam, analitik, captcha veya boş yan iframe'lerde eklentiyi çalıştırmayıp CPU/RAM tasarrufu sağlar
function isIgnoredNonPlayerFrame() {
  if (window === window.top) return false;
  try {
    const href = (window.location.href || '').toLowerCase();
    const host = (window.location.hostname || '').toLowerCase();
    if (!href || href === 'about:blank' || href.startsWith('about:') || href.startsWith('javascript:') || href.startsWith('data:')) {
      return true;
    }
    const ignoredDomains = [
      'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
      'googletagmanager.com', 'google-analytics.com', 'recaptcha.net',
      'gstatic.com/recaptcha', 'google.com/recaptcha', 'facebook.com/tr',
      'connect.facebook.net', 'yandex.ru', 'mc.yandex.ru', 'scorecardsresearch.com',
      'adnxs.com', 'popads.net', 'popcash.net', 'exoclick.com', 'juicyads.com',
      'a-ads.com', 'propellerads.com', 'cloudflare.com/cdn-cgi', 'challenges.cloudflare.com',
      'chatango.com', 'disqus.com'
    ];
    for (let i = 0; i < ignoredDomains.length; i++) {
      if (host.includes(ignoredDomains[i]) || href.includes(ignoredDomains[i])) return true;
    }
    if (window.innerWidth > 0 && window.innerHeight > 0 && window.innerWidth < 50 && window.innerHeight < 50) {
      return true;
    }
  } catch (e) {}
  return false;
}

// Evrensel inject.js enjeksiyonu (Ana sayfa ve tüm oynatıcı iframeleri için)
function injectPageHookScript() {
  try {
    // 1. Eğer inject.js Manifest V3 world: "MAIN" ile zaten yüklendiyse DOM'a tekrar ekleme
    if (document.documentElement && document.documentElement.getAttribute('data-filmsync-inject-loaded') === 'true') {
      return;
    }
    if (document.getElementById('filmsync-page-inject-script')) return;
    if (isIgnoredNonPlayerFrame()) return;
    if (!window.location.protocol || !window.location.protocol.startsWith('http')) return;

    // 2. YouTube ve benzeri katı CSP uygulayan sitelerde veya doğrudan ana dünyada çalışan sayfalarda gereksiz DOM müdahalesi yapma
    const host = (window.location.hostname || '').toLowerCase();
    if (host.includes('youtube.com') || host.includes('googlevideo.com')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'filmsync-page-inject-script';
    script.src = chrome.runtime.getURL('inject.js');
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {}
}
injectPageHookScript();

// Sayfadaki ve açık Shadow DOM ağaçlarındaki tüm <video> elementlerini CPU dostu O(1) hızda bulan tarayıcı (Apple M4 CPU optimizasyonu)
function findAllVideosDeep(rootNode = document, depth = 0) {
  const found = [];
  if (!rootNode || depth > 3) return found;
  try {
    const directVideos = rootNode.querySelectorAll ? rootNode.querySelectorAll('video') : [];
    for (let i = 0; i < directVideos.length; i++) {
      const v = directVideos[i];
      if (!found.includes(v)) found.push(v);
    }
    // Yalnızca gerçek Shadow DOM video oynatıcı kapsayıcılarını kontrol et (Tam DOM taramasını sıfırla!)
    const shadowHostSelector = 'disney-web-player, shaka-player, media-player, video-js, vds-media, ytmusic-player, [data-uia="player"], .dv-player-fullscreen';
    const shadowHosts = rootNode.querySelectorAll ? rootNode.querySelectorAll(shadowHostSelector) : [];
    for (let i = 0; i < shadowHosts.length; i++) {
      const el = shadowHosts[i];
      if (el && el.shadowRoot) {
        const shadowVideos = findAllVideosDeep(el.shadowRoot, depth + 1);
        for (let j = 0; j < shadowVideos.length; j++) {
          if (!found.includes(shadowVideos[j])) found.push(shadowVideos[j]);
        }
      }
    }
  } catch (e) {}
  return found;
}

// Sayfadaki en uygun (en büyük / aktif) <video> elementini bulan akıllı seçici
// (Prime Video, YouTube ve film sitelerindeki gizli 0x0 reklam/önizleme videolarını eler)
function findBestVideoElement() {
  const videos = findAllVideosDeep(document);

  if (videos.length === 0) return null;
  if (videos.length === 1) return videos[0];

  let bestVideo = null;
  let bestScore = -1;

  for (const v of videos) {
    let score = 0;
    try {
      const rect = v.getBoundingClientRect();
      const area = Math.max(0, rect.width) * Math.max(0, rect.height);
      if (area > 10000) score += 100; // Görünür boyutta video
      if (area > 100000) score += 200; // Ana oynatıcı boyutunda video
      if (v.src || v.currentSrc || v.querySelector('source')) score += 50;
      if (!isNaN(v.duration) && v.duration > 30) score += 150; // Uzun süreli gerçek film/dizi
      if (!v.paused) score += 80;
      if (v.readyState >= 2) score += 40;
      if (v.classList.contains('html5-main-video') || v.classList.contains('jw-video')) score += 200;
    } catch (e) {}

    if (score > bestScore) {
      bestScore = score;
      bestVideo = v;
    }
  }

  return bestVideo || videos[0];
}

// Oynatıcı Adaptörü (Farklı siteleri tek arayüzden kontrol etmek için)
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),
  isPrime: () => window.location.host.includes('primevideo.com') || window.location.host.includes('amazon.'),

  play: () => {
    try {

    const vid = videoElement || findBestVideoElement();
    if (PlayerAdapter.isNetflix()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      if (vid && vid.paused) vid.play().catch(() => {});
    } else if (PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      if (vid && vid.paused) vid.play().catch(() => {});
    } else {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
      if (vid && vid.paused) vid.play().catch(() => {});
    }
      } catch (err) {
      Logger.error('PlayerAdapter.play hatası:', err);
    }
  },

  pause: () => {
    try {

    const vid = videoElement || findBestVideoElement();
    if (PlayerAdapter.isNetflix()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
      if (vid && !vid.paused) vid.pause();
    } else if (PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
      if (vid && !vid.paused) vid.pause();
    } else {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
      if (vid && !vid.paused) vid.pause();
    }
      } catch (err) {
      Logger.error('PlayerAdapter.pause hatası:', err);
    }
  },

  seek: (seconds) => {
    try {

    const vid = videoElement || findBestVideoElement();
    if (PlayerAdapter.isNetflix()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      if (vid) {
        try { vid.currentTime = seconds; } catch (e) {}
      }
    } else if (PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      if (vid && Math.abs(vid.currentTime - seconds) > 0.5) {
        try { vid.currentTime = seconds; } catch (e) {}
      }
    } else {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
      if (vid) {
        try { vid.currentTime = seconds; } catch (e) {}
      }
    }
      } catch (err) {
      Logger.error('PlayerAdapter.seek hatası:', err);
    }
  }
};

function toggleVideoPlayPause() {
  const vid = videoElement || findBestVideoElement();
  if (vid) {
    if (vid.paused) {
      PlayerAdapter.play();
    } else {
      PlayerAdapter.pause();
    }
    return true;
  } else if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
    if (lastKnownState && lastKnownState.isPlaying) {
      PlayerAdapter.pause();
    } else {
      PlayerAdapter.play();
    }
    return true;
  } else if (window === window.top && hasChildFrameVideo) {
    // Video bir alt iframe içindeyse tüm alt iframelere toggle-play-pause mesajı gönder
    broadcastToAllFrames({ type: 'filmsync-toggle-video-play' });
    return true;
  }
  return false;
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
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'Film Partisi';
  }
}

// Sayfa başlığını temizleyen yardımcı
function getCleanPageTitle() {
  try {
    let t = (document.title || '').trim();
    t = t.replace(/\s*[-|•]\s*(YouTube|Netflix|Prime Video|Disney\+|HDFilmCehennemi|FullHDFilmizlesene|Dizipal).*$/i, '').trim();
    return t.slice(0, 120);
  } catch (e) {
    return '';
  }
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

  // TR Dublaj / TR Altyazı / Part 1-2 alt sekme geçişlerinde (ör. /film-izle/1 vs /film-izle/2)
  // aynı filmin farklı dil/kaynak alternatifiyse kullanıcıyı zorla yönlendirme döngüsüne sokma:
  try {
    const p1 = new URL(n1);
    const p2 = new URL(n2);
    const isBothDizipal = /dizipal\d*\./i.test(p1.hostname) && /dizipal\d*\./i.test(p2.hostname);
    if (isBothDizipal && p1.pathname.replace(/\/$/, '') === p2.pathname.replace(/\/$/, '') && p1.pathname.length > 1) {
      return true;
    }
    if ((p1.hostname === p2.hostname || isBothDizipal) && !p1.hostname.includes('netflix.com') && !p1.hostname.includes('youtube.com') && !p1.hostname.includes('disneyplus.com')) {
      const base1 = p1.pathname.replace(/\/(\d+|dublaj|altyazi|tr-dublaj|tr-altyazi|part-\d+)$/i, '');
      const base2 = p2.pathname.replace(/\/(\d+|dublaj|altyazi|tr-dublaj|tr-altyazi|part-\d+)$/i, '');
      // Eğer sezon/bölüm numarası (ör. 1-sezon-2-bolum vs 1-sezon-3-bolum) farklıysa FARKLI bölümdür!
      const epMatch1 = p1.pathname.match(/(\d+)-bolum/i) || p1.pathname.match(/bolum-(\d+)/i) || p1.pathname.match(/episode-(\d+)/i);
      const epMatch2 = p2.pathname.match(/(\d+)-bolum/i) || p2.pathname.match(/bolum-(\d+)/i) || p2.pathname.match(/episode-(\d+)/i);
      if (epMatch1 && epMatch2 && epMatch1[1] !== epMatch2[1]) {
        return false; // Yeni bölüme geçildi!
      }
      if (base1 && base1.length > 5 && base1 === base2) {
        return true; // Aynı filmin TR Dublaj / TR Altyazı / Kaynak 2 alternatifi!
      }
    }
  } catch (e) {}

  return false;
}

// Yalnızca geçerli film/dizi oynatma sayfalarını belirleyen koruma filtresi
function isMovieWatchUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.toLowerCase();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return false;

  if (u.includes('google.com/search') || u.includes('bing.com/search') || u.includes('yandex.com')) return false;
  if (u.includes('github.com/') || u.includes('github.io/filmsync')) return false;

  if (u.includes('netflix.com')) {
    return u.includes('netflix.com/watch'); // Sadece aktif video izleme sayfası! (browse/title fragmanları atlanır)
  }
  if (u.includes('youtube.com')) {
    return u.includes('youtube.com/watch') || u.includes('youtube.com/shorts/');
  }
  if (u.includes('youtu.be/')) return true;
  if (u.includes('disneyplus.com')) {
    return u.includes('disneyplus.com/video/') || u.includes('/video/');
  }
  if (u.includes('primevideo.com')) {
    return u.includes('primevideo.com/detail') || u.includes('primevideo.com/watch') || u.includes('primevideo.com/region/') || u.includes('primevideo.com/gp/video');
  }

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

// Ana pencerede (window.top) aktif bir oda varken sohbet arayüzünün gösterilip gösterilmeyeceğini belirleyen evrensel filtre
function shouldShowChatUIInTop() {
  if (window !== window.top) return false;
  const u = (window.location.href || '').toLowerCase();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return false;
  if (u.includes('github.com/bekircansnk/filmsync-watch-party') || u.includes('bekircansnk.github.io/filmsync-watch-party')) return false;
  if (u.includes('google.com/search') || u.includes('bing.com/search') || u.includes('yandex.com/search') || u.includes('duckduckgo.com/?q=')) return false;
  return true;
}

// Sayfada aktif bir video veya video oynatıcı iframe olup olmadığını kontrol eden evrensel yardımcı
function hasVideoOrPlayerFrame() {
  if (findBestVideoElement()) return true;
  if (hasChildFrameVideo) return true;
  try {
    const playerContainer = document.querySelector(
      '.jwplayer, .video-js, .plyr, .vjs-tech, #player, .player-container, .video-player, .watch-player, .episode-player, [data-player]'
    );
    if (playerContainer) return true;

    const iframes = document.querySelectorAll('iframe');
    for (const f of iframes) {
      const src = (f.src || f.getAttribute('data-src') || f.getAttribute('data-lazy-src') || '').toLowerCase();
      const allow = (f.getAttribute('allow') || '').toLowerCase();
      if (
        f.hasAttribute('allowfullscreen') ||
        f.hasAttribute('webkitallowfullscreen') ||
        allow.includes('fullscreen') ||
        allow.includes('autoplay') ||
        src.includes('embed') ||
        src.includes('player') ||
        src.includes('vidmoly') ||
        src.includes('rapid') ||
        src.includes('closeload') ||
        src.includes('sibnet') ||
        src.includes('odnoklassniki') ||
        src.includes('ok.ru') ||
        src.includes('mail.ru') ||
        src.includes('stream') ||
        src.includes('video') ||
        src.includes('vidsrc') ||
        src.includes('filemoon') ||
        src.includes('voe.') ||
        src.includes('dood') ||
        src.includes('mixdrop') ||
        src.includes('uqload') ||
        src.includes('m3u8') ||
        src.includes('watch')
      ) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

// Platform Oynatıcı API Hazır Olma Durumu (Netflix Cadmium / inject.js)
let isPlatformPlayerReady = !PlayerAdapter.isNetflix();

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data) return;
  if (event.data.source === 'filmsync-inject' && event.data.action === 'player-ready') {
    Logger.log('[FilmSync Content] Injected scriptten player-ready sinyali alındı:', event.data.platform);
    isPlatformPlayerReady = true;
  }
});

// Önbellekte kalan eski Firebase WebSocket hata bayraklarını temizle ve WebSocket zorla
function clearStaleFirebaseCache() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.includes('previous_websocket_failure') || k.startsWith('firebase:host:'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
  try {
    sessionStorage.removeItem('firebase:previous_websocket_failure');
  } catch (e) {}
  try {
    if (typeof firebase !== 'undefined' && firebase.database && typeof firebase.database.forceWebSockets === 'function') {
      firebase.database.forceWebSockets();
    }
  } catch (e) {}
}

// Dizipal Otomatik Arama Atlama & Güncel Domain Kaydedici (t.ly/dizipalgiris -> Google 1. Sonuç -> Doğrudan Dizipal)
function handleDizipalSearchBypass() {
  if (window !== window.top) return false;
  try {
    const href = window.location.href;
    const host = window.location.hostname.replace(/^www\./, '').toLowerCase();

    // 1. Zaten aktif bir dizipalXXXX sayfasındaysak güncel adresi kaydet
    if (/^dizipal\d+\.[a-z]{2,10}$/i.test(host)) {
      const activeOrigin = `${window.location.protocol}//${window.location.hostname}/`;
      chrome.storage.local.set({ dizipalCurrentUrl: activeOrigin });
      return false;
    }

    // 2. t.ly/dizipalgiris veya Google/Bing/DuckDuckGo arama sayfasındaysak en üstteki dizipalXXXX sonucuna doğrudan atla
    const isSearchEngine = host.includes('google.') || host.includes('bing.com') || host.includes('duckduckgo.com') || host.includes('yandex.');
    if (isSearchEngine && /dizipal/i.test(href)) {
      const extractAndRedirect = () => {
        // Önce URL sorgusunda tam domain var mı kontrol et (örn: ?q=dizipal1590.com)
        const queryMatch = decodeURIComponent(href).match(/dizipal(\d{2,5})\.([a-z]{2,10})/i);
        if (queryMatch) {
          const directUrl = `https://dizipal${queryMatch[1]}.${queryMatch[2].toLowerCase()}/`;
          chrome.storage.local.set({ dizipalCurrentUrl: directUrl });
          window.location.replace(directUrl);
          return true;
        }
        // Arama sonuçlarındaki en üstteki gerçek dizipalXXXX linkini bul
        const links = Array.from(document.querySelectorAll('a[href]'));
        for (const a of links) {
          const rawHref = a.href || '';
          const m = rawHref.match(/https?:\/\/(?:www\.)?(dizipal\d{2,5}\.[a-z]{2,10})/i);
          if (m && !rawHref.includes('google.') && !rawHref.includes('bing.') && !rawHref.includes('webcache')) {
            const targetOrigin = `https://${m[1].toLowerCase()}/`;
            chrome.storage.local.set({ dizipalCurrentUrl: targetOrigin });
            window.location.replace(targetOrigin);
            return true;
          }
        }
        return false;
      };

      if (extractAndRedirect()) return true;
      document.addEventListener('DOMContentLoaded', extractAndRedirect, { once: true });
      setTimeout(extractAndRedirect, 300);
    }
  } catch (e) {}
  return false;
}

// Sayfa yüklendiğinde başlat
init();

function init(forceOpenChat = false) {
  if (isIgnoredNonPlayerFrame()) return;
  clearStaleFirebaseCache();
  if (handleDizipalSearchBypass()) return;

  // GİTHUB VE WEB LANDİNG DAVET LİNKİ KONTROLÜ (İsim Giriş Modal Destekli)
  const isLandingOrGithub = window.location.href.includes('github.com/bekircansnk/filmsync-watch-party') || 
                            window.location.href.includes('bekircansnk.github.io/filmsync-watch-party') ||
                            (document.title && document.title.includes('Film Partisi 🍿 | Birlikte Film İzleyin'));
  if (window === window.top && isLandingOrGithub) {
    document.documentElement.setAttribute('data-filmsync-installed', 'true');
    window.dispatchEvent(new CustomEvent('filmsync-extension-installed'));

    const urlParams = new URLSearchParams(window.location.search);
    const joinRoom = urlParams.get('join');
    const joinPass = urlParams.get('pass') || '';

    if (joinRoom) {
      showNamePromptModal(joinRoom, (enteredName) => {
        showAutoJoinOverlay(joinRoom);
        
        chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
          const myTabId = tabResponse ? tabResponse.tabId : null;
          
          chrome.storage.local.get(['userId'], (uRes) => {
            const newUserId = (uRes && uRes.userId) ? uRes.userId : ('user_' + Math.random().toString(36).substr(2, 9));
            
            chrome.storage.local.set({ 
              roomId: joinRoom, 
              username: enteredName, 
              password: joinPass, 
              userId: newUserId,
              activeTabId: myTabId,
              lastDispatchTs: Date.now()
            }, () => {
              if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
              const tempDb = firebase.database();
              tempDb.ref(`rooms/${joinRoom}/lastState`).once('value').then((snapshot) => {
                const state = snapshot.val();
                if (state && state.url) {
                  const cleanTargetUrl = normalizeMovieUrl(state.url);
                  setTimeout(() => {
                    chrome.runtime.sendMessage({ type: 'redirect-tab', url: cleanTargetUrl });
                  }, 1000);
                } else {
                  alert('Bu odada aktif bir film izlenmiyor veya oda bulunamadı.');
                  document.getElementById('filmsync-autojoin-overlay')?.remove();
                }
              });
            });
          });
        });
      });
      return;
    }
  }

  // Normal Başlatma
  const processStoredSettings = (myTabId) => {
    chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId', 'hostId', 'hostOnly'], (result) => {
      if (result.roomId) {
        const isWatch = isMovieWatchUrl(window.location.href) || hasVideoOrPlayerFrame();
        // Aktif Sekme İzolasyonu: Farklı sekmelerde mükerrer çalışmayı önle, ancak görünür sekmede veya forceOpenChat durumunda aktif sekmeyi üstlen
        if (result.activeTabId && myTabId !== null && myTabId !== result.activeTabId) {
          if ((isWatch || forceOpenChat) && document.visibilityState === 'visible') {
            Logger.log(`[FilmSync Kurtarma] Film sekmesi aktif sekme olarak üstleniliyor: ${myTabId}`);
            chrome.storage.local.set({ activeTabId: myTabId });
          } else {
            Logger.log(`[FilmSync İzolasyon] Eklenti bu sekmede pasif. Aktif Sekme ID: ${result.activeTabId}, Bu Sekme ID: ${myTabId}`);
            removeChatUI();
            cleanupFirebase();
            return;
          }
        }
        if (!result.activeTabId && myTabId !== null) {
          chrome.storage.local.set({ activeTabId: myTabId });
        }

        roomId = result.roomId;
        username = result.username || 'Anonim';
        password = result.password || '';
        selectedAvatar = result.selectedAvatar || '🍿';
        if (result.hostId) hostId = result.hostId;
        if (result.hostOnly !== undefined) hostOnly = result.hostOnly;
        
        if (result.userId) {
          userId = result.userId;
        } else {
          userId = 'user_' + Math.random().toString(36).substr(2, 9);
          chrome.storage.local.set({ userId });
        }

        document.documentElement.setAttribute('data-filmsync-room-active', 'true');
        syncRoomAttributeToDOM();
        Logger.log(`[FilmSync] Canlı odaya bağlanılıyor: ${roomId}, Kullanıcı: ${username}`);
        
        if (window === window.top) {
          initializeFirebase(firebaseConfig);
          if (shouldShowChatUIInTop() || isWatch || isMovieWatchUrl(window.location.href)) {
            createChatUI();
            if (forceOpenChat) {
              openChatPanelAndFocus(true);
            }
            startUIKeeper();
          } else {
            removeChatUI();
          }
        }
        
        startVideoTracking();
        startDriftCorrection();
        setupFullscreenListener();
        setupFullscreenIdleDetector();
        startIframeFullscreenKeeper();
      } else {
        document.documentElement.setAttribute('data-filmsync-room-active', 'false');
        syncRoomAttributeToDOM();
        removeChatUI();
      }
      
      // Netflix detay sayfaları için buton enjeksiyonunu başlat
      startButtonObserver();
    });
  };

  try {
    chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
      if (chrome.runtime.lastError) {
        processStoredSettings(null);
        return;
      }
      processStoredSettings(tabResponse ? tabResponse.tabId : null);
    });
  } catch (err) {
    processStoredSettings(null);
  }
}

// Sayfa yenilenirken veya kapanırken durum güncellemesi tetikle (REST API üzerinden Service Worker ile çalışır)
let isPageExitHandled = false;
function handlePageExitNotification() {
  if (isPageExitHandled) return;
  if (roomId && isFirebaseInitialized && window === window.top) {
    isPageExitHandled = true;
    removeVideoListeners();

    const hasActiveVideo = !!findBestVideoElement();
    const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                              window.location.href.includes('netflix.com/title') || 
                              window.location.href.includes('youtube.com/feed');
    const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo || hasChildFrameVideo);
    const knownTime = (videoElement && typeof videoElement.currentTime === 'number' && videoElement.currentTime > 0)
      ? videoElement.currentTime
      : (lastIframeVideoTime > 0 ? lastIframeVideoTime : (lastKnownState && typeof lastKnownState.currentTime === 'number' ? lastKnownState.currentTime : -1));
    const currentT = isWatchPage ? knownTime : -1;

    try {
      sessionStorage.setItem(`filmsync_reloading_${roomId}`, JSON.stringify({
        timestamp: Date.now(),
        currentTime: currentT > 0 ? currentT : 0,
        isWatchPage: !!isWatchPage
      }));
    } catch (e) {}

    chrome.runtime.sendMessage({
      type: 'page-unload',
      roomId: roomId,
      username: username,
      userId: userId,
      currentTime: currentT,
      isWatchPage: !!isWatchPage,
      isHost: (!hostOnly || userId === hostId)
    });
  }
}
window.addEventListener('pagehide', handlePageExitNotification);
window.addEventListener('beforeunload', handlePageExitNotification);

// Mesaj payload'ı içerisindeki oda bilgilerini anında yerel state'e uygula
function applyImmediateRoomPayload(message) {
  if (!message || !message.roomId) return;
  if (roomId && roomId !== message.roomId) {
    cleanupFirebase(false);
    isFirebaseInitialized = false;
  }
  roomId = message.roomId;
  if (message.username) username = message.username;
  if (message.userId) userId = message.userId;
  if (message.hostId) hostId = message.hostId;
  if (message.hostOnly !== undefined) hostOnly = message.hostOnly;
  if (message.selectedAvatar) selectedAvatar = message.selectedAvatar;
  document.documentElement.setAttribute('data-filmsync-room-active', 'true');
  syncRoomAttributeToDOM();
}

// Storage ve Popup Mesaj Dinleyicileri
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping-content') {
    sendResponse({
      alive: true,
      roomId: roomId,
      hasUI: !!document.getElementById('filmsync-root'),
      isChatOpen: !!(chatPanel && chatPanel.classList.contains('active'))
    });
    return false;
  } else if (message.type === 'settings-updated') {
    if (message.roomId) {
      applyImmediateRoomPayload(message);
      if (window === window.top && shouldShowChatUIInTop()) {
        initializeFirebase(firebaseConfig);
        createChatUI();
        if (message.forceOpenChat !== false) {
          openChatPanelAndFocus(true);
        }
        startUIKeeper();
      }
    }
    chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'hostId', 'hostOnly'], (res) => {
      if (res.roomId) {
        const roomSwitched = res.roomId !== roomId;
        roomId = res.roomId;
        if (res.username) username = res.username;
        if (res.password !== undefined) password = res.password;
        if (res.userId) userId = res.userId;
        if (res.selectedAvatar) selectedAvatar = res.selectedAvatar;
        if (res.hostId) hostId = res.hostId;
        if (res.hostOnly !== undefined) hostOnly = res.hostOnly;

        if (roomSwitched || !isFirebaseInitialized || (window === window.top && !document.getElementById('filmsync-root'))) {
          init(message.forceOpenChat !== false);
        } else if (window === window.top && shouldShowChatUIInTop()) {
          createChatUI();
          if (message.forceOpenChat !== false) {
            openChatPanelAndFocus(true);
          }
          startUIKeeper();
        }
      } else if (!res.roomId && !message.roomId && roomId) {
        roomId = null;
        document.documentElement.setAttribute('data-filmsync-room-active', 'false');
        syncRoomAttributeToDOM();
        removeChatUI();
        cleanupFirebase(false);
      }
    });
    sendResponse({ status: 'success' });
  } else if (message.type === 'force-sync') {
    if (message.roomId) {
      applyImmediateRoomPayload(message);
    }
    if (!roomId || !isFirebaseInitialized || (window === window.top && !document.getElementById('filmsync-root'))) {
      init(message.forceOpenChat !== false);
    } else if (window === window.top && shouldShowChatUIInTop()) {
      createChatUI();
      if (message.forceOpenChat) {
        openChatPanelAndFocus(true);
      }
      startUIKeeper();
    }
    forceSync();
    sendResponse({ status: 'success' });
  } else if (message.type === 'open-chat-panel') {
    if (message.roomId) {
      applyImmediateRoomPayload(message);
    }
    if (window === window.top) {
      if (!roomId) {
        init(true);
      } else {
        initializeFirebase(firebaseConfig);
        createChatUI();
        openChatPanelAndFocus(true);
        startUIKeeper();
      }
    }
    sendResponse({ status: 'success' });
  } else if (message.type === 'leave-room') {
    document.documentElement.setAttribute('data-filmsync-room-active', 'false');
    syncRoomAttributeToDOM();
    removeChatUI();
    cleanupFirebase(true);
    roomId = null;
    sendResponse({ status: 'success' });
  }
});

// Canlı Depolama Değişikliği Dinleyicisi (Iframe'ler ve Üst Sayfa Eşleşmesi İçin)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (isIgnoredNonPlayerFrame()) return;
    const roomChanged = changes.roomId && (changes.roomId.oldValue !== changes.roomId.newValue);
    const userChanged = changes.userId && (changes.userId.oldValue !== changes.userId.newValue);
    const activeTabChanged = changes.activeTabId && (changes.activeTabId.oldValue !== changes.activeTabId.newValue);
    const dispatchTriggered = !!changes.lastDispatchTs;

    if (roomChanged || userChanged || activeTabChanged || dispatchTriggered) {
      Logger.log('[FilmSync Storage] Depolama değişikliği algılandı, oda ayarları yenileniyor.');
      
      if (roomChanged && changes.roomId.oldValue) {
        cleanupFirebase(false);
        isFirebaseInitialized = false;
      }
      
      const handleStorageUpdate = (myTabId) => {
        chrome.storage.local.get(['roomId', 'username', 'password', 'userId', 'selectedAvatar', 'activeTabId', 'hostId', 'hostOnly'], (result) => {
          if (result.activeTabId && myTabId !== null && myTabId !== result.activeTabId) {
            const isWatch = isMovieWatchUrl(window.location.href) || hasVideoOrPlayerFrame();
            if ((isWatch || dispatchTriggered) && document.visibilityState === 'visible') {
              Logger.log(`[FilmSync Kurtarma Storage] Film sekmesi aktif sekme olarak üstleniliyor: ${myTabId}`);
              chrome.storage.local.set({ activeTabId: myTabId });
            } else {
              Logger.log(`[FilmSync İzolasyon Storage] Eklenti bu sekmede pasif hale getiriliyor.`);
              removeChatUI();
              cleanupFirebase(false);
              return;
            }
          }
          if (!result.activeTabId && myTabId !== null) {
            chrome.storage.local.set({ activeTabId: myTabId });
          }

          roomId = result.roomId;
          username = result.username || 'Anonim';
          password = result.password || '';
          selectedAvatar = result.selectedAvatar || '🍿';
          if (result.hostId) hostId = result.hostId;
          if (result.hostOnly !== undefined) hostOnly = result.hostOnly;
          if (result.userId) userId = result.userId;

          if (roomId) {
            document.documentElement.setAttribute('data-filmsync-room-active', 'true');
            syncRoomAttributeToDOM();
            Logger.log(`[FilmSync Storage] Yeni oda bağlantısı tetikleniyor: ${roomId}`);
            const isWatch = isMovieWatchUrl(window.location.href) || hasVideoOrPlayerFrame();
            if (window === window.top) {
              initializeFirebase(firebaseConfig);
              if (shouldShowChatUIInTop() || isWatch) {
                createChatUI();
                if (roomChanged || dispatchTriggered) {
                  openChatPanelAndFocus(true);
                }
                startUIKeeper();
              } else {
                removeChatUI();
              }
            }
            startVideoTracking();
            startDriftCorrection();
            setupFullscreenListener();
            setupFullscreenIdleDetector();
            startIframeFullscreenKeeper();
            
            if (videoElement) {
              forceSync();
            }
          } else {
            document.documentElement.setAttribute('data-filmsync-room-active', 'false');
            syncRoomAttributeToDOM();
            removeChatUI();
          }
        });
      };

      try {
        chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
          if (chrome.runtime.lastError) {
            handleStorageUpdate(null);
            return;
          }
          handleStorageUpdate(tabResponse ? tabResponse.tabId : null);
        });
      } catch (err) {
        handleStorageUpdate(null);
      }
    }
  }
});

// Sayfa Yenileme (F5 / Cmd+R) Tespit Yardımcıları
function isPageReloadNavigation() {
  try {
    const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0 && navEntries[0].type === 'reload') {
      return true;
    }
    if (performance.navigation && performance.navigation.type === 1) {
      return true;
    }
  } catch (e) {}
  return false;
}

// Firebase SDK Başlatma
function initializeFirebase(config) {
  if (isFirebaseInitialized) return;
  isFirebaseInitialized = true;
  clearStaleFirebaseCache();

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    db = firebase.database();
    
    // Sunucu ve istemci arasındaki saat farkını (clock skew) otomatik düzelt
    db.ref('.info/serverTimeOffset').on('value', (snap) => {
      serverTimeOffset = snap.val() || 0;
    });

    const roomRef = db.ref(`rooms/${roomId}`);
    
    roomRef.once('value').then((snapshot) => {
      const roomData = snapshot.val();
      const hasActiveVideo = !!findBestVideoElement() || hasChildFrameVideo;
      const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                                window.location.href.includes('netflix.com/title') || 
                                window.location.href.includes('youtube.com/feed');
      const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo);
      const hasVideo = hasActiveVideo || isWatchPage;
      const sessionKey = `joined_${roomId}`;
      const wasAlreadyInRoom = (window === window.top) && !!sessionStorage.getItem(sessionKey);
      let reloadMeta = null;
      try {
        const rawReload = sessionStorage.getItem(`filmsync_reloading_${roomId}`);
        if (rawReload) {
          sessionStorage.removeItem(`filmsync_reloading_${roomId}`);
          reloadMeta = JSON.parse(rawReload);
        }
      } catch (e) {}
      const isReloadedInRoom = (window === window.top) && isWatchPage && (
        (reloadMeta && (Date.now() - reloadMeta.timestamp < 25000)) ||
        (wasAlreadyInRoom && isPageReloadNavigation())
      );

      if (isReloadedInRoom) {
        isReloadPauseGuardActive = true;
        reloadPauseGuardUntil = Date.now() + 8000;
        broadcastToAllFrames({ type: 'filmsync-reload-pause-guard', until: reloadPauseGuardUntil });
      }
      
      if (roomData) {
        if (roomData.password && roomData.password !== password) {
          alert('Hatalı oda şifresi girdiniz.');
          removeChatUI();
          cleanupFirebase();
          return;
        }
        
        if ((roomData.hostId === userId || !roomData.hostOnly) && window === window.top && isWatchPage && hasVideo) {
          db.ref(`rooms/${roomId}/lastState`).once('value').then((stateSnap) => {
            const currentState = stateSnap.val();
            if (isReloadedInRoom) {
              const preservedTime = (currentState && typeof currentState.currentTime === 'number' && currentState.currentTime > 0)
                ? currentState.currentTime
                : ((reloadMeta && reloadMeta.currentTime > 0) ? reloadMeta.currentTime : 0);
              db.ref(`rooms/${roomId}/lastState`).update({
                action: 'pause',
                isPlaying: false,
                currentTime: preservedTime,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                senderId: userId
              });
              // Background service worker beforeunload mesajını henüz yazmadıysa veya kaçırdıysa kontrol et ve tamamla
              db.ref(`rooms/${roomId}/messages`).limitToLast(5).once('value').then((msgSnap) => {
                const msgs = msgSnap.val() || {};
                const recentReloadMsg = Object.values(msgs).some(m =>
                  m && m.isSystem && typeof m.message === 'string' &&
                  m.message.includes(username) && m.message.includes('sayfayı yeniledi') &&
                  (Date.now() - (m.timestamp || 0) < 12000)
                );
                if (!recentReloadMsg) {
                  sendSystemMessage(`${username} sayfayı yeniledi, film duraklatıldı.`);
                }
              });
            } else if (currentState && currentState.url && areUrlsSameMovie(currentState.url, window.location.href)) {
              Logger.log('[FilmSync] Mevcut oda film durumu korunuyor:', currentState);
              if (!currentState.pageTitle && getCleanPageTitle()) {
                db.ref(`rooms/${roomId}/lastState`).update({
                  pageTitle: getCleanPageTitle(),
                  platformName: detectPlatformName(window.location.href)
                });
              }
            } else if (roomData.hostId === userId || (!currentState || !currentState.url)) {
              const validUrl = (!isEmbedUrl(window.location.href)) ? normalizeMovieUrl(window.location.href) : (currentState?.url || '');
              if (validUrl) {
                db.ref(`rooms/${roomId}/lastState`).update({
                  url: validUrl,
                  pageTitle: getCleanPageTitle(),
                  platformName: detectPlatformName(validUrl),
                  isPlaying: false,
                  currentTime: 0,
                  lastUpdated: firebase.database.ServerValue.TIMESTAMP,
                  senderId: userId
                });
              }
            }
          });
        }
      } else {
        if (window === window.top) {
          const initialUrl = (hasVideo && isWatchPage && !isEmbedUrl(window.location.href)) ? normalizeMovieUrl(window.location.href) : '';
          roomRef.set({
            password: password,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            hostId: userId,
            hostOnly: false,
            lastState: {
              isPlaying: false,
              currentTime: 0,
              url: initialUrl,
              pageTitle: getCleanPageTitle(),
              platformName: detectPlatformName(initialUrl || window.location.href),
              lastUpdated: firebase.database.ServerValue.TIMESTAMP
            }
          });
        }
      }
      
      const userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.set({ username, lastActive: firebase.database.ServerValue.TIMESTAMP, isBuffering: false, avatar: selectedAvatar });
      userRef.onDisconnect().remove();
      startHeartbeat(userRef);
      
      if (window === window.top && !sessionStorage.getItem(sessionKey)) {
        sendSystemMessage(`${username} odaya katıldı.`);
        sessionStorage.setItem(sessionKey, 'true');
      }
      
      setupFirebaseListeners();
      forceSync();
      setTimeout(() => {
        isFirstSync = false;
        Logger.log('[FilmSync] İlk senkronizasyon kilidi zaman aşımıyla kaldırıldı.');
      }, 1500);
    }).catch(err => {
      Logger.error('[FilmSync] Firebase bağlantı hatası:', err);
    });

  } catch (err) {
    Logger.error('[FilmSync] Firebase başlatılamadı:', err);
  }
}

// Firebase Olay Dinleyicileri
function setupFirebaseListeners() {
  if (!db) return;

  // Mükerrer WebSocket dinleyicilerini ve bellek/CPU sızıntısını önlemek için mevcut dinleyicileri temizle
  db.ref(`rooms/${roomId}/hostId`).off();
  db.ref(`rooms/${roomId}/hostOnly`).off();
  db.ref(`rooms/${roomId}/lastState`).off();
  db.ref(`rooms/${roomId}/messages`).off();
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).off();
  db.ref(`rooms/${roomId}/users`).off();
  db.ref(`rooms/${roomId}/reactions`).off();
  db.ref(`rooms/${roomId}/reactions`).limitToLast(5).off();

  db.ref(`rooms/${roomId}/hostId`).on('value', (snap) => {
    hostId = snap.val();
    if (hostId) chrome.storage.local.set({ hostId });
  });
  db.ref(`rooms/${roomId}/hostOnly`).on('value', (snap) => {
    hostOnly = !!snap.val();
  });

  // 1. Medya Durumunu Dinle
  db.ref(`rooms/${roomId}/lastState`).on('value', (snapshot) => {
    const state = snapshot.val();
    if (!state) return;
    lastKnownState = state;
    updateRoomInfoBar( null, state );
    if (state.senderId === userId) return;

    if (isSyncing) {
      pendingState = state;
      return;
    }

    applyRemoteState(state);
  });

  // 2. Sohbet Mesajlarını Dinle
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).off();
  db.ref(`rooms/${roomId}/messages`).limitToLast(50).on('child_added', (snapshot) => {
    const msg = snapshot.val();
    const key = snapshot.key;
    if (!msg || renderedMessageKeys.has(key)) return;
    renderedMessageKeys.add(key);

    appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });

    const msgAge = Date.now() - (msg.timestamp || 0);
    const isPanelActive = chatPanel && chatPanel.classList.contains('active');
    const isPanelHidden = chatPanel && (chatPanel.style.opacity === '0' || !isPanelActive);
    const isSelfNormalChat = !msg.isSystem && msg.username === username;
    const isSelfSystemJoinMsg = msg.isSystem && msg.message && typeof msg.message === 'string' && msg.message.startsWith(username) && msg.message.includes('odaya katıldı');

    if (msgAge < 10000 && !isSelfNormalChat && !isSelfSystemJoinMsg) {
      if (!msg.isSystem) {
        soundEffects.playMessageBubble();
      }
      if (!isPanelActive || isPanelHidden) {
        showNotificationToast(msg.isSystem ? 'Film Partisi 🍿' : msg.username, msg.message);
      }
    }
  });

  // 3. Aktif Kullanıcıları ve Buffering Durumlarını Dinle
  db.ref(`rooms/${roomId}/users`).on('value', (snapshot) => {
    const usersData = snapshot.val();
    const usersList = [];
    const bufferingUsers = [];

    if (usersData) {
      Object.values(usersData).forEach(u => {
        if (u && u.username) {
          usersList.push(u);
          if (u.isBuffering) bufferingUsers.push(u.username);
        }
      });
    }
    updateUsersDisplay(usersList);
    updateRoomInfoBar(usersList, lastKnownState);

    const bufferIndicator = document.getElementById('filmsyncBufferingIndicator');
    const bufferText = document.getElementById('filmsyncBufferingText');
    if (bufferIndicator && bufferText) {
      if (bufferingUsers.length > 0) {
        bufferIndicator.classList.add('active');
        bufferText.textContent = `${bufferingUsers.join(', ')} yükleniyor...`;
      } else {
        bufferIndicator.classList.remove('active');
      }
    }
  });

  // 4. Reaksiyon Emojilerini Dinle
  db.ref(`rooms/${roomId}/reactions`).limitToLast(5).on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    if (Date.now() - data.timestamp < 5000) {
      spawnFlyingEmoji(data.emoji);
      if (data.senderId !== userId) {
        soundEffects.playReactionChord();
      }
    }
  });
}

// Video elementinin ve platform API'sinin hazır olup olmadığını sorgulayan ve bekleyen mekanizma
function ensureVideoReady(callback, retriesLeft = 25) {
  const activeVideo = findBestVideoElement();
  const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                            window.location.href.includes('netflix.com/title') || 
                            window.location.href.includes('youtube.com/feed');
  if (isBrowseExclusion || (!isMovieWatchUrl(window.location.href) && !activeVideo)) {
    callback(false);
    return;
  }

  if (activeVideo) videoElement = activeVideo;

  if (PlayerAdapter.isNetflix()) {
    if (videoElement && videoElement.readyState >= 2 && isPlatformPlayerReady) {
      callback(true);
      return;
    }
    window.postMessage({ source: 'filmsync-content', action: 'ping-player' }, '*');
    if (retriesLeft > 0) {
      Logger.log(`[FilmSync] Netflix oynatıcısının hazır olması bekleniyor... Kalan deneme: ${retriesLeft}`);
      setTimeout(() => {
        ensureVideoReady(callback, retriesLeft - 1);
      }, 300);
      return;
    }
    if (videoElement && videoElement.readyState >= 2) {
      Logger.log('[FilmSync] Netflix API zaman aşımı, video elementiyle devam ediliyor.');
      callback(true);
    } else {
      Logger.log('[FilmSync] Video elementi zaman aşımına uğradı veya henüz hazır değil.');
      callback(false);
    }
    return;
  }

  if (videoElement && videoElement.readyState >= 1) {
    callback(true);
  } else if (retriesLeft > 0) {
    setTimeout(() => {
      ensureVideoReady(callback, retriesLeft - 1);
    }, 400);
  } else {
    callback(false);
  }
}

// Programatik Senkronizasyon Tamamlayıcı
function finishProgrammaticSync() {
  if (syncSafetyTimer) {
    clearTimeout(syncSafetyTimer);
    syncSafetyTimer = null;
  }
  isSyncing = false;
  isProgrammaticSeeking = false;
  isFirstSync = false;

  if (pendingState) {
    const nextState = pendingState;
    pendingState = null;
    if (nextState.action === 'seek' || nextState.action === 'play' || nextState.action === 'pause') {
      applyRemoteState(nextState);
    }
  }
}

// Programatik Senkronizasyon Yürütücü (Kilit & Döngü Korumalı)
function executeProgrammaticSync(targetSeconds, syncAction) {
  isSyncing = true;
  isProgrammaticSeeking = true;
  lastProgrammaticSeekTime = targetSeconds;
  lastProgrammaticSeekTimestamp = Date.now();

  if (syncSafetyTimer) clearTimeout(syncSafetyTimer);

  try {
    syncAction();
  } catch (err) {
    Logger.error('[FilmSync] Senkronizasyon çalıştırma hatası:', err);
  }

  syncSafetyTimer = setTimeout(() => {
    finishProgrammaticSync();
  }, 2500);
}

// Uzak Durumu Videoya Uygula
function applyRemoteState(state) {
  if (!state) return;
  lastKnownState = state;
  
  // Yönlendirme bildirimi (Sadece video adresi gerçekten farklı bir filme/bölüme aitse ve üst penceredeysek)
  // 1. Oda sahibi (host) kesinlikle yönlendirilmez ve bildirim görmez (Host serbestçe gezinir)
  // 2. Durumu güncelleyen kişi (senderId) kesinlikle yönlendirilmez
  const isHost = (userId && hostId && userId === hostId) || (!hostOnly && !hostId);
  const isSender = (state.senderId && state.senderId === userId);
  if (!isHost && !isSender && state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
    if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
      showMovieRedirectNotification(state.url, state.pageTitle);
      return;
    }
  }

  ensureVideoReady((isReady) => {
    if (!isReady || !videoElement) return;

    // Video buffering veya seeking halindeyse hard seek yapıp CDN buffer'ı tekrar çökertme
    if (videoElement.seeking || videoElement.readyState < 2) {
      Logger.log('[FilmSync] Video buffering/seeking durumunda, eşitleme sıraya alınıyor.');
      pendingState = state;
      let playableTimer = null;
      const onVideoPlayable = () => {
        if (playableTimer) clearTimeout(playableTimer);
        if (!videoElement) return;
        videoElement.removeEventListener('canplay', onVideoPlayable);
        videoElement.removeEventListener('loadeddata', onVideoPlayable);
        if (pendingState) {
          const s = pendingState;
          pendingState = null;
          applyRemoteState(s);
        }
      };
      videoElement.addEventListener('canplay', onVideoPlayable, { once: true });
      videoElement.addEventListener('loadeddata', onVideoPlayable, { once: true });
      playableTimer = setTimeout(onVideoPlayable, 2000);
      return;
    }

    const now = getEstimatedServerTime();
    const timeDiff = state.isPlaying ? Math.max(0, (now - (state.lastUpdated || now)) / 1000) : 0;
    const targetTime = state.currentTime + timeDiff;
    const drift = Math.abs(videoElement.currentTime - targetTime);

    const needsPlay = state.isPlaying && videoElement.paused;
    const needsPause = !state.isPlaying && !videoElement.paused;

    // 1. AÇIK BİR KULLANICI SEEK'İ (action === 'seek')
    if (state.action === 'seek') {
      executeProgrammaticSync(targetTime, () => {
        PlayerAdapter.seek(targetTime);
        if (state.isPlaying && videoElement.paused) PlayerAdapter.play();
        else if (!state.isPlaying && !videoElement.paused) PlayerAdapter.pause();
      });
      return;
    }

    // 2. PLAY EMRİ GELDİ (DURAKLATILMIŞTI, BAŞLATILIYOR)
    if (needsPlay) {
      if (drift > 4.5) {
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
          PlayerAdapter.play();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.play();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 3. PAUSE EMRİ GELDİ (OYNATILIYORDU, DURDURULUYOR)
    if (needsPause) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
          PlayerAdapter.pause();
        });
      } else {
        isSyncing = true;
        PlayerAdapter.pause();
        setTimeout(() => { isSyncing = false; }, 800);
      }
      return;
    }

    // 4. NORMAL OYNATMA SIRASINDA DURUM (Her iki taraf da oynatıyor)
    if (state.isPlaying && !videoElement.paused) {
      if (drift > 6.5) {
        Logger.log(`[FilmSync] Büyük sapma (${drift.toFixed(1)}s), hard seek ile yetişiliyor.`);
        executeProgrammaticSync(targetTime, () => {
          PlayerAdapter.seek(targetTime);
        });
        return;
      }

      // Dinamik sapma toleransı: Yüksek gecikmeli durumlarda toleransı artır (max 4.0s),
      // normal durumlarda daha sıkı tut (min 1.5s).
      const networkLatency = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt / 1000 : 0.5;
      const dynamicThreshold = Math.max(1.5, Math.min(4.0, 2.0 + networkLatency));

      if (drift <= dynamicThreshold) {
        if (!PlayerAdapter.isNetflix() && videoElement.playbackRate !== 1.0) {
          try { videoElement.playbackRate = 1.0; } catch (e) {}
        }
        return;
      }

      if (!PlayerAdapter.isNetflix()) {
        const rateFactor = 0.03;
        try {
          videoElement.playbackRate = (videoElement.currentTime < targetTime)
            ? (1.0 + rateFactor)
            : Math.max(0.95, 1.0 - rateFactor);
        } catch (e) {}
      }
      return;
    }

    // 5. HER İKİ TARAF DA DURAKLATILMIŞ DURUMDA
    if (!state.isPlaying && videoElement.paused) {
      if (drift > 0.8) {
        executeProgrammaticSync(state.currentTime, () => {
          PlayerAdapter.seek(state.currentTime);
        });
      }
    }
  });
}

// Zorla Senkronize Et (Debounce korumalı ve akıllı eşitleme)
function forceSync() {
  if (forceSyncDebounceTimer) clearTimeout(forceSyncDebounceTimer);
  forceSyncDebounceTimer = setTimeout(() => {
    executeForceSync();
  }, 100);
}

function executeForceSync() {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/lastState`).once('value').then((snapshot) => {
    const state = snapshot.val();
    if (!state) return;
    lastKnownState = state;

    const isHost = (userId && hostId && userId === hostId) || (!hostOnly && !hostId);
    const isSender = (state.senderId && state.senderId === userId);
    if (!isHost && !isSender && state.url && !areUrlsSameMovie(window.location.href, state.url) && window === window.top) {
      if (!isEmbedUrl(state.url) && window.filmsyncDismissedUrl !== state.url) {
        showMovieRedirectNotification(state.url, state.pageTitle);
        return;
      }
    }

    ensureVideoReady((isReady) => {
      if (!isReady || !videoElement) {
        isFirstSync = false;
        return;
      }

      // Oda sahibi isek ve video zaten ilerlemişse (> 5s) yerel konumu koru;
      // Ancak TR Dublaj / TR Altyazı kaynak değişimi nedeniyle yeni iframe 0. saniyeden başladıysa ve odada > 5s süre varsa odaya senkronize ol!
      if (userId === hostId && videoElement.currentTime > 5 && (!state.currentTime || Math.abs(videoElement.currentTime - state.currentTime) < 10)) {
        Logger.log('[FilmSync] Host için forceSync atlandı, yerel oynatma konumu korunuyor.');
        isFirstSync = false;
        return;
      }

      applyRemoteState(state);
      isFirstSync = false;
    });
  });
}

// Bağlantı Temizleme
function cleanupFirebase(isExplicitLeave = false) {
  if (videoTrackingInterval) { clearInterval(videoTrackingInterval); videoTrackingInterval = null; }
  if (driftCorrectionInterval) { clearInterval(driftCorrectionInterval); driftCorrectionInterval = null; }
  if (uiKeeperInterval) { clearInterval(uiKeeperInterval); uiKeeperInterval = null; }
  if (iframeKeeperInterval) { clearInterval(iframeKeeperInterval); iframeKeeperInterval = null; }
  if (netflixButtonObserver) { netflixButtonObserver.disconnect(); netflixButtonObserver = null; }
  if (netflixButtonDebounceTimer) { clearTimeout(netflixButtonDebounceTimer); netflixButtonDebounceTimer = null; }
  if (bufferingDebounceTimer) { clearTimeout(bufferingDebounceTimer); bufferingDebounceTimer = null; }
  if (userSeekDebounceTimer) { clearTimeout(userSeekDebounceTimer); userSeekDebounceTimer = null; }
  if (syncSafetyTimer) { clearTimeout(syncSafetyTimer); syncSafetyTimer = null; }
  if (forceSyncDebounceTimer) { clearTimeout(forceSyncDebounceTimer); forceSyncDebounceTimer = null; }
  stopHeartbeat();
  isProgrammaticSeeking = false;

  if (db && roomId && userId) {
    if (window === window.top && isExplicitLeave) {
      sendSystemMessage(`${username} odadan ayrıldı.`);
    }
    
    if (isExplicitLeave) {
      db.ref(`rooms/${roomId}/users/${userId}`).remove().then(() => {
        db.ref(`rooms/${roomId}/users`).once('value').then((snapshot) => {
          const users = snapshot.val();
          if (!users || Object.keys(users).length === 0) {
            db.ref(`rooms/${roomId}`).remove();
          }
        });
      });
    }

    db.ref(`rooms/${roomId}/lastState`).off();
    db.ref(`rooms/${roomId}/messages`).off();
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).off();
    db.ref(`rooms/${roomId}/users`).off();
    db.ref(`rooms/${roomId}/reactions`).off();
    db.ref(`rooms/${roomId}/reactions`).limitToLast(5).off();
    db.ref('.info/serverTimeOffset').off();
    
    renderedMessageKeys.clear();
  }
}

// Medya Olayını Gönderme
function sendMediaEvent(isPlaying, currentTime, action = 'event') {
  if (isSyncing) return;

  // Eğer alt iframe içindeysek ve CSP / üçüncü parti çerez kısıtlaması nedeniyle db veya roomId henüz hazır değilse,
  // medya olayını (seek, play, pause) doğrudan üst pencereye (window.top) röle et!
  if ((!db || !roomId) && window !== window.top) {
    try {
      window.top.postMessage({
        type: 'filmsync-iframe-media-event',
        isPlaying,
        currentTime,
        action
      }, '*');
    } catch (e) {}
    return;
  }
  if (!db || !roomId) return;
  
  // Sadece host kontrolü aktifse ve ben host değilsem engelle
  if (hostOnly && userId !== hostId) {
    Logger.log('[FilmSync] Medya kontrolü engellendi: Sadece oda sahibi kontrol edebilir.');
    // Misafir yetkisiz işlem yaptığında videoyu oda durumuna geri döndür
    if (lastKnownState) {
      setTimeout(() => applyRemoteState(lastKnownState), 200);
    }
    return;
  }

  const hasActiveVideo = !!findBestVideoElement() || hasChildFrameVideo;
  const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                            window.location.href.includes('netflix.com/title') || 
                            window.location.href.includes('youtube.com/feed');
  if (isBrowseExclusion || (!isMovieWatchUrl(window.location.href) && !hasActiveVideo)) {
    Logger.log('[FilmSync] Video izleme sayfası olmayan sayfadan medya olayı gönderilmesi engellendi.');
    return;
  }

  const activeVideo = videoElement || findBestVideoElement();
  // Seek eyleminde readyState < 1 olsa bile (kullanıcı henüz yüklenen noktanın ilerisine sardığında) olayı engelleme!
  if (action !== 'seek' && activeVideo && (activeVideo.readyState < 1 || isNaN(activeVideo.duration) || activeVideo.duration === 0)) {
    Logger.log('[FilmSync] Video henüz hazır değil, medya olayı atlanıyor.');
    return;
  }

  // Yeni açılan oynatıcı veya TR Dublaj/Altyazı kaynak değişimi sırasında 0. saniyedeki otomatik pause/play olayının
  // odadaki ilerlemiş süreyi (> 5s) sıfırlamasını engelle!
  if (isFirstSync && currentTime < 2.0 && lastKnownState && lastKnownState.currentTime > 5.0 && action !== 'seek') {
    Logger.log('[FilmSync] İlk yüklemede 0s sıfırlaması engellendi, mevcut oda süresine senkronize ediliyor.');
    applyRemoteState(lastKnownState);
    return;
  }
  isFirstSync = false;

  if (PlayerAdapter.isNetflix() && !isPlatformPlayerReady) {
    return;
  }

  const updatePayload = {
    action,
    isPlaying,
    currentTime,
    senderId: userId,
    lastUpdated: firebase.database.ServerValue.TIMESTAMP
  };

  // URL güncellemesi: Oda sahibi veya serbest modda (!hostOnly) katılımcı ana pencerede izliyorsa URL ve başlığı günceller
  if ((userId === hostId || !hostOnly) && window === window.top && (isMovieWatchUrl(window.location.href) || hasActiveVideo) && !isEmbedUrl(window.location.href) && !isBrowseExclusion) {
    updatePayload.url = normalizeMovieUrl(window.location.href);
    const title = getCleanPageTitle();
    if (title) updatePayload.pageTitle = title;
    updatePayload.platformName = detectPlatformName(window.location.href);
  } else if ((userId === hostId || !hostOnly) && window !== window.top) {
    // Oynatıcı bir iframe içindeyse (Dizipal, HDFilmCehennemi, FullHDFilmizlesene vb.),
    // ana pencereye sinyal göndererek ana sayfa URL'sinin ve başlığının Firebase'e yazılmasını sağla!
    try {
      window.top.postMessage({ type: 'filmsync-iframe-sync-top-url' }, '*');
    } catch (e) {}
  }

  const formattedTime = formatTime(currentTime);
  const now = Date.now();
  let msgText = null;

  if (action === 'pause') {
    if (lastSentPlayPauseAction !== 'pause' || (now - lastSentPlayPauseTimestamp > 2000)) {
      msgText = `${username} filmi duraklattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'pause';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'play') {
    const isRightAfterSeek = (now - lastSentSeekTimestamp) < 1000;
    if (!isRightAfterSeek && (lastSentPlayPauseAction !== 'play' || (now - lastSentPlayPauseTimestamp > 2000))) {
      msgText = `${username} filmi başlattı (${formattedTime}).`;
      lastSentPlayPauseAction = 'play';
      lastSentPlayPauseTimestamp = now;
    }
  } else if (action === 'seek') {
    const timeDiff = Math.abs(currentTime - lastSentSeekTime);
    if (timeDiff >= 1.0 || (now - lastSentSeekTimestamp > 1500)) {
      msgText = `${username} ${formattedTime} süresine atladı.`;
      lastSentSeekTime = currentTime;
      lastSentSeekTimestamp = now;
    }
  }

  if (msgText) {
    sendSystemMessage(msgText);
  }

  db.ref(`rooms/${roomId}/lastState`).update(updatePayload).catch(err => Logger.error('[FilmSync] Medya durum yazma hatası:', err));
}

// Videolu Sayfalarda UI ve SPA Geçiş Motoru
function startVideoTracking() {
  if (videoTrackingInterval) clearInterval(videoTrackingInterval);

  let iframeEmptyScanCount = 0;

  videoTrackingInterval = setInterval(() => {
    // Arka plandaki gizli sekmelerde gereksiz DOM taraması yapıp MacBook M4 işlemcisini yorma
    if (document.hidden && videoElement) return;

    // Alt iframelerde (reklam, analitik, boş çerçeveler) 8 deneme sonunda video yoksa ve embed URL değilse döngüyü sonlandır
    if (window !== window.top && !videoElement) {
      iframeEmptyScanCount++;
      if (iframeEmptyScanCount > 8 && !isEmbedUrl(window.location.href) && !isMovieWatchUrl(window.location.href)) {
        clearInterval(videoTrackingInterval);
        videoTrackingInterval = null;
        return;
      }
    }

    // SPA URL Değişimi Kontrolü (YouTube, Netflix, Prime Video, Dizipal bölüm geçişleri vb.)
    if (window.location.href !== lastTrackedLocationHref) {
      const oldHref = lastTrackedLocationHref;
      lastTrackedLocationHref = window.location.href;
      Logger.log('[FilmSync] SPA URL değişimi tespit edildi:', lastTrackedLocationHref);
      if (PlayerAdapter.isNetflix()) {
        isPlatformPlayerReady = false;
        window.postMessage({ source: 'filmsync-content', action: 'ping-player' }, '*');
      }
      // Eğer kullanıcı aktif odadayken yeni bir bölüme/videoya geçtiyse ve yetkiliyse (host veya !hostOnly)
      if (window === window.top && db && roomId && (userId === hostId || !hostOnly)) {
        const isBrowseExclusion = lastTrackedLocationHref.includes('netflix.com/browse') || 
                                  lastTrackedLocationHref.includes('netflix.com/title') || 
                                  lastTrackedLocationHref.includes('youtube.com/feed');
        if (!isBrowseExclusion && isMovieWatchUrl(lastTrackedLocationHref) && !isEmbedUrl(lastTrackedLocationHref)) {
          const cleanNewUrl = normalizeMovieUrl(lastTrackedLocationHref);
          if (!areUrlsSameMovie(oldHref, cleanNewUrl)) {
            setTimeout(() => {
              const title = getCleanPageTitle();
              db.ref(`rooms/${roomId}/lastState`).update({
                url: cleanNewUrl,
                pageTitle: title,
                platformName: detectPlatformName(cleanNewUrl),
                currentTime: 0,
                isPlaying: true,
                action: 'url_change',
                senderId: userId,
                lastUpdated: firebase.database.ServerValue.TIMESTAMP
              });
              sendSystemMessage(`${username} yeni bölüme/videoya geçti${title ? ': ' + title : '.'}`);
            }, 600);
          }
        }
      }
    }

    // Eğer videoElement zaten bulunduysa ve DOM içinde hala aktif/geçerliyse, her saniye tüm DOM/ShadowDOM ağacını yeniden tarama! (M4 CPU Optimizasyonu)
    let bestVideo = null;
    if (videoElement && videoElement.isConnected && (videoElement.readyState >= 1 || videoElement.src || videoElement.currentSrc)) {
      bestVideo = videoElement;
    } else {
      bestVideo = findBestVideoElement();
    }

    const hasActiveVideo = !!bestVideo;
    const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                              window.location.href.includes('netflix.com/title') || 
                              window.location.href.includes('youtube.com/feed');
    const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasActiveVideo || hasChildFrameVideo);

    // Ana pencerede oda aktifse sohbet baloncuğu her zaman hazır olmalı;
    // Yalnızca davet/arama sayfalarında baloncuğu temizle!
    if (window === window.top && roomId) {
      if ((shouldShowChatUIInTop() || isWatchPage) && !document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
      } else if (!shouldShowChatUIInTop() && !isWatchPage && document.getElementById('filmsync-root')) {
        removeChatUI();
      }
    }

    if (!isWatchPage) {
      if (videoElement) {
        removeVideoListeners();
        videoElement = null;
      }
      return;
    }

    if (bestVideo && bestVideo !== videoElement) {
      removeVideoListeners();
      videoElement = bestVideo;
      lastTrustedMuted = videoElement.muted;
      lastTrustedVolume = videoElement.volume;
      lastTrackedVideoTime = typeof videoElement.currentTime === 'number' ? videoElement.currentTime : -1;
      lastTrackedVideoTimestamp = Date.now();
      setupVideoListeners();
      
      Logger.log('[FilmSync] Yeni video elementi tespit edildi.');

      // Sayfa yenilendiyse ve otomatik oynatma koruması aktifse videoyu anında duraklat
      if (isReloadPauseGuardActive && Date.now() < reloadPauseGuardUntil) {
        PlayerAdapter.pause();
      }

      // Eğer iframe içindeysek ana pencereye "bu sayfada aktif video var" sinyali gönder
      if (window !== window.top) {
        try {
          window.top.postMessage({
            type: 'filmsync-iframe-has-video',
            frameUrl: window.location.href,
            currentTime: videoElement.currentTime || 0
          }, '*');
        } catch (e) {}
      }

      ensureVideoReady((ready) => {
        if (ready) forceSync();
      });

      if (!document.getElementById('filmsync-root') && window === window.top) {
        createChatUI();
        startUIKeeper();
      }
      
      if (window !== window.top) {
        initializeFirebase(firebaseConfig);
      }
    }
  }, 1500);
}

// Akıllı Eşitleme ve Sağlık Denetleyicisi (Heartbeat & Soft Auto-Sync)
function startDriftCorrection() {
  if (driftCorrectionInterval) clearInterval(driftCorrectionInterval);

  driftCorrectionInterval = setInterval(() => {
    if (!db || !roomId || !videoElement || isSyncing || isProgrammaticSeeking) return;
    if (videoElement.readyState < 3 || videoElement.seeking) return;

    // Oda sahibi (veya serbest modda aktif oynatıcı) durumu periyodik günceller
    if (userId === hostId) {
      if (!videoElement.paused) {
        db.ref(`rooms/${roomId}/lastState`).update({
          action: 'heartbeat',
          isPlaying: true,
          currentTime: videoElement.currentTime,
          senderId: userId,
          lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });
      }
      return;
    }

    // Oda üyesi isek (host değilsek), mevcut oynatıcı durumunu lastKnownState ile karşılaştır.
    // Toleransı (threshold) ağ gecikmesine göre dinamik olarak hesapla.
    if (lastKnownState && lastKnownState.isPlaying) {
      const now = getEstimatedServerTime();
      const timeDiff = Math.max(0, (now - (lastKnownState.lastUpdated || now)) / 1000);
      const targetTime = lastKnownState.currentTime + timeDiff;
      const drift = Math.abs(videoElement.currentTime - targetTime);

      const networkLatency = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.rtt ? navigator.connection.rtt / 1000 : 0.5;
      const dynamicThreshold = Math.max(1.5, Math.min(4.0, 2.5 + networkLatency)); // Default was approx 2.5s conceptually, now dynamic

      if (drift > dynamicThreshold) {
        console.log(`[FilmSync] Auto-Sync tetiklendi, sapma: ${drift.toFixed(1)}s, eşik: ${dynamicThreshold.toFixed(1)}s`);
        forceSync();
      } else if (lastKnownState.isPlaying && videoElement.paused) {
        // Play state mismatch
        forceSync();
      }
    } else if (lastKnownState && !lastKnownState.isPlaying && !videoElement.paused) {
       forceSync();
    }
  }, 5000);
}

function setupVideoListeners() {
  if (!videoElement) return;
  videoElement.addEventListener('play', handlePlayEvent);
  videoElement.addEventListener('pause', handlePauseEvent);
  videoElement.addEventListener('seeking', handleSeekingEvent);
  videoElement.addEventListener('seeked', handleSeekEvent);
  videoElement.addEventListener('timeupdate', handleTimeUpdateEvent);
  videoElement.addEventListener('waiting', handleWaitingEvent);
  videoElement.addEventListener('playing', handlePlayingEvent);
  videoElement.addEventListener('volumechange', handleVolumeChangeGuard);
}

function removeVideoListeners() {
  if (!videoElement) return;
  videoElement.removeEventListener('play', handlePlayEvent);
  videoElement.removeEventListener('pause', handlePauseEvent);
  videoElement.removeEventListener('seeking', handleSeekingEvent);
  videoElement.removeEventListener('seeked', handleSeekEvent);
  videoElement.removeEventListener('timeupdate', handleTimeUpdateEvent);
  videoElement.removeEventListener('waiting', handleWaitingEvent);
  videoElement.removeEventListener('playing', handlePlayingEvent);
  videoElement.removeEventListener('volumechange', handleVolumeChangeGuard);
}

// 🛡️ KATMAN 3: M Tuşu / Klavye ile İstenmeyen Ses Kısılmasını 0ms'de Geri Alan Zırh
function handleVolumeChangeGuard() {
  if (!videoElement) return;
  const now = Date.now();
  // Eğer son 350ms içinde kullanıcı klavyede sohbete bir tuş (M, aşağı ok vb.) bastıysa
  // ve oynatıcı bunu yakalayıp sesi kıstıysa (muted) veya ses seviyesini değiştirdiyse derhal geri al!
  if (now - lastBlockedKeyTimestamp < 350) {
    if (videoElement.muted !== lastTrustedMuted) {
      videoElement.muted = lastTrustedMuted;
    }
    if (Math.abs(videoElement.volume - lastTrustedVolume) > 0.01) {
      videoElement.volume = lastTrustedVolume;
    }
    return;
  }
  // Kullanıcı fareyle ses çubuğundan değiştirdiyse güvenilir değeri güncelle
  lastTrustedMuted = videoElement.muted;
  lastTrustedVolume = videoElement.volume;
}

function scheduleUserSeekEvent(targetSeconds, delayMs = 220) {
  if (userSeekDebounceTimer) clearTimeout(userSeekDebounceTimer);
  userSeekDebounceTimer = setTimeout(() => {
    if (!videoElement) return;
    const finalTime = typeof videoElement.currentTime === 'number' ? videoElement.currentTime : targetSeconds;
    lastTrackedVideoTime = finalTime;
    lastTrackedVideoTimestamp = Date.now();
    sendMediaEvent(!videoElement.paused, finalTime, 'seek');
  }, delayMs);
}

function handleSeekingEvent() {
  if (!videoElement) return;
  const timeSinceProgrammatic = Date.now() - lastProgrammaticSeekTimestamp;
  const isCloseToTarget = Math.abs(videoElement.currentTime - lastProgrammaticSeekTime) < 1.8;
  if (isSyncing || isProgrammaticSeeking || (timeSinceProgrammatic < 1600 && isCloseToTarget)) {
    return;
  }
  lastSeekActivityTimestamp = Date.now();
  scheduleUserSeekEvent(videoElement.currentTime, 300);
}

function handlePlayEvent(e) {
  if (isReloadPauseGuardActive && Date.now() < reloadPauseGuardUntil) {
    Logger.log('[FilmSync] Sayfa yenileme sonrası otomatik oynatma (autoplay); engellendi, film duraklatıldı.');
    isReloadPauseGuardActive = false;
    PlayerAdapter.pause();
    return;
  }
  if (isSyncing || isProgrammaticSeeking) return;
  if (videoElement && videoElement.seeking) return;
  if (Date.now() - lastSeekActivityTimestamp < 800) return;

  sendMediaEvent(true, videoElement.currentTime, 'play');
}

function handlePauseEvent(e) {
  if (isSyncing || isProgrammaticSeeking) return;
  if (videoElement && videoElement.seeking) return;
  if (Date.now() - lastSeekActivityTimestamp < 800) return;

  sendMediaEvent(false, videoElement.currentTime, 'pause');
}

function handleSeekEvent(e) {
  if (!videoElement) return;
  const timeSinceProgrammatic = Date.now() - lastProgrammaticSeekTimestamp;
  const isCloseToTarget = Math.abs(videoElement.currentTime - lastProgrammaticSeekTime) < 1.8;

  if (isSyncing || isProgrammaticSeeking || (timeSinceProgrammatic < 1600 && isCloseToTarget)) {
    Logger.log('[FilmSync] Programatik seek olayı yutuldu, döngü engellendi.');
    lastTrackedVideoTime = videoElement.currentTime;
    lastTrackedVideoTimestamp = Date.now();
    if (isProgrammaticSeeking) {
      setTimeout(() => {
        finishProgrammaticSync();
      }, 600);
    }
    return;
  }

  lastSeekActivityTimestamp = Date.now();
  scheduleUserSeekEvent(videoElement.currentTime, 180);
}

// Özel oynatıcılarda (Netflix, YouTube, JWPlayer, Vidmoly vb.) seeked olayı yutulsa bile
// ani süre sıçramalarını (> 3.5 sn) yakalayan ve iframe süresini üst pencereye bildiren dinleyici
function handleTimeUpdateEvent() {
  if (!videoElement) return;
  const now = Date.now();
  const cur = videoElement.currentTime;
  if (typeof cur !== 'number' || isNaN(cur)) return;

  // Iframe içindeysek her 2 saniyede bir üst pencereye güncel süreyi bildir (Sayfa yenilenirse son süre bilinsin)
  if (window !== window.top && (now - lastIframeTimePostTimestamp > 2000)) {
    lastIframeTimePostTimestamp = now;
    try {
      window.top.postMessage({
        type: 'filmsync-iframe-time-sync',
        currentTime: cur
      }, '*');
    } catch (e) {}
  }

  if (lastTrackedVideoTime >= 0 && lastTrackedVideoTimestamp > 0) {
    const wallElapsed = Math.max(0, (now - lastTrackedVideoTimestamp) / 1000);
    const mediaDelta = Math.abs(cur - lastTrackedVideoTime);
    const unexpectedJump = Math.abs(mediaDelta - wallElapsed);
    const timeSinceProgrammatic = now - lastProgrammaticSeekTimestamp;
    const isCloseToProgrammatic = Math.abs(cur - lastProgrammaticSeekTime) < 2.2;

    if (
      unexpectedJump > 3.5 &&
      !isSyncing &&
      !isProgrammaticSeeking &&
      ! isFirstSync &&
      !(timeSinceProgrammatic < 2200 && isCloseToProgrammatic) &&
      (now - lastSeekActivityTimestamp > 900)
    ) {
      lastSeekActivityTimestamp = now;
      scheduleUserSeekEvent(cur, 200);
    }
  }

  lastTrackedVideoTime = cur;
  lastTrackedVideoTimestamp = now;
}

function handleWaitingEvent() {
  if (!db || !roomId || !userId) return;
  if (bufferingDebounceTimer) clearTimeout(bufferingDebounceTimer);
  bufferingDebounceTimer = setTimeout(() => {
    if (!currentBufferingState) {
      currentBufferingState = true;
      db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: true });
    }
  }, 500);
}

function handlePlayingEvent() {
  if (!db || !roomId || !userId) return;
  if (bufferingDebounceTimer) clearTimeout(bufferingDebounceTimer);
  if (currentBufferingState) {
    currentBufferingState = false;
    db.ref(`rooms/${roomId}/users/${userId}`).update({ isBuffering: false });
  }
}

// --- 🎨 2026 FROSTED GLASS YÜZEN SOHBET VE KONTROL PODU ---
function createChatUI() {
  if (document.getElementById('filmsync-root')) return;

  panelForceOpenUntil = Date.now() + 8000;

  const root = document.createElement('div');
  root.id = 'filmsync-root';
  root.setAttribute('style', [
    'position: fixed',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'z-index: 2147483647',
    'pointer-events: none',
    'display: block',
    'visibility: visible',
    'opacity: 1',
    'font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'font-size: 16px',
    'line-height: 1.5',
    '-webkit-font-smoothing: antialiased',
    '-moz-osx-font-smoothing: grayscale'
  ].join(' !important; ') + ' !important;');

  let style = document.getElementById('filmsync-injected-styles');
  if (!style) {
    style = document.createElement('style');
    style.id = 'filmsync-injected-styles';
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = `
    /* FilmSync Scoping & Reset */
    #filmsync-root {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    #filmsync-root, #filmsync-root * {
      box-sizing: border-box !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }

    /* Mini Dikey Araç Çubuğu (Mini-Toolbar) - 2026 Frosted Glass Buton */
    #filmsync-mini-toolbar {
      position: fixed !important;
      right: 24px !important;
      top: 50% !important;
      bottom: auto !important;
      transform: translateY(-50%) !important;
      width: 44px !important;
      height: 44px !important;
      background: rgba(18, 21, 33, 0.55) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.20) !important;
      border-radius: 50% !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      cursor: pointer !important;
    }
    #filmsync-mini-toolbar:hover {
      background: rgba(28, 34, 54, 0.70) !important;
      border-color: rgba(255, 255, 255, 0.35) !important;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.50), 0 0 16px rgba(255, 255, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.30) !important;
      transform: translateY(-50%) scale(1.06) !important;
    }
    #filmsync-mini-toolbar.panel-active {
      opacity: 0 !important;
      pointer-events: none !important;
      transform: translateY(-50%) scale(0.85) !important;
    }
    .filmsync-tool-btn {
      width: 100% !important;
      height: 100% !important;
      border-radius: 50% !important;
      border: none !important;
      background: transparent !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      position: relative !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-tool-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: scale(1.08) !important;
    }
    .filmsync-tool-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }
    .filmsync-tool-btn.tp-logo {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: none !important;
      box-shadow: none !important;
    }
    .filmsync-tool-btn.tp-logo svg {
      fill: rgba(255, 255, 255, 0.85) !important;
    }
    .filmsync-tool-btn.tp-logo:hover svg {
      fill: #ffffff !important;
    }
    .filmsync-tool-btn svg {
      width: 18px !important;
      height: 18px !important;
      fill: #e2e8f0 !important;
      transition: fill 0.2s !important;
    }
    .filmsync-tool-btn:hover svg {
      fill: #fff !important;
    }
    .filmsync-tool-btn.exit-btn:hover {
      background: rgba(229, 9, 20, 0.25) !important;
    }
    .filmsync-tool-btn.exit-btn:hover svg {
      fill: #ff3d47 !important;
    }
    
    /* TP Logosu Yumuşak Cam Ripple Efekti */
    @keyframes soft-glass-ripple {
      0% {
        box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
      }
      100% {
        box-shadow: 0 0 0 14px rgba(255, 255, 255, 0);
      }
    }
    .filmsync-tool-btn.tp-logo.clicked {
      animation: soft-glass-ripple 0.5s ease-out forwards !important;
    }
    
    /* Araç İpucu (Tooltip) - 2026 Frosted Glass */
    .filmsync-tool-btn::after {
      content: attr(data-tooltip);
      position: absolute;
      right: 52px;
      top: 50%;
      transform: translateY(-50%) scale(0.95);
      background: rgba(14, 18, 30, 0.76) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.18) !important;
      color: #fff;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 12px !important;
      font-weight: 500;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: all 0.15s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-tool-btn:hover::after {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }

    /* Yüzen Kompakt Cam Sohbet Podu (Floating Glass Pod) - 2026 Frosted Glass */
    #filmsync-chat-panel {
      position: fixed !important;
      top: 50% !important;
      right: 24px !important;
      bottom: auto !important;
      transform: translateY(-50%) translateX(40px) scale(0.96) !important;
      width: 288px !important;
      height: 470px !important;
      max-height: calc(100vh - 140px) !important;
      border-radius: 20px !important;
      background: rgba(13, 15, 25, 0.45) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-left: 1px solid rgba(255, 255, 255, 0.16) !important;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      will-change: transform, opacity !important;
      z-index: 2147483646 !important;
      pointer-events: none !important;
      opacity: 0 !important;
      font-size: 15px !important;
    }
    /* Sohbet podu gizliyken (kapalıyken) GPU katmanlarını ve 20px bulanıklaştırma filtrelerini uyut (Apple Silicon M4 GPU/CPU Optimizasyonu) */
    #filmsync-chat-panel:not(.active),
    #filmsync-chat-panel:not(.active) * {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      will-change: auto !important;
    }
    #filmsync-chat-panel:not(.active) .filmsync-spinner {
      animation: none !important;
    }
    #filmsync-chat-panel.active {
      transform: translateY(-50%) translateX(0) scale(1) !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }

    /* Header Bileşenleri (Tamamen Saydam Üst Bar & Sade Kapatma Butonu) */
    .filmsync-header {
      position: relative !important;
      padding: 10px 12px 6px 12px !important;
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border-bottom: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      flex-shrink: 0 !important;
      z-index: 10 !important;
      border-top-left-radius: 20px !important;
      border-top-right-radius: 20px !important;
      margin: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
      font-size: 18px !important;
    }
    .filmsync-room-meta {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      font-size: 11.5px !important;
      font-weight: 600 !important;
      color: rgba(255, 255, 255, 0.82) !important;
      background: rgba(255, 255, 255, 0.07) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      padding: 3px 9px !important;
      border-radius: 999px !important;
      max-width: 215px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-close-btn {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      color: rgba(255, 255, 255, 0.85) !important;
      cursor: pointer !important;
      width: 26px !important;
      height: 26px !important;
      border-radius: 50% !important;
      font-size: 13px !important;
      line-height: 1 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
      padding: 0 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
      margin-left: auto !important;
    }
    .filmsync-close-btn:hover {
      background: rgba(229, 9, 20, 0.35) !important;
      border-color: rgba(229, 9, 20, 0.65) !important;
      color: #fff !important;
      transform: scale(1.08) rotate(90deg) !important;
      box-shadow: 0 4px 12px rgba(229, 9, 20, 0.4) !important;
    }
    .filmsync-close-btn:active {
      transform: scale(0.95) rotate(90deg) !important;
    }
    .filmsync-close-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }

    /* Mesaj Listesi - Saydam Cam Zemin & Çift Yönlü Kırpılmış Akış */
    #filmsync-messages {
      flex: 1 !important;
      padding: 12px 12px 10px 12px !important;
      overflow-y: auto !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      background: transparent !important;
      mask-image: linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 16px), transparent 100%) !important;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 16px), transparent 100%) !important;
    }
    #filmsync-messages > :first-child {
      margin-top: auto !important;
    }
    #filmsync-messages::-webkit-scrollbar {
      width: 4px !important;
    }
    #filmsync-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.16) !important;
      border-radius: 4px !important;
    }
    #filmsync-messages::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.28) !important;
    }

    .filmsync-msg-row {
      display: flex !important;
      flex-direction: column !important;
      max-width: 90% !important;
    }
    .filmsync-msg-row.self { align-self: flex-end !important; }
    .filmsync-msg-row.other { align-self: flex-start !important; }
    .filmsync-msg-row.system { align-self: center !important; max-width: 94% !important; margin: 2px 0 !important; }

    .filmsync-msg-sender {
      font-size: 13px !important;
      color: rgba(255, 255, 255, 0.85) !important;
      margin-bottom: 3px !important;
      margin-left: 6px !important;
      font-weight: 600 !important;
      letter-spacing: 0.2px !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7) !important;
    }
    .filmsync-msg-row.self .filmsync-msg-sender {
      text-align: right !important;
      margin-right: 6px !important;
      margin-left: 0 !important;
    }

    .filmsync-msg-bubble {
      padding: 8px 14px !important;
      border-radius: 16px !important;
      font-size: 15px !important;
      line-height: 1.42 !important;
      word-break: break-word !important;
      color: #fff !important;
      font-weight: 450 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4) !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-msg-row.self .filmsync-msg-bubble {
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.88), rgba(255, 61, 71, 0.82)) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-bottom-right-radius: 4px !important;
      border: 1px solid rgba(255, 255, 255, 0.22) !important;
      box-shadow: 0 4px 18px rgba(229, 9, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }
    .filmsync-msg-row.other .filmsync-msg-bubble {
      background: rgba(24, 27, 42, 0.60) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-bottom-left-radius: 4px !important;
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
      color: #f1f2f6 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-msg-row.system .filmsync-msg-bubble {
      background: rgba(225, 177, 44, 0.16) !important;
      border: 1px solid rgba(225, 177, 44, 0.35) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      color: #ffeaa7 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      text-align: center !important;
      border-radius: 12px !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
      padding: 5px 12px !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
    }

    /* Buffering Göstergesi - 2026 Frosted Glass */
    .filmsync-buffering-indicator {
      font-size: 13px !important;
      font-weight: 600 !important;
      color: #ff6b81 !important;
      padding: 6px 16px !important;
      background: rgba(229, 9, 20, 0.18) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.14) !important;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
      display: none;
      align-items: center !important;
      gap: 8px !important;
      flex-shrink: 0 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5) !important;
    }
    .filmsync-buffering-indicator.active {
      display: flex !important;
    }
    .filmsync-spinner {
      width: 14px !important;
      height: 14px !important;
      border: 2px solid rgba(255,255,255,0.2) !important;
      border-top-color: #ff3d47 !important;
      border-radius: 50% !important;
      animation: fs-spin 0.8s linear infinite !important;
    }

    /* Reaksiyon Emojileri Barı - Daraltılmış, Saydam & Ortalanmış */
    .filmsync-reaction-bar {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 5px !important;
      padding: 3px 8px !important;
      margin: 2px auto 6px auto !important;
      width: fit-content !important;
      max-width: 80% !important;
      background: rgba(255, 255, 255, 0.06) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.12) !important;
      border-radius: 20px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
      flex-shrink: 0 !important;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease !important;
    }
    .filmsync-reaction-bar:hover {
      background: rgba(255, 255, 255, 0.10) !important;
      border-color: rgba(255, 255, 255, 0.22) !important;
      transform: translateY(-1px) !important;
    }
    .filmsync-react-btn {
      font-size: 16px !important;
      background: transparent !important;
      border: none !important;
      cursor: pointer !important;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease, background 0.15s ease !important;
      padding: 3px 5px !important;
      border-radius: 8px !important;
      line-height: 1 !important;
      opacity: 0.65 !important;
    }
    .filmsync-react-btn:hover {
      transform: scale(1.3) translateY(-2px) !important;
      opacity: 1 !important;
      background: rgba(255, 255, 255, 0.14) !important;
    }
    .filmsync-react-btn:active {
      transform: scale(1.1) translateY(0) !important;
    }
    .filmsync-react-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.5) !important;
      outline-offset: 1px !important;
    }

    /* Mesaj Giriş Alanı - Sakin & Şık Cam Çerçeve */
    .filmsync-input-area {
      padding: 8px 12px 12px 12px !important;
      background: rgba(16, 18, 30, 0.40) !important;
      backdrop-filter: blur(16px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
      border-top: 1px solid rgba(255, 255, 255, 0.10) !important;
      display: flex !important;
      gap: 8px !important;
      align-items: center !important;
      flex-shrink: 0 !important;
    }
    .filmsync-input-area input {
      flex: 1 !important;
      padding: 9px 14px !important;
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 18px !important;
      color: #fff !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      outline: none !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25) !important;
      transition: all 0.2s ease !important;
    }
    .filmsync-input-area input::placeholder {
      color: rgba(255, 255, 255, 0.45) !important;
    }
    .filmsync-input-area input:focus {
      border-color: rgba(255, 255, 255, 0.38) !important;
      background: rgba(255, 255, 255, 0.14) !important;
      box-shadow: 0 0 14px rgba(255, 255, 255, 0.18), inset 0 1px 2px rgba(0, 0, 0, 0.2) !important;
    }
    .filmsync-send-btn {
      width: 34px !important;
      height: 34px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.85), rgba(255, 61, 71, 0.80)) !important;
      border: 1px solid rgba(255, 255, 255, 0.24) !important;
      backdrop-filter: blur(14px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(180%) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      color: #fff !important;
      font-size: 13px !important;
      box-shadow: 0 4px 14px rgba(229, 9, 20, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      flex-shrink: 0 !important;
    }
    .filmsync-send-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.95), rgba(255, 61, 71, 0.90)) !important;
      transform: scale(1.08) !important;
      box-shadow: 0 6px 18px rgba(229, 9, 20, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    }
    .filmsync-send-btn:active:not(:disabled) {
      transform: scale(0.96) !important;
    }
    .filmsync-send-btn:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.6) !important;
      outline-offset: 2px !important;
    }
    .filmsync-send-btn svg {
      width: 15px !important;
      height: 15px !important;
      fill: #fff !important;
      margin-left: 2px !important;
    }

    /* 3D Uçan Emojiler Animasyon Alanı (GPU Hızlandırmalı Derinlikli Küre & Süzülme) */
    #filmsync-reaction-layer {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 2147483645 !important;
      overflow: hidden !important;
      perspective: 900px !important;
    }
    .flying-emoji {
      position: absolute !important;
      bottom: -60px !important;
      width: 54px !important;
      height: 54px !important;
      border-radius: 50% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 32px !important;
      line-height: 1 !important;
      background: radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.10) 45%, rgba(15, 20, 35, 0.28) 100%) !important;
      border: 1px solid rgba(255, 255, 255, 0.28) !important;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.45), inset 0 3px 6px rgba(255, 255, 255, 0.42), inset 0 -4px 8px rgba(0, 0, 0, 0.35) !important;
      text-shadow: 0 6px 12px rgba(0, 0, 0, 0.45) !important;
      transform-style: preserve-3d !important;
      will-change: transform, opacity !important;
      animation: flyUp 3.2s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      opacity: 0 !important;
    }
    .flying-emoji::after {
      content: '' !important;
      position: absolute !important;
      top: 6px !important;
      left: 10px !important;
      width: 16px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: rgba(255, 255, 255, 0.48) !important;
      transform: rotate(-28deg) !important;
      pointer-events: none !important;
    }

    /* Toast Bildirimleri Konteyneri & Şık Cam Kartlar */
    #filmsync-toast-container {
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      gap: 8px !important;
      z-index: 2147483647 !important;
      pointer-events: none !important;
    }
    .filmsync-toast {
      position: relative !important;
      transform: translateX(420px) !important;
      opacity: 0 !important;
      width: 360px !important;
      background: rgba(14, 18, 28, 0.70) !important;
      backdrop-filter: blur(20px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
      border: 1px solid rgba(255, 255, 255, 0.16) !important;
      border-radius: 12px !important;
      padding: 12px 18px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18) !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      cursor: pointer !important;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
      will-change: transform, opacity !important;
      pointer-events: auto !important;
    }
    .filmsync-toast:hover {
      border-color: rgba(255, 255, 255, 0.28) !important;
      box-shadow: 0 10px 36px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }
    .filmsync-toast.active {
      transform: translateX(0) !important;
      opacity: 1 !important;
    }
    .filmsync-toast-header {
      display: none !important;
    }
    .filmsync-toast-body {
      font-size: 17px !important;
      line-height: 1.4 !important;
      font-weight: 500 !important;
      color: #ffffff !important;
      word-break: break-word !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6) !important;
      letter-spacing: -0.1px !important;
    }

    /* 1920px+ (Full HD, 2K, 4K) Ekranlarda Okunabilirlik ve Orantı Garantisi */
    @media (min-width: 1920px) {
      #filmsync-chat-panel {
        width: 320px !important;
      }
      .filmsync-toast {
        width: 390px !important;
        padding: 14px 20px !important;
      }
      .filmsync-toast-header {
        font-size: 16px !important;
      }
      .filmsync-toast-body {
        font-size: 18px !important;
      }
      .filmsync-msg-bubble {
        font-size: 16.5px !important;
      }
    }

    /* Sayfa ve Oynatıcı - Tam Boyut Cam Akış */
    body.filmsync-sidebar-open {
      overflow-x: hidden !important;
    }

    /* Netflix, YouTube, Disney+ vb. Oynatıcı İzolasyonları ve Daraltma */
    /* Not: DOM Reflow (yeniden hesaplama) performans kaybını önlemek için width yerine transform (scale) vs. kullanılabilir
       Ancak video elementleri için genellikle transform sorun yaratır. Performansı artırmak için transitionları layout özelliklerinde kısıtlıyoruz. */
    body.filmsync-sidebar-open .watch-video,
    body.filmsync-sidebar-open .nf-player-container,
    body.filmsync-sidebar-open #ytd-player,
    body.filmsync-sidebar-open .html5-video-player,
    body.filmsync-sidebar-open disney-web-player,
    body.filmsync-sidebar-open .btm-media-player,
    body.filmsync-sidebar-open .media-client-container {
      width: calc(100% - 390px) !important;
      max-width: calc(100% - 390px) !important;
      left: 0 !important;
      transition: none !important; /* DOM reflow performans kaybını engellemek için */
    }

    @keyframes fs-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes flyUp {
      0% {
        transform: translate3d(0, 0, 0) scale(0.35) rotateX(25deg) rotateY(-20deg) rotateZ(-10deg);
        opacity: 0;
      }
      14% {
        opacity: 1;
        transform: translate3d(var(--fs-sway-1, 18px), -14vh, 40px) scale(1.18) rotateX(-12deg) rotateY(18deg) rotateZ(8deg);
      }
      45% {
        opacity: 1;
        transform: translate3d(var(--fs-sway-2, -22px), -45vh, 65px) scale(1.08) rotateX(10deg) rotateY(-16deg) rotateZ(-6deg);
      }
      78% {
        opacity: 0.92;
        transform: translate3d(var(--fs-sway-1, 14px), -76vh, 30px) scale(1.0) rotateX(-8deg) rotateY(14deg) rotateZ(5deg);
      }
      100% {
        transform: translate3d(var(--fs-sway-2, -12px), -104vh, 0) scale(0.75) rotateX(15deg) rotateY(-10deg) rotateZ(-8deg);
        opacity: 0;
      }
    }
  `;

  root.innerHTML = `
    <!-- Dikey Araç Çubuğu (Mini-Toolbar) -->
    <div id="filmsync-mini-toolbar" class="panel-active">
      <button class="filmsync-tool-btn tp-logo" data-tooltip="Sohbet" title="Sohbet (Enter)">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
      </button>
    </div>
    
    <!-- Toast Bildirimleri Konteyneri -->
    <div id="filmsync-toast-container"></div>

    <!-- Yüzen Cam Sohbet Podu (Floating Glass Chat Pod) -->
    <div id="filmsync-chat-panel" class="active">
      <div class="filmsync-header">
        <div class="filmsync-room-meta" id="filmsyncRoomMeta" title="Katılımcılar">🍿 1 Kişi · <span class="dynamic-text"></span></div>
        <button class="filmsync-close-btn" id="filmsyncCloseBtn" title="Kapat (Escape)">✕</button>
      </div>

      <div id="filmsync-messages"></div>
      
      <!-- Yükleniyor / Buffer Göstergesi -->
      <div class="filmsync-buffering-indicator" id="filmsyncBufferingIndicator">
        <div class="filmsync-spinner"></div>
        <span id="filmsyncBufferingText">Bağlantı bekleniyor...</span>
      </div>

      <!-- Emoji Reaksiyon Barı -->
      <div class="filmsync-reaction-bar">
        <button class="filmsync-react-btn" data-emoji="👍">👍</button>
        <button class="filmsync-react-btn" data-emoji="😮">😮</button>
        <button class="filmsync-react-btn" data-emoji="😢">😢</button>
        <button class="filmsync-react-btn" data-emoji="😂">😂</button>
        <button class="filmsync-react-btn" data-emoji="🤯">🤯</button>
        <button class="filmsync-react-btn" data-emoji="🔥">🔥</button>
      </div>
      
      <!-- Mesaj Girişi -->
      <div class="filmsync-input-area">
        <input type="text" id="filmsyncMsgInput" placeholder="Mesaj yazın... (Enter)" autocomplete="off">
        <button class="filmsync-send-btn" id="filmsyncSendBtn" title="Gönder">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

    <!-- Reaksiyon Katmanı -->
    <div id="filmsync-reaction-layer"></div>
  `;

  const mountTarget = document.body || document.documentElement;
  mountTarget.appendChild(root);

  const metaDynamic = root.querySelector('#filmsyncRoomMeta .dynamic-text');
  if (metaDynamic) metaDynamic.textContent = username || 'Anonim';
  (document.head || document.documentElement).appendChild(style);

  document.body?.classList.add('filmsync-sidebar-open');
  document.documentElement.setAttribute('data-filmsync-chat-open', 'true');

  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  messageList = document.getElementById('filmsync-messages');
  reactionContainer = document.getElementById('filmsync-reaction-layer');
  const sendBtn = document.getElementById('filmsyncSendBtn');

  if (chatPanel) {
    chatPanel.addEventListener('mouseenter', () => {
      isMouseInsideChatPanel = true;
    });
    chatPanel.addEventListener('mouseleave', () => {
      isMouseInsideChatPanel = false;
      startAutoHideTimer(AUTO_HIDE_DELAY);
    });
    chatPanel.addEventListener('mousedown', (e) => {
      if (e.target.closest('#filmsyncCloseBtn') || e.target.closest('.filmsync-react-btn')) {
        return;
      }
      if (e.target !== messageInput && !e.target.closest('#filmsyncSendBtn')) {
        e.preventDefault();
      }
      if (messageInput) {
        messageInput.focus();
      }
    });
  }

  if (sendBtn && messageInput) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
    messageInput.addEventListener('input', () => {
      lastTypingTime = Date.now();
      const hasText = messageInput.value.trim().length > 0;
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.4';
      clearTimeout(autoHideTimer);
    });
    messageInput.addEventListener('focus', () => {
      isInputFocused = true;
      showPanelAndToolbar();
      if (messageInput.value.trim().length === 0) {
        startAutoHideTimer(AUTO_HIDE_DELAY);
      }
    });
    messageInput.addEventListener('blur', () => {
      isInputFocused = false;
      startAutoHideTimer(AUTO_HIDE_DELAY);
    });
    setTimeout(() => {
      if (messageInput) messageInput.focus();
    }, 100);
  }

  root.addEventListener('keydown', (e) => {
    e.stopPropagation();
  });
  root.addEventListener('keyup', (e) => {
    e.stopPropagation();
  });
  root.addEventListener('keypress', (e) => {
    e.stopPropagation();
  });

  document.getElementById('filmsyncCloseBtn').addEventListener('click', toggleChatPanel);
  
  const logoBtn = document.querySelector('.filmsync-tool-btn.tp-logo');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      logoBtn.classList.remove('clicked');
      void logoBtn.offsetWidth;
      logoBtn.classList.add('clicked');
      toggleChatPanel();
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendChatMessage);
  }
  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      clearTimeout(autoHideTimer);
      lastBlockedKeyTimestamp = Date.now();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (chatPanel && chatPanel.classList.contains('active')) {
          toggleChatPanel();
        }
        messageInput.blur();
        lastEscapeTime = Date.now();
      }
    });

    messageInput.addEventListener('keyup', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });

    messageInput.addEventListener('keypress', (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    });
  }

  document.querySelectorAll('.filmsync-react-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      sendEmojiReaction(emoji);
    });
  });

  attachGlobalKeyListeners();
  broadcastChatState(true);
  startAutoHideTimer(AUTO_HIDE_DELAY);

  if (messagesQueue.length > 0) {
    messagesQueue.forEach(msg => appendMessage(msg));
    messagesQueue = [];
  }

  if (db && roomId) {
    db.ref(`rooms/${roomId}/messages`).limitToLast(50).once('value').then((snapshot) => {
      const messages = snapshot.val();
      if (messages) {
        Object.entries(messages).forEach(([key, msg]) => {
          if (!renderedMessageKeys.has(key)) {
            renderedMessageKeys.add(key);
            appendMessage({ ...msg, timestamp: msg.timestamp || Date.now() });
          }
        });
      }
    });
  }
}

// Sohbet Podu Üst Bilgi Barını Güncelle (Oda Kodu ve Parantez Olmadan Sadece Kişi Sayısı ve İsimler)
function updateRoomInfoBar(usersList, state) {
  if (Array.isArray(usersList)) {
    cachedUsersList = usersList;
  }
  const metaEl = document.getElementById('filmsyncRoomMeta');
  if (!metaEl) return;

  const count = cachedUsersList.length || 1;
  const names = cachedUsersList.map(u => u.username).filter(Boolean).join(', ') || username || 'Anonim';
  const platform = (state && state.platformName) ? state.platformName : detectPlatformName(window.location.href);
  metaEl.textContent = `🍿 ${count} Kişi${names ? ' · ' + names : ''}`;
  metaEl.title = `${platform} · ${count} Kişi: ${names}`;
}

// Reaksiyon Gönderme (Firebase)
function sendEmojiReaction(emoji) {
  if (!db || !roomId) return;
  soundEffects.playReactionChord();
  db.ref(`rooms/${roomId}/reactions`).push({
    emoji,
    senderId: userId,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
}

// 3D Uçan Emoji Animasyonu Tetikleme (GPU Hızlandırmalı & Maksimum 12 Eşzamanlı Element Limiti)
function spawnFlyingEmoji(emoji) {
  if (!reactionContainer) {
    reactionContainer = document.getElementById('filmsync-reaction-layer');
  }
  if (!reactionContainer) return;

  while (reactionContainer.children.length >= 12) {
    reactionContainer.firstElementChild.remove();
  }
  
  const el = document.createElement('div');
  el.className = 'flying-emoji';
  el.textContent = emoji;
  
  const randomLeft = Math.random() * 22 + 70; // Sağ sohbet podu hizasında (70% - 92%) 3 boyutlu süzülme
  const sway1 = Math.round((Math.random() - 0.5) * 48);
  const sway2 = Math.round((Math.random() - 0.5) * 48);
  el.style.left = `${randomLeft}%`;
  el.style.setProperty('--fs-sway-1', `${sway1}px`);
  el.style.setProperty('--fs-sway-2', `${sway2}px`);
  
  reactionContainer.appendChild(el);
  setTimeout(() => el.remove(), 3300);
}

function openChatPanelAndFocus(resetGrace = true) {
  if (window !== window.top && !isFullscreen && !isParentIframeFullscreen) return;
  if (!document.getElementById('filmsync-root')) {
    createChatUI();
  }
  if (window === window.top) {
    startUIKeeper();
  }
  chatPanel = document.getElementById('filmsync-chat-panel');
  messageInput = document.getElementById('filmsyncMsgInput');
  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');
  const logoToggleBtn = document.querySelector('.filmsync-tool-btn.tp-logo');

  if (resetGrace) {
    panelForceOpenUntil = Date.now() + 8000;
  }

  const root = document.getElementById('filmsync-root');
  if (root) {
    root.style.setProperty('display', 'block', 'important');
    root.style.setProperty('visibility', 'visible', 'important');
    root.style.setProperty('opacity', '1', 'important');
  }

  if (chatPanel) {
    chatPanel.classList.add('active');
    chatPanel.style.opacity = '1';
    chatPanel.style.pointerEvents = 'auto';
    chatPanel.style.visibility = 'visible';
    document.body?.classList.add('filmsync-sidebar-open');
  }
  if (miniToolbar) {
    miniToolbar.classList.add('panel-active');
    miniToolbar.style.opacity = '0';
    miniToolbar.style.pointerEvents = 'none';
  }
  if (chatToggleBtn) {
    chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle');
  }
  if (logoToggleBtn) {
    logoToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle (Enter)');
    logoToggleBtn.title = 'Sohbeti Gizle (Enter)';
  }
  broadcastChatState(true);
  startAutoHideTimer(resetGrace ? Math.max(AUTO_HIDE_DELAY, 8000) : AUTO_HIDE_DELAY);

  if (messageInput) {
    setTimeout(() => {
      try { messageInput.focus(); } catch (e) {}
    }, 50);
  }
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight;
  }
}

function startUIKeeper() {
  if (uiKeeperInterval) clearInterval(uiKeeperInterval);
  uiKeeperInterval = setInterval(() => {
    if (roomId && window === window.top) {
      const hasKnownVideo = !!(videoElement && videoElement.isConnected) || hasChildFrameVideo;
      const isBrowseExclusion = window.location.href.includes('netflix.com/browse') || 
                                window.location.href.includes('netflix.com/title') || 
                                window.location.href.includes('youtube.com/feed');
      const isWatchPage = !isBrowseExclusion && (isMovieWatchUrl(window.location.href) || hasKnownVideo || !!findBestVideoElement());
      if (!shouldShowChatUIInTop() && !isWatchPage) return;

      const root = document.getElementById('filmsync-root');
      const styleEl = document.getElementById('filmsync-injected-styles');
      if (!root || !styleEl) {
        Logger.log('[FilmSync UI Keeper] Arayüz veya stil eksik, yeniden oluşturuluyor.');
        if (root && !styleEl) root.remove();
        createChatUI();
      } else {
        // Host sayfası CSS/JS müdahalelerine karşı root görünürlüğünü ve doğru ebeveynde olduğunu koru
        ensureRootInFullscreenElement();
        root.style.setProperty('display', 'block', 'important');
        root.style.setProperty('visibility', 'visible', 'important');
        root.style.setProperty('opacity', '1', 'important');

        const toolbar = document.getElementById('filmsync-mini-toolbar');
        const panel = document.getElementById('filmsync-chat-panel');
        const isPanelOpen = panel && panel.classList.contains('active');
        if (isPanelOpen && panel) {
          panel.style.opacity = '1';
          panel.style.pointerEvents = 'auto';
          panel.style.visibility = 'visible';
        } else if (!isFullscreen && !isPanelOpen && toolbar) {
          toolbar.classList.remove('panel-active');
          toolbar.style.opacity = '1';
          toolbar.style.pointerEvents = 'auto';
          toolbar.style.visibility = 'visible';
        }
      }
    }
  }, 1500);
}

function broadcastToAllFrames(msg) {
  try {
    function postToWindowTree(win) {
      if (!win) return;
      try { win.postMessage(msg, '*'); } catch (e) {}
      try {
        for (let i = 0; i < win.frames.length; i++) {
          try { postToWindowTree(win.frames[i]); } catch (e) {}
        }
      } catch (e) {}
    }
    postToWindowTree(window.top);
  } catch (err) {}
}

function broadcastChatState(isOpen) {
  const openVal = !!isOpen;
  isChatOpenInTop = openVal;
  document.documentElement.setAttribute('data-filmsync-chat-open', openVal ? 'true' : 'false');
  broadcastToAllFrames({
    type: 'filmsync-chat-state',
    isOpen: openVal,
    isRoomActive: !!roomId,
    roomId: roomId,
    userId: userId,
    username: username,
    hostId: hostId,
    hostOnly: hostOnly
  });
}

function insertTextAtCursor(input, text) {
  if (!input) return;
  lastTypingTime = Date.now();
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  input.value = val.substring(0, start) + text + val.substring(end);
  const newPos = start + text.length;
  input.selectionStart = input.selectionEnd = newPos;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleBackspaceInInput(input) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  if (start !== end) {
    input.value = val.substring(0, start) + val.substring(end);
    input.selectionStart = input.selectionEnd = start;
  } else if (start > 0) {
    input.value = val.substring(0, start - 1) + val.substring(end);
    input.selectionStart = input.selectionEnd = start - 1;
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleDeleteInInput(input) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const val = input.value || '';
  if (start !== end) {
    input.value = val.substring(0, start) + val.substring(end);
    input.selectionStart = input.selectionEnd = start;
  } else if (start < val.length) {
    input.value = val.substring(0, start) + val.substring(start + 1);
    input.selectionStart = input.selectionEnd = start;
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function handleArrowInInput(input, key) {
  if (!input) return;
  const start = input.selectionStart != null ? input.selectionStart : input.value.length;
  const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
  const len = (input.value || '').length;
  if (key === 'ArrowLeft') {
    const pos = Math.max(0, (start !== end ? start : start - 1));
    input.selectionStart = input.selectionEnd = pos;
  } else if (key === 'ArrowRight') {
    const pos = Math.min(len, (start !== end ? end : end + 1));
    input.selectionStart = input.selectionEnd = pos;
  } else if (key === 'ArrowUp') {
    input.selectionStart = input.selectionEnd = 0;
  } else if (key === 'ArrowDown') {
    input.selectionStart = input.selectionEnd = len;
  }
}

function handleGlobalKeySuppression(e) {
  if (window !== window.top) {
    const isModifier = (e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt' || e.key === 'Shift');
    if (!isModifier) {
      lastBlockedKeyTimestamp = Date.now();
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    }
    return;
  }
  if (!roomId && !document.getElementById('filmsync-root')) return;
  const activeEl = document.activeElement;
  const isMsgInput = activeEl && (activeEl === messageInput || activeEl.id === 'filmsyncMsgInput');
  const isChatOpen = !!(chatPanel && chatPanel.classList.contains('active'));
  const isSingleChar = (e.key && e.key.length === 1 && e.key !== ' ');
  if (isMsgInput || isChatOpen || isChatOpenInTop || isSingleChar) {
    lastBlockedKeyTimestamp = Date.now();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.key !== 'Control' && e.key !== 'Meta' && e.key !== 'Alt' && e.key !== 'Shift') {
      e.preventDefault();
    }
  }
}

function removeChatUI() {
  if (uiKeeperInterval) {
    clearInterval(uiKeeperInterval);
    uiKeeperInterval = null;
  }
  if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
    try { navigator.keyboard.unlock(); } catch (e) {}
  }
  const root = document.getElementById('filmsync-root');
  if (root) root.remove();
  chatPanel = null;
  messageInput = null;
  messageList = null;
  reactionContainer = null;
  document.getElementById('filmsync-injected-styles')?.remove();
  document.body?.classList.remove('filmsync-sidebar-open');
  broadcastChatState(false);
  isGlobalKeyListenersAttached = false;
  window.removeEventListener('keydown', handleGlobalEnterKey, true);
  document.removeEventListener('keydown', handleGlobalEnterKey, true);
  window.removeEventListener('keyup', handleGlobalKeySuppression, true);
  document.removeEventListener('keyup', handleGlobalKeySuppression, true);
  window.removeEventListener('keypress', handleGlobalKeySuppression, true);
  document.removeEventListener('keypress', handleGlobalKeySuppression, true);
}

function toggleChatPanel() {
  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!chatPanel) return;

  const miniToolbar = document.getElementById('filmsync-mini-toolbar');
  chatPanel.classList.toggle('active');
  
  const isOpened = chatPanel.classList.contains('active');
  const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');
  const logoToggleBtn = document.querySelector('.filmsync-tool-btn.tp-logo');

  if (isOpened) {
    document.body?.classList.add('filmsync-sidebar-open');
    chatPanel.style.opacity = '1';
    chatPanel.style.pointerEvents = 'auto';
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');
    messageInput?.focus();
    if (messageList) messageList.scrollTop = messageList.scrollHeight;
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>';
    }
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbeti Gizle (Enter)');
      logoToggleBtn.title = 'Sohbeti Gizle (Enter)';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);
  } else {
    document.body?.classList.remove('filmsync-sidebar-open');
    chatPanel.style.opacity = '0';
    chatPanel.style.pointerEvents = 'none';
    clearTimeout(autoHideTimer);
    if (messageInput && document.activeElement === messageInput) {
      messageInput.blur();
    }
    isInputFocused = false;
    if (miniToolbar) {
      miniToolbar.classList.remove('panel-active');
      miniToolbar.style.opacity = '1';
      miniToolbar.style.pointerEvents = 'auto';
    }
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
    }
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbet');
      logoToggleBtn.title = 'Sohbet (Enter)';
    }
    broadcastChatState(false);
  }
}

function handleGlobalEnterKey(e) {
  if (!e || e._filmsyncHandled) return;

  // Iframe içerisinden gelen olayları ana pencereye ilet ve player kısayollarını (F, M, Sarma vb.) KESİNLİKLE durdur
  if (window !== window.top && !document.getElementById('filmsync-root')) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
    const isArrow = (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown');
    const isSingleChar = (e.key && e.key.length === 1 && !isSpace);

    // Chat açıkken veya alfanümerik/enter/escape basıldığında iframe player'a asla kısayol gitmemeli!
    if (isChatOpenInTop || isSingleChar || isSpace || e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Delete' || isArrow) {
      e._filmsyncHandled = true;
      lastBlockedKeyTimestamp = Date.now();
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      try {
        window.top.postMessage({
          type: 'filmsync-iframe-keydown',
          key: e.key,
          code: e.code
        }, '*');
      } catch (err) {}
      return;
    }
    return;
  }

  // Sadece oda varsa veya FilmSync UI mevcutsa klavye kontrolleri devreye girsin
  if (!roomId && !document.getElementById('filmsync-root')) {
    try {
      chrome.storage.local.get(['roomId'], (res) => {
        if (res && res.roomId && !roomId) {
          roomId = res.roomId;
          init();
        }
      });
    } catch (err) {}
    return;
  }

  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');

  if ((!chatPanel || !messageInput) && roomId && window === window.top) {
    createChatUI();
    chatPanel = document.getElementById('filmsync-chat-panel');
    messageInput = document.getElementById('filmsyncMsgInput');
  }

  if (!chatPanel || !messageInput) return;

  const activeEl = document.activeElement;
  const isMessageInput = activeEl && (activeEl === messageInput || activeEl.id === 'filmsyncMsgInput');
  const isInFilmsyncUI = activeEl && (isMessageInput || (activeEl.closest && activeEl.closest('#filmsync-root')));
  const isChatOpen = !!(chatPanel && chatPanel.classList.contains('active'));
  
  // Sadece gerçek metin girişi yapılan harici inputlar (arama kutusu vb.) muaf tutulmalı;
  // Oynatıcı ses/ilerleme çubukları (<input type="range">) veya butonlar metin yazmayı ASLA engellememelidir!
  const isTextInput = activeEl && !isInFilmsyncUI && (
    (activeEl.tagName === 'INPUT' && !['range', 'button', 'checkbox', 'radio', 'submit', 'reset', 'file', 'color', 'image'].includes((activeEl.type || '').toLowerCase())) ||
    activeEl.tagName === 'TEXTAREA' ||
    (activeEl.isContentEditable && activeEl !== messageInput)
  );
  if (isTextInput) return;

  // 1. ESCAPE TUŞU: Çift Basış Tam Ekran Koruması (Double-Escape Fullscreen Guard)
  if (e.key === 'Escape') {
    e._filmsyncHandled = true;
    lastBlockedKeyTimestamp = Date.now();
    if (isChatOpen || isMessageInput || isInFilmsyncUI) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      if (messageInput) {
        messageInput.blur();
      }
      if (activeEl && activeEl.blur) {
        activeEl.blur();
      }
      lastEscapeTime = Date.now();
      return;
    } else {
      if (Date.now() - lastEscapeTime < 1000) {
        lastEscapeTime = 0;
        if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
          try { navigator.keyboard.unlock(); } catch (err) {}
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        return;
      }
      return;
    }
  }

  // 2. FilmSync mesaj inputu odaktayken (kullanıcı mesaj yazarken):
  // Tüm video oynatıcı kısayollarını (F=fullscreen, M=mute, Space=pause, Ok tuşları ses/sarma, 0-9) KESİNLİKLE bloke et!
  if (isMessageInput) {
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') && (!messageInput.value || messageInput.value.trim().length === 0)) {
      return;
    }
    e._filmsyncHandled = true;
    lastBlockedKeyTimestamp = Date.now();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      sendChatMessage();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      messageInput.blur();
      lastEscapeTime = Date.now();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspaceInInput(messageInput);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      handleDeleteInInput(messageInput);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleArrowInInput(messageInput, e.key);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        messageInput.select();
        return;
      }
      return;
    }

    if (e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      insertTextAtCursor(messageInput, e.key);
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    return;
  }

  // 3. FilmSync Sohbet Paneli Açıkken (Oynatıcı Kısayollarının Tamamını Devre Dışı Bırakma):
  if (isChatOpen) {
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') && (!messageInput.value || messageInput.value.trim().length === 0)) {
      return;
    }
    e._filmsyncHandled = true;
    lastBlockedKeyTimestamp = Date.now();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        if (messageInput.value.trim()) {
          sendChatMessage();
        }
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      if (chatPanel && chatPanel.classList.contains('active')) {
        toggleChatPanel();
      }
      if (messageInput) messageInput.blur();
      lastEscapeTime = Date.now();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleBackspaceInInput(messageInput);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleDeleteInInput(messageInput);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
    if (isSpace) {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        insertTextAtCursor(messageInput, ' ');
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        handleArrowInInput(messageInput, e.key);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    if (e.ctrlKey || e.metaKey) return;

    if (e.key && e.key.length === 1) {
      e.preventDefault();
      if (messageInput) {
        messageInput.focus();
        insertTextAtCursor(messageInput, e.key);
      }
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }

    return;
  }

  // 4. OK TUŞLARI (Sohbet Kapalıyken Video Oynatıcı Kontrolü):
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    return;
  }

  // 5. Tarayıcı kısayol kombinasyonları (Ctrl+C, Cmd+R, Alt+Tab vb.)
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  // 6. ENTER TUŞU (Sohbet Kapalıyken Paneli Açma):
  if (e.key === 'Enter') {
    e._filmsyncHandled = true;
    lastBlockedKeyTimestamp = Date.now();
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    showPanelAndToolbar();
    if (chatPanel) {
      chatPanel.classList.add('active');
      chatPanel.style.opacity = '1';
      chatPanel.style.pointerEvents = 'auto';
      document.body?.classList.add('filmsync-sidebar-open');
    }
    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);

    if (messageInput) {
      messageInput.focus();
    }
    return;
  }

  // 7. SPACE (Boşluk) Tuşu (Sohbet Kapalıyken Video Oynat/Duraklat):
  const isSpace = (e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space');
  if (isSpace) {
    e._filmsyncHandled = true;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleVideoPlayPause();
    return;
  }

  // 8. HERHANGİ BİR YAZILABİLİR KARAKTER VEYA BACKSPACE TUŞU (Sohbet Kapalıyken Anında Açılış ve Yazma):
  const isAlphanumericKey = (e.key && e.key.length === 1 && !isSpace) &&
                            !e.ctrlKey && !e.metaKey && !e.altKey;
  const isAlphanumericOrSpace = isAlphanumericKey;
  const isBackspaceKey = (e.key === 'Backspace' && !e.ctrlKey && !e.metaKey && !e.altKey);

  if (isAlphanumericKey || isBackspaceKey) {
    e._filmsyncHandled = true;
    lastBlockedKeyTimestamp = Date.now();
    lastForwardedKeySignature = `${e.key}_${Date.now()}`;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    showPanelAndToolbar();
    if (chatPanel) {
      chatPanel.classList.add('active');
      chatPanel.style.opacity = '1';
      chatPanel.style.pointerEvents = 'auto';
      document.body?.classList.add('filmsync-sidebar-open');
    }
    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.add('panel-active');
      miniToolbar.style.opacity = '0';
      miniToolbar.style.pointerEvents = 'none';
    }
    broadcastChatState(true);
    startAutoHideTimer(AUTO_HIDE_DELAY);

    if (messageInput) {
      messageInput.focus();
      if (isBackspaceKey) {
        handleBackspaceInInput(messageInput);
      } else {
        messageInput.value += e.key;
        messageInput.selectionStart = messageInput.selectionEnd = messageInput.value.length;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    return;
  }
}

function sendChatMessage() {
  if (!messageInput) return;
  const text = messageInput.value.trim();
  if (!text) return;

  if (!db && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
    db = firebase.database();
  }
  if (!db && roomId) {
    initializeFirebase(firebaseConfig);
  }
  if (!db) {
    Logger.error('[FilmSync] Firebase veritabanı bağlantısı henüz hazır değil.');
    return;
  }

  soundEffects.playSendTap();

  db.ref(`rooms/${roomId}/messages`).push({
    username: username || 'Anonim',
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });
  messageInput.value = '';
  const sendBtn = document.getElementById('filmsyncSendBtn');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.4';
  }
  
  if (messageInput) {
    messageInput.focus();
  }
  isInputFocused = true;
  lastTypingTime = 0;
  isMouseInsideChatPanel = false;
  startAutoHideTimer(AUTO_HIDE_DELAY);
}

function sendSystemMessage(text) {
  if (!db || !roomId) return;
  db.ref(`rooms/${roomId}/messages`).push({
    username: 'Sistem',
    message: text,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
    isSystem: true
  });
}

function appendMessage({ username: msgUser, message, isSystem, timestamp }) {
  if (!messageList) {
    messagesQueue.push({ username: msgUser, message, isSystem, timestamp });
    return;
  }

  const row = document.createElement('div');
  row.classList.add('filmsync-msg-row');

  const dateObj = timestamp ? new Date(timestamp) : new Date();
  const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (isSystem) {
    row.classList.add('system');
    const systemBubble = document.createElement('div');
    systemBubble.className = 'filmsync-msg-bubble';
    systemBubble.textContent = message;
    row.appendChild(systemBubble);
  } else {
    const isSelf = msgUser === username;
    row.classList.add(isSelf ? 'self' : 'other');

    const msgSender = document.createElement('div');
    msgSender.className = 'filmsync-msg-sender';
    msgSender.textContent = msgUser + ' ';

    const timeSpan = document.createElement('span');
    timeSpan.setAttribute('style', 'font-size: 12px !important; color: rgba(255, 255, 255, 0.65) !important; font-weight: 500 !important; margin-left: 6px !important; text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;');
    timeSpan.textContent = timeStr;
    msgSender.appendChild(timeSpan);

    const msgBubble = document.createElement('div');
    msgBubble.className = 'filmsync-msg-bubble';
    msgBubble.textContent = message;

    row.appendChild(msgSender);
    row.appendChild(msgBubble);
  }

  messageList.appendChild(row);
  while (messageList.children.length > 35) {
    messageList.removeChild(messageList.firstChild);
  }
  messageList.scrollTop = messageList.scrollHeight;
}

function updateUsersDisplay(usersList) {
  if (!userListDisplay) return;
  userListDisplay.innerHTML = '';
}

// --- 🔔 2026 FROSTED GLASS BİLDİRİM TOAST MOTORU ---
function showNotificationToast(sender, text) {
  let toastContainer = document.getElementById('filmsync-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'filmsync-toast-container';
    const rootEl = document.getElementById('filmsync-root') || document.body;
    rootEl.appendChild(toastContainer);
  }

  while (toastContainer.children.length >= 3) {
    toastContainer.firstElementChild.remove();
  }

  const toast = document.createElement('div');
  toast.classList.add('filmsync-toast');
  
  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';

  if (sender && sender !== 'Film Partisi 🍿' && sender !== 'Sistem' && sender !== 'Film Partisi') {
    const senderSpan = document.createElement('span');
    senderSpan.style.fontWeight = '700';
    senderSpan.style.color = '#ff4d56';
    senderSpan.style.marginRight = '6px';
    senderSpan.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.6)';
    senderSpan.textContent = `${sender}:`;
    toastBody.appendChild(senderSpan);
    const textNode = document.createTextNode(text);
    toastBody.appendChild(textNode);
  } else {
    toastBody.textContent = text;
  }

  toast.appendChild(toastBody);
  toastContainer.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('active');
  });

  toast.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
    
    showPanelAndToolbar();
    if (chatPanel && !chatPanel.classList.contains('active')) {
      toggleChatPanel();
    }
  });

  const duration = 4500;
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
    }
  }, duration);
}

// --- 🎬 YENİ BÖLÜM / FİLM BİLGİLENDİRME BİLDİRİMİ (GERİ SAYIMLI, SIFIR OTOMATİK YÖNLENDİRME) ---
function showMovieRedirectNotification(targetUrl, targetTitle = '') {
  // 1. Oda sahibi (host) kesinlikle bildirim almaz ve yönlendirilmez (Host serbestçe gezinir)
  if (userId && hostId && userId === hostId) return;
  if (isEmbedUrl(targetUrl)) {
    Logger.log('[FilmSync] Hedef URL bir embed adresi olduğundan yönlendirme toastu engellendi:', targetUrl);
    return;
  }
  if (areUrlsSameMovie(window.location.href, targetUrl)) {
    return;
  }
  if (document.getElementById('filmsync-redirect-toast')) return;

  let toastContainer = document.getElementById('filmsync-toast-container');
  if (!toastContainer) {
    toastContainer = document.getElementById('filmsync-root') || document.body;
  }

  const toast = document.createElement('div');
  toast.id = 'filmsync-redirect-toast';
  toast.classList.add('filmsync-toast');
  toast.setAttribute('style', 'background: rgba(14, 22, 38, 0.92) !important; backdrop-filter: blur(24px) saturate(190%) !important; -webkit-backdrop-filter: blur(24px) saturate(190%) !important; border: 1px solid rgba(69, 243, 255, 0.45) !important; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(69, 243, 255, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.20) !important; cursor: pointer !important; padding: 14px 18px !important; border-radius: 14px !important; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;');
  
  let countdown = 5;
  let isDismissed = false;

  const closeBtn = document.createElement('span');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('title', 'Kapat');
  closeBtn.setAttribute('style', 'position: absolute; top: 10px; right: 12px; width: 22px; height: 22px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.18); color: rgba(255, 255, 255, 0.85); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; cursor: pointer; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.2s ease; z-index: 10;');

  const toastHeader = document.createElement('div');
  toastHeader.className = 'filmsync-toast-header';
  toastHeader.setAttribute('style', 'display: flex !important; align-items: center !important; gap: 6px !important; color: #45f3ff !important; font-size: 13.5px !important; font-weight: 800 !important; text-shadow: 0 1px 3px rgba(0,0,0,0.7) !important; margin-bottom: 5px !important;');
  toastHeader.textContent = '🎬 Yeni Bölüm / Film Başladı';

  const toastBody = document.createElement('div');
  toastBody.className = 'filmsync-toast-body';
  toastBody.setAttribute('style', 'color: #ffffff !important; font-weight: 500 !important; font-size: 13px !important; line-height: 1.45 !important; text-shadow: 0 1px 3px rgba(0,0,0,0.6) !important; padding-right: 18px;');
  
  function updateToastContent() {
    const displayTitle = targetTitle ? `"${targetTitle}"` : 'Yeni bölüme / filme';
    toastBody.innerHTML = `<span>${displayTitle} açıldı.</span><br><span style="color: #6ee7b7; font-weight: 600; text-decoration: underline;">Yönlendirmek için tıklayın</span> <span style="color: rgba(255,255,255,0.6); font-size: 11.5px;">(${countdown} sn)</span>`;
  }
  updateToastContent();

  const countInterval = setInterval(() => {
    if (isDismissed) {
      clearInterval(countInterval);
      return;
    }
    countdown--;
    if (countdown > 0) {
      updateToastContent();
    } else {
      clearInterval(countInterval);
      isDismissed = true;
      window.filmsyncDismissedUrl = targetUrl;
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 350);
      // 🛑 KESİNLİKLE OTOMATİK YÖNLENDİRME YAPILMAZ! 5 sn geri sayımdan sonra kendiliğinden kaybolur.
    }
  }, 1000);

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    isDismissed = true;
    clearInterval(countInterval);
    window.filmsyncDismissedUrl = targetUrl;
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
  });

  toast.addEventListener('click', () => {
    isDismissed = true;
    clearInterval(countInterval);
    window.filmsyncDismissedUrl = targetUrl;
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 350);
    chrome.runtime.sendMessage({ type: 'redirect-tab', url: normalizeMovieUrl(targetUrl) });
  });

  toast.appendChild(closeBtn);
  toast.appendChild(toastHeader);
  toast.appendChild(toastBody);

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('active');
  });
}

// --- 📺 EVRENSEL TAM EKRAN DESTEĞİ (ANA PENCERE & IFRAME KOORDİNASYONU) ---
function setupFullscreenListener() {
  if (isFullscreenListenersAttached) return;
  isFullscreenListenersAttached = true;

  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  events.forEach(eventName => {
    document.addEventListener(eventName, () => {
      const fsElement = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;

      if (window !== window.top) {
        // IFRAME BAĞLAMINDA (Dizipal, Vidmoly, HDFilmCehennemi, FullHDFilmizlesene player içi tam ekran)
        if (fsElement) {
          Logger.log('[FilmSync Iframe FS] Iframe tam ekran oldu, arayüz enjekte ediliyor.');
          createChatUI();
          
          const root = document.getElementById('filmsync-root');
          const safeContainer = (fsElement.tagName === 'VIDEO' || fsElement.tagName === 'IFRAME')
            ? (fsElement.parentElement || document.body || document.documentElement)
            : fsElement;
          if (root && safeContainer && safeContainer !== root) {
            safeContainer.appendChild(root);
            root.style.position = 'fixed';
            root.style.zIndex = '2147483647';
          }
          
          initializeFirebase(firebaseConfig);
        } else if (!isParentIframeFullscreen) {
          Logger.log('[FilmSync Iframe FS] Iframe tam ekrandan çıktı, arayüz siliniyor.');
          removeChatUI();
        }
      } else {
        // ANA SAYFA (TOP WINDOW) BAĞLAMINDA
        const root = document.getElementById('filmsync-root');
        if (!root) return;

        // KRİTİK DÜZELTME: Eğer tam ekrana geçen element bir <iframe> ise,
        // <iframe> etiketinin içine <div> eklenirse tarayıcı onu GİZLER!
        // Bu durumda alt iframe'e haber verip sohbet baloncuğunu doğrudan tam ekran olan iframe içinde gösteriyoruz!
        if (fsElement && fsElement.tagName === 'IFRAME') {
          try {
            fsElement.contentWindow?.postMessage({
              type: 'filmsync-parent-iframe-fullscreen',
              isFullscreen: true
            }, '*');
          } catch (e) {}
          broadcastToAllFrames({
            type: 'filmsync-parent-iframe-fullscreen',
            isFullscreen: true
          });
          return;
        } else {
          broadcastToAllFrames({
            type: 'filmsync-parent-iframe-fullscreen',
            isFullscreen: false
          });
        }

        // Eğer tam ekrana geçen element doğrudan <video> ise üst kapsayıcısını kullan
        const targetContainer = (!fsElement)
          ? document.body
          : (fsElement.tagName === 'VIDEO' ? (fsElement.parentElement || document.body) : fsElement);

        if (targetContainer) {
          targetContainer.appendChild(root);
          root.style.position = 'fixed';
          root.style.zIndex = '2147483647';
        }
        
        Logger.log(`[FilmSync] Tam ekran: root → ${fsElement ? 'fullscreenElement' : 'body'}`);
      }
    });
  });
}

// --- ⚙️ AUTO-JOIN (DAVET LİNKİ) EKRAN EFEKTİ ---
function showAutoJoinOverlay(roomName) {
  if (document.getElementById('filmsync-autojoin-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'filmsync-autojoin-overlay';
  overlay.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(9, 11, 18, 0.76); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2147483647 !important; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  overlay.innerHTML = `
    <div style="background: rgba(18, 21, 33, 0.82); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; padding: 36px 44px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.18); display: flex; flex-direction: column; align-items: center; text-align: center; position: relative;">
      <button id="filmsyncAutoJoinCancelBtn" style="position: absolute; top: 14px; right: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); color: rgba(255, 255, 255, 0.85); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Vazgeç (Escape)">✕</button>
      <div style="font-size: 32px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Film Partisi 🍿</div>
      <div id="filmsync-autojoin-text" style="font-size: 16px; color: #45f3ff; font-weight: 600; margin-bottom: 24px; text-shadow: 0 0 12px rgba(69, 243, 255, 0.4);"></div>
      <div style="width: 44px; height: 44px; border: 4px solid rgba(69, 243, 255, 0.18); border-top-color: #45f3ff; border-radius: 50%; animation: spin 1s linear infinite; box-shadow: 0 0 16px rgba(69, 243, 255, 0.35);"></div>
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `;
  const textEl = overlay.querySelector('#filmsync-autojoin-text');
  if (textEl) textEl.textContent = `"${roomName}" Partisine Katılınıyor...`;
  
  const cancelBtn = overlay.querySelector('#filmsyncAutoJoinCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => overlay.remove());
  }

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);

  document.body.appendChild(overlay);
}

// --- 🏷️ İSİM PROMPT MODALI ---
function showNamePromptModal(roomName, callback) {
  if (document.getElementById('filmsync-name-prompt-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'filmsync-name-prompt-modal';
  modal.setAttribute('style', 'position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(9, 11, 18, 0.76); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); display: flex; align-items: center; justify-content: center; z-index: 2147483647 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;');

  modal.innerHTML = `
    <div style="width: 340px; background: rgba(18, 21, 33, 0.82); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; padding: 26px; box-shadow: 0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18); text-align: center; color: #fff; position: relative;">
      <button id="filmsyncPromptCloseBtn" style="position: absolute; top: 14px; right: 14px; width: 26px; height: 26px; border-radius: 50%; background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.16); color: rgba(255, 255, 255, 0.85); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; line-height: 1; backdrop-filter: blur(12px) saturate(180%); -webkit-backdrop-filter: blur(12px) saturate(180%); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);" title="Kapat (Escape)">✕</button>
      <div style="font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">Film Partisi 🍿</div>
      <div id="filmsync-prompt-room-title" style="font-size: 14px; color: #45f3ff; margin-bottom: 22px; font-weight: 600; text-shadow: 0 0 10px rgba(69, 243, 255, 0.3);"></div>
      
      <div style="text-align: left; margin-bottom: 18px;">
        <label style="font-size: 12px; text-transform: uppercase; color: #45f3ff; font-weight: 700; display: block; margin-bottom: 6px; letter-spacing: 0.5px;">Adınız</label>
        <input type="text" id="promptNameInput" placeholder="Adınızı yazın" style="width: 100%; box-sizing: border-box; padding: 11px 14px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.16); border-radius: 12px; color: #fff; font-size: 14px; outline: none; backdrop-filter: blur(14px) saturate(180%); -webkit-backdrop-filter: blur(14px) saturate(180%); transition: border 0.3s, box-shadow 0.3s;" />
      </div>
      
      <button id="promptJoinBtn" style="width: 100%; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 12px; background: linear-gradient(135deg, #e50914, #ff3d47); color: #fff; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.3);">Partiye Katıl</button>
    </div>
  `;

  const titleEl = modal.querySelector('#filmsync-prompt-room-title');
  if (titleEl) titleEl.textContent = `"${roomName}" partisine katılıyorsunuz.`;

  const closeBtn = modal.querySelector('#filmsyncPromptCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.remove());
  }

  document.body.appendChild(modal);

  const nameInput = document.getElementById('promptNameInput');
  const joinBtn = document.getElementById('promptJoinBtn');

  nameInput.focus();

  try {
    chrome.storage.local.get(['username'], (res) => {
      if (res && res.username && nameInput) {
        nameInput.value = res.username;
        nameInput.select();
      }
    });
  } catch(e) {}

  const handleJoin = () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert('Lütfen adınızı girin.');
      return;
    }
    modal.remove();
    callback(name);
  };

  joinBtn.addEventListener('click', handleJoin);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  });

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);
}

// --- 🎬 NETFLIX DETAY KARTLARINA "FİLM PARTİSİ BAŞLAT" BUTONU ENJEKSİYONU ---
function injectNetflixStartButton() {
  const buttonContainers = document.querySelectorAll('.previewModal--buttons, .jawbone-actions, .l-play-parent');
  buttonContainers.forEach(container => {
    if (container.querySelector('.filmsync-netflix-start-btn')) return;

    const startBtn = document.createElement('button');
    startBtn.className = 'filmsync-netflix-start-btn';
    startBtn.setAttribute('style', `
      background-color: #e50914;
      background-image: linear-gradient(135deg, #e50914, #ff3d47);
      backdrop-filter: blur(12px) saturate(180%);
      -webkit-backdrop-filter: blur(12px) saturate(180%);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 15px !important;
      cursor: pointer;
      margin-left: 10px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    `);
    startBtn.innerHTML = '<span>Film Partisi Başlat</span> 🍿';

    startBtn.addEventListener('mouseover', () => {
      startBtn.style.transform = 'scale(1.04) translateY(-1px)';
      startBtn.style.boxShadow = '0 6px 24px rgba(229, 9, 20, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
    });
    startBtn.addEventListener('mouseout', () => {
      startBtn.style.transform = 'scale(1) translateY(0)';
      startBtn.style.boxShadow = '0 4px 18px rgba(229, 9, 20, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
    });

    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const playBtn = container.querySelector('a[href*="/watch/"], button[aria-label*="Oynat"], button[aria-label*="Play"], .playLink');
      if (playBtn) {
        const generate4LetterCode = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let result = '';
          for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        const randomRoomId = generate4LetterCode();
        const randomUserId = 'user_' + Math.random().toString(36).substr(2, 9);

        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        const tempDb = firebase.database();
        
        let playUrl = '';
        if (playBtn.tagName === 'A' && playBtn.href) {
          playUrl = playBtn.href;
        } else {
          const movieCard = container.closest('[id*="post-"], .card-container, .previewModal--wrapper, .jawbone-container');
          const movieLink = movieCard?.querySelector('a[href*="/watch/"]');
          playUrl = movieLink ? movieLink.href : window.location.href;
        }

        tempDb.ref(`rooms/${randomRoomId}`).set({
          password: '',
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          hostId: randomUserId,
          hostOnly: false,
          lastState: {
            isPlaying: true,
            currentTime: 0,
            url: normalizeMovieUrl(playUrl),
            platformName: 'Netflix',
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
          }
        }).then(() => {
          chrome.runtime.sendMessage({ type: 'get-tab-id' }, (tabResponse) => {
            const currentTabId = tabResponse ? tabResponse.tabId : null;
            chrome.storage.local.get(['username'], (res) => {
              const savedName = res.username || '';
              chrome.storage.local.set({
                roomId: randomRoomId,
                userId: randomUserId,
                hostId: randomUserId,
                username: savedName,
                password: '',
                hostOnly: false,
                selectedAvatar: '🍿',
                activeTabId: currentTabId
              }, () => {
                const inviteUrl = `https://bekircansnk.github.io/filmsync-watch-party/?join=${encodeURIComponent(randomRoomId)}&pass=`;
                
                try {
                  const dummy = document.createElement("textarea");
                  document.body.appendChild(dummy);
                  dummy.value = inviteUrl;
                  dummy.select();
                  document.execCommand("copy");
                  document.body.removeChild(dummy);
                } catch (err) {
                  navigator.clipboard.writeText(inviteUrl);
                }

                playBtn.click();
              });
            });
          });
        }).catch(err => {
          Logger.error('[FilmSync] Oynatma butonuyla oda kurulumu hatası:', err);
          playBtn.click();
        });
      } else {
        alert('Film oynatma butonu bulunamadı.');
      }
    });

    container.appendChild(startBtn);
  });
}

function startButtonObserver() {
  if (!window.location.host.includes('netflix.com')) return;
  
  if (netflixButtonObserver) {
    netflixButtonObserver.disconnect();
    netflixButtonObserver = null;
  }

  if (window.location.pathname.includes('/watch')) {
    return;
  }

  const debouncedInject = () => {
    if (netflixButtonDebounceTimer) clearTimeout(netflixButtonDebounceTimer);
    netflixButtonDebounceTimer = setTimeout(() => {
      if (!window.location.pathname.includes('/watch')) {
        injectNetflixStartButton();
      }
    }, 400);
  };

  debouncedInject();

  netflixButtonObserver = new MutationObserver(() => {
    if (window.location.pathname.includes('/watch')) {
      if (netflixButtonObserver) {
        netflixButtonObserver.disconnect();
        netflixButtonObserver = null;
      }
      return;
    }
    debouncedInject();
  });

  const targetNode = document.querySelector('.mainView') || document.body;
  netflixButtonObserver.observe(targetNode, { childList: true, subtree: true });
}

// --- 🖥️ TAM EKRAN VE SOHBET OTOMATİK GİZLEME MOTORU ---
function setupFullscreenIdleDetector() {
  if (isFullscreenIdleDetectorAttached) return;
  isFullscreenIdleDetectorAttached = true;

  const handleMouseMove = () => {
    const now = Date.now();
    if (now - lastMouseMoveTime < 150) return; // 150ms throttle
    lastMouseMoveTime = now;
    
    // Eğer alt iframe içindeysek, fare hareketini ana pencereye de ilet ki ana penceredeki sohbet baloncuğu uyansın!
    if (window !== window.top) {
      try {
        window.top.postMessage({ type: 'filmsync-iframe-mousemove' }, '*');
      } catch (e) {}
    }

    showPanelAndToolbar();
    resetIdleTimer(isInputFocused ? 5000 : 3500);

    if (chatPanel && chatPanel.classList.contains('active') && !isInputFocused) {
      startAutoHideTimer(AUTO_HIDE_DELAY);
    }
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('keydown', handleMouseMove, { passive: true });

  const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
  fsEvents.forEach(eventName => {
    document.addEventListener(eventName, () => {
      isFullscreen = !!(document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement ||
                        isParentIframeFullscreen);
      
      const toolbar = document.getElementById('filmsync-mini-toolbar');
      const panel = document.getElementById('filmsync-chat-panel');
      
      if (isFullscreen) {
        if (navigator.keyboard && typeof navigator.keyboard.lock === 'function') {
          navigator.keyboard.lock(['Escape']).catch(() => {});
        }
      } else {
        if (navigator.keyboard && typeof navigator.keyboard.unlock === 'function') {
          try { navigator.keyboard.unlock(); } catch (err) {}
        }
        clearTimeout(idleTimer);
        if (toolbar && (!panel || !panel.classList.contains('active'))) {
          toolbar.style.opacity = '1';
          toolbar.style.pointerEvents = 'auto';
        }
        if (panel && panel.classList.contains('active')) {
          panel.style.opacity = '1';
          panel.style.pointerEvents = 'auto';
        }
      }
    });
  });
}

// --- ⚙️ YARDIMCI OTOMATİK GİZLEME FONKSİYONLARI ---
function showPanelAndToolbar() {
  const toolbar = document.getElementById('filmsync-mini-toolbar');
  const panel = document.getElementById('filmsync-chat-panel');
  if (toolbar && (!panel || !panel.classList.contains('active'))) {
    toolbar.classList.remove('panel-active');
    toolbar.style.opacity = '1';
    toolbar.style.pointerEvents = 'auto';
  }
  if (panel && panel.classList.contains('active')) {
    panel.style.opacity = '1';
    panel.style.pointerEvents = 'auto';
  }
  clearTimeout(idleTimer);
}

function startAutoHideTimer(duration = AUTO_HIDE_DELAY) {
  clearTimeout(autoHideTimer);
  autoHideTimer = setTimeout(() => {
    if (messageInput && messageInput.value.trim().length > 0) {
      return;
    }
    if (isMouseInsideChatPanel) {
      startAutoHideTimer(AUTO_HIDE_DELAY);
      return;
    }
    const now = Date.now();
    if (panelForceOpenUntil && now < panelForceOpenUntil) {
      startAutoHideTimer(Math.max(1000, panelForceOpenUntil - now));
      return;
    }
    if (lastTypingTime && (now - lastTypingTime < duration)) {
      startAutoHideTimer(duration - (now - lastTypingTime));
      return;
    }
    hideChatPanel(true);
  }, duration);
}

function hideChatPanel() {
  const force = arguments[0];
  if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
  if (!chatPanel) return;
  if (!force && messageInput && messageInput.value.trim().length > 0) return;

  if (chatPanel.classList.contains('active')) {
    chatPanel.classList.remove('active');
    chatPanel.style.opacity = '0';
    chatPanel.style.pointerEvents = 'none';
    document.body?.classList.remove('filmsync-sidebar-open');
    
    if (messageInput && document.activeElement === messageInput) {
      messageInput.blur();
    }
    isInputFocused = false;
    isMouseInsideChatPanel = false;
    broadcastChatState(false);

    const miniToolbar = document.getElementById('filmsync-mini-toolbar');
    if (miniToolbar) {
      miniToolbar.classList.remove('panel-active');
      miniToolbar.style.opacity = '1';
      miniToolbar.style.pointerEvents = 'auto';
    }

    const chatToggleBtn = document.getElementById('fs-tool-toggle-chat');
    if (chatToggleBtn) {
      chatToggleBtn.setAttribute('data-tooltip', 'Sohbeti Göster');
      chatToggleBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';
    }
    const logoToggleBtn = document.querySelector('.filmsync-tool-btn.tp-logo');
    if (logoToggleBtn) {
      logoToggleBtn.setAttribute('data-tooltip', 'Sohbet');
      logoToggleBtn.title = 'Sohbet (Enter)';
    }
  }
}

function resetIdleTimer(duration = AUTO_HIDE_DELAY) {
  startAutoHideTimer(duration);
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (isFullscreen) {
      const toolbar = document.getElementById('filmsync-mini-toolbar');
      if (toolbar && (!chatPanel || !chatPanel.classList.contains('active'))) {
        toolbar.style.opacity = '0';
        toolbar.style.pointerEvents = 'none';
      }
    }
  }, duration);
}

// --- 🖥️ IFRAME TAM EKRAN KORUYUCUSU (DİZİPAL, Vidmoly, HDFilmCehennemi, FullHDFilmizlesene VB.) ---
function startIframeFullscreenKeeper() {
  if (window === window.top) return;
  
  if (iframeKeeperInterval) clearInterval(iframeKeeperInterval);
  iframeKeeperInterval = setInterval(() => {
    const fsElement = document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.mozFullScreenElement || 
                      document.msFullscreenElement;
                      
    const root = document.getElementById('filmsync-root');
    const isEffectivelyFullscreen = !!(fsElement || (isParentIframeFullscreen && (videoElement || findBestVideoElement())));
    
    if (isEffectivelyFullscreen) {
      if (!root) {
        Logger.log('[FilmSync Iframe Keeper] Tam ekran algılandı, UI oluşturuluyor.');
        createChatUI();
        initializeFirebase(firebaseConfig);
      }
      
      const currentRoot = document.getElementById('filmsync-root');
      const targetContainer = (fsElement && fsElement.tagName !== 'VIDEO' && fsElement.tagName !== 'IFRAME')
        ? fsElement
        : (document.body || document.documentElement);
      if (currentRoot && targetContainer && currentRoot.parentNode !== targetContainer) {
        targetContainer.appendChild(currentRoot);
        currentRoot.style.position = 'fixed';
        currentRoot.style.zIndex = '2147483647';
      }
    } else {
      if (root) {
        Logger.log('[FilmSync Iframe Keeper] Tam ekrandan çıkış algılandı, UI temizleniyor.');
        removeChatUI();
      }
    }
  }, 1500);
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function isEmbedUrl(urlStr) {
  if (!urlStr) return false;
  const lower = urlStr.toLowerCase();
  return (
    lower.includes('/embed') ||
    lower.includes('embed-') ||
    lower.includes('embed.') ||
    lower.includes('vidsrc') ||
    lower.includes('vidmoly') ||
    lower.includes('rapidrame') ||
    lower.includes('closeload') ||
    lower.includes('player.php') ||
    lower.includes('video.php') ||
    lower.includes('stream.php')
  );
}

function attachGlobalKeyListeners() {
  if (isGlobalKeyListenersAttached) return;
  isGlobalKeyListenersAttached = true;
  window.addEventListener('keydown', handleGlobalEnterKey, true);
  document.addEventListener('keydown', handleGlobalEnterKey, true);
  window.addEventListener('keyup', handleGlobalKeySuppression, true);
  document.addEventListener('keyup', handleGlobalKeySuppression, true);
  window.addEventListener('keypress', handleGlobalKeySuppression, true);
  document.addEventListener('keypress', handleGlobalKeySuppression, true);
}

// Global Chat-First Klavye Yakalayıcısı (Window & Document Çift Yakalama)
attachGlobalKeyListeners();

// Sekme veya pencere odağı geri geldiğinde (örn. Popup kapandığında) sohbet arayüzünün açık ve hazır olduğundan emin ol
if (window === window.top) {
  const ensureChatUIOnWindowFocus = () => {
    if (!roomId) return;
    if (shouldShowChatUIInTop()) {
      if (!document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
      }
      if (panelForceOpenUntil && Date.now() < panelForceOpenUntil) {
        openChatPanelAndFocus(false);
      }
    }
  };
  window.addEventListener('focus', ensureChatUIOnWindowFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ensureChatUIOnWindowFocus();
    }
  });

  // Doğrudan CustomEvent (dispatchEvent) ile sohbet penceresi açma/tetikleme desteği
  const handleCustomOpenChatDispatch = (e) => {
    const detail = (e && e.detail) ? e.detail : null;
    if (detail && detail.roomId) {
      applyImmediateRoomPayload(detail);
    }
    if (roomId) {
      initializeFirebase(firebaseConfig);
      createChatUI();
      openChatPanelAndFocus(true);
      startUIKeeper();
    } else {
      init(true);
    }
  };
  window.addEventListener('filmsync-open-chat', handleCustomOpenChatDispatch);
  document.addEventListener('filmsync-open-chat', handleCustomOpenChatDispatch);
}

function syncRoomAttributeToDOM() {
  try {
    if (roomId) {
      document.documentElement.setAttribute('data-filmsync-room', roomId);
      document.documentElement.setAttribute('data-filmsync-room-active', 'true');
    } else {
      document.documentElement.removeAttribute('data-filmsync-room');
      document.documentElement.setAttribute('data-filmsync-room-active', 'false');
    }
  } catch (e) {}
}

function ensureRootInFullscreenElement() {
  const root = document.getElementById('filmsync-root');
  if (!root) return;
  const fsElement = document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement;
  if (fsElement && fsElement.tagName !== 'VIDEO' && fsElement.tagName !== 'IFRAME') {
    if (root.parentNode !== fsElement) {
      fsElement.appendChild(root);
    }
  } else if (document.body && root.parentNode !== document.body) {
    document.body.appendChild(root);
  }
}

// Cross-Frame Köprüsü (Iframe içinden basılan tuşları, fare hareketini ve video durumunu ana pencereye aktarır)
window.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'filmsync-open-chat' || (event.data.source === 'filmsync-inject' && event.data.action === 'open-chat')) {
    if (window === window.top) {
      if (event.data.roomId) applyImmediateRoomPayload(event.data);
      if (roomId) {
        initializeFirebase(firebaseConfig);
        createChatUI();
        openChatPanelAndFocus(true);
        startUIKeeper();
      } else {
        init(true);
      }
    }
    return;
  }

  if (event.data.type === 'filmsync-query-chat-state') {
    const panel = document.getElementById('filmsync-chat-panel');
    const isCurrentlyOpen = panel ? panel.classList.contains('active') : isChatOpenInTop;
    try {
      event.source?.postMessage({
        type: 'filmsync-chat-state',
        isOpen: !!isCurrentlyOpen,
        isRoomActive: !!roomId,
        roomId: roomId,
        userId: userId,
        username: username,
        hostId: hostId,
        hostOnly: hostOnly
      }, '*');
    } catch (e) {}
  } else if (event.data.type === 'filmsync-chat-state') {
    isChatOpenInTop = !!event.data.isOpen;
    document.documentElement.setAttribute('data-filmsync-chat-open', isChatOpenInTop ? 'true' : 'false');
    if (event.data.isRoomActive !== undefined) {
      isRoomActiveInTop = !!event.data.isRoomActive;
      document.documentElement.setAttribute('data-filmsync-room-active', isRoomActiveInTop ? 'true' : 'false');
    }
    if (window !== window.top && event.data.roomId && !roomId) {
      roomId = event.data.roomId;
      if (event.data.userId) userId = event.data.userId;
      if (event.data.username) username = event.data.username;
      if (event.data.hostId) hostId = event.data.hostId;
      if (event.data.hostOnly !== undefined) hostOnly = event.data.hostOnly;
      syncRoomAttributeToDOM();
      startVideoTracking();
      startDriftCorrection();
      setupFullscreenListener();
      setupFullscreenIdleDetector();
      startIframeFullscreenKeeper();
    }
  } else if (event.data.type === 'filmsync-parent-iframe-fullscreen') {
    isParentIframeFullscreen = !!event.data.isFullscreen;
  } else if (event.data.type === 'filmsync-iframe-fullscreen-request') {
    ensureRootInFullscreenElement();
  } else if (event.data.type === 'filmsync-reload-pause-guard') {
    isReloadPauseGuardActive = true;
    reloadPauseGuardUntil = event.data.until || (Date.now() + 8000);
    if (videoElement) {
      PlayerAdapter.pause();
    }
  } else if (event.data.type === 'filmsync-iframe-mousemove') {
    if (window === window.top) {
      showPanelAndToolbar();
      resetIdleTimer(isInputFocused ? 5000 : 3500);
    }
  } else if (event.data.type === 'filmsync-toggle-video-play') {
    if (videoElement) {
      if (videoElement.paused) PlayerAdapter.play();
      else PlayerAdapter.pause();
    }
  } else if (event.data.type === 'filmsync-iframe-time-sync') {
    if (typeof event.data.currentTime === 'number') {
      lastIframeVideoTime = event.data.currentTime;
    }
  } else if (event.data.type === 'filmsync-iframe-media-event') {
    if (window === window.top) {
      if (typeof event.data.currentTime === 'number') {
        lastIframeVideoTime = event.data.currentTime;
      }
      sendMediaEvent(event.data.isPlaying, event.data.currentTime, event.data.action);
    }
  } else if (event.data.type === 'filmsync-iframe-has-video') {
    if (window === window.top) {
      hasChildFrameVideo = true;
      if (typeof event.data.currentTime === 'number') {
        lastIframeVideoTime = event.data.currentTime;
      }
      if (roomId && !document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
      }
      // Eğer ana pencerede oda aktifse ve odaya henüz bu sayfanın URL'si veya başlığı yazılmadıysa hemen güncelle
      if (db && roomId && (userId === hostId || !hostOnly) && !isEmbedUrl(window.location.href)) {
        const cleanTopUrl = normalizeMovieUrl(window.location.href);
        if (cleanTopUrl) {
          db.ref(`rooms/${roomId}/lastState`).update({
            url: cleanTopUrl,
            pageTitle: getCleanPageTitle(),
            platformName: detectPlatformName(cleanTopUrl)
          });
        }
      }
    }
  } else if (event.data.type === 'filmsync-iframe-sync-top-url') {
    if (window === window.top && db && roomId && (userId === hostId || !hostOnly) && !isEmbedUrl(window.location.href)) {
      const cleanTopUrl = normalizeMovieUrl(window.location.href);
      if (cleanTopUrl) {
        db.ref(`rooms/${roomId}/lastState`).update({
          url: cleanTopUrl,
          pageTitle: getCleanPageTitle(),
          platformName: detectPlatformName(cleanTopUrl)
        });
      }
    }
  } else if (event.data.type === 'filmsync-mainworld-keydown' || event.data.type === 'filmsync-iframe-keydown') {
    if (window !== window.top) return;
    syncRoomAttributeToDOM();
    const now = Date.now();
    if (lastForwardedKeySignature === `${event.data.key}_${now}` || (now - lastForwardedKeyTime < 25 && lastForwardedKeyVal === event.data.key)) {
      return;
    }
    lastForwardedKeyTime = now;
    lastForwardedKeyVal = event.data.key;

    try { window.focus(); } catch (e) {}
    if (!chatPanel) chatPanel = document.getElementById('filmsync-chat-panel');
    if (!messageInput) messageInput = document.getElementById('filmsyncMsgInput');
    if ((!chatPanel || !messageInput) && roomId) {
      createChatUI();
      chatPanel = document.getElementById('filmsync-chat-panel');
      messageInput = document.getElementById('filmsyncMsgInput');
    }
    if (!chatPanel || !messageInput) return;

    // handleGlobalEnterKey doğrudan hem kapalı panel açılışını hem de karakter yazımını tek seferde yönetir
    handleGlobalEnterKey({
      key: event.data.key,
      code: event.data.code,
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: () => {},
      stopPropagation: () => {},
      stopImmediatePropagation: () => {}
    });
  }
});

// Iframe başlangıcında ana pencere sohbet durumunu sorgula
if (window !== window.top) {
  try {
    window.top.postMessage({ type: 'filmsync-query-chat-state' }, '*');
  } catch (e) {}
}

  if (typeof window !== 'undefined') {
    window.hideChatPanel = hideChatPanel;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.hideChatPanel = hideChatPanel;
  }
})();
