# FilmSync Çoklu Oynatıcı Adaptörleri Analiz Raporu 🍿

## 1. Giriş ve Amaç
Bu rapor, Milestone 1 kapsamında FilmSync uygulamasının Netflix, YouTube, Disney+ ve Genel HTML5 oynatıcı adaptörlerini entegre etmesi için gereken teknik analizleri, enjeksiyon stratejilerini ve API entegrasyon detaylarını sunmaktadır. Teleparty uzantısının orijinal kaynak kodları referans alınarak güvenilir ve performanslı bir çözüm hedeflenmiştir.

---

## 2. Netflix API Entegrasyon Detayları

Netflix, standart HTML5 `<video>` elementi üzerinde doğrudan seek veya play/pause işlemlerine izin vermez (DRM ve Cadmium oynatıcı mimarisi nedeniyle). Bu nedenle işlemlerin, sayfa bağlamına (main world) enjekte edilen `inject.js` üzerinden Netflix Cadmium API kullanılarak gerçekleştirilmesi gerekir.

### A. Player Nesnesine Erişim
Netflix Cadmium API'sine erişmek için enjekte edilen script içerisinde şu metot kullanılır:
```javascript
function getNetflixPlayer() {
  try {
    const netflixObj = window.netflix;
    if (!netflixObj) return null;

    const videoPlayer = netflixObj.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
    if (!videoPlayer) return null;

    const sessionIds = videoPlayer.getAllPlayerSessionIds();
    if (!sessionIds || sessionIds.length === 0) return null;

    // "watch-" ile başlayan aktif oturum ID'si tespit edilir
    const watchSessionId = sessionIds.find(id => id.includes('watch')) || sessionIds[0];
    return videoPlayer.getVideoPlayerBySessionId(watchSessionId);
  } catch (e) {
    console.error('[FilmSync Inject] Netflix player eldesi başarısız:', e);
    return null;
  }
}
```

### B. Oynatıcı Kontrolleri (Play / Pause / Seek)
- **Play:** `player.play()`
- **Pause:** `player.pause()`
- **Seek:** `player.seek(seconds * 1000)` (Netflix API milisaniye cinsinden seek kabul eder.)
- **Durum Sorgulama (Süre & Duraklatma):**
  - Zaman Elde Etme: `player.getSegmentTime() ?? player.getCurrentTime()`
  - Oynatım Durumu: `player.isPaused()`
  - Buffering Durumu: `player.getBusy() !== null`

---

## 3. Disney+ API Entegrasyon Detayları

Disney+, video oynatımı ve kontrolü için `disney-web-player` custom elementi altında barındırılan bir `mediaPlayer` API'si sunar. Teleparty analizleri doğrultusunda, bu platformda hem resmi API hem de Shadow DOM tabanlı tıklama simülasyonu (fallback) içeren çift katmanlı bir yaklaşım uygulanacaktır.

### A. Yöntem 1: Resmi MediaPlayer API (Öncelikli)
Sayfa bağlamında (main world) custom element üzerinden API referansı alınır:
```javascript
const getDisneyPlayer = () => {
  const host = document.querySelector("disney-web-player");
  return host ? host.mediaPlayer : undefined;
};
```
- **Play:** `mediaPlayer.play()`
- **Pause:** `mediaPlayer.pause()`
- **Seek:** `mediaPlayer.seek(timeMs)` (Milisaniye cinsinden seek alır.)
- **Durum Sorgulama:**
  - Oynatma Durumu: `mediaPlayer.playbackStatus.playing`
  - Duraklatma Durumu: `mediaPlayer.playbackStatus.paused`
  - Buffering Durumu: `mediaPlayer.playbackStatus.buffering`
  - Süre (Playhead): `mediaPlayer.timeline.info.playheadPositionMs`

### B. Yöntem 2: Shadow DOM Tıklama ve Pointer Event Simülasyonu (Fallback)
Eğer MediaPlayer API'sine erişilemezse, Shadow DOM içerisindeki kontrol butonları tetiklenir:
- **Play/Pause Butonları:**
  ```javascript
  const togglePlayPause = document.querySelector("toggle-play-pause") ||
                          document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
  if (togglePlayPause && togglePlayPause.shadowRoot) {
    const btn = togglePlayPause.shadowRoot.querySelector(action === 'play' ? ".play-button" : ".pause-button");
    if (btn) btn.click();
  }
  ```
- **Seek Simülasyonu (Mouse Pointer Events):**
  ```javascript
  const progressBar = document.querySelector("progress-bar") ||
                      document.querySelector("disney-web-player")?.shadowRoot?.querySelector("progress-bar");
  if (progressBar && progressBar.shadowRoot) {
    const seekbar = progressBar.shadowRoot.querySelector(".progress-bar__seekable-range");
    if (seekbar) {
      const maxTime = Number(seekbar.getAttribute("aria-valuemax")) || 1;
      const minTime = Number(seekbar.getAttribute("aria-valuemin")) || 0;
      const progress = timeSeconds / (maxTime - minTime);
      const seekBounds = seekbar.getBoundingClientRect();
      const clientX = (progress * seekbar.offsetWidth) + seekBounds.left;
      const clientY = seekBounds.top + (seekBounds.height / 2);
      
      const eventOpts = { pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX, clientY, view: window };
      seekbar.dispatchEvent(new PointerEvent("pointerdown", eventOpts));
      seekbar.dispatchEvent(new PointerEvent("pointerup", eventOpts));
    }
  }
  ```

---

## 4. YouTube ve Genel HTML5 Entegrasyonu

YouTube ve standart HTML5 video oynatıcıları, Chrome Extension isolated world (içerik betiği bağlamı) üzerinden doğrudan kontrol edilebilir.

### A. YouTube Oynatıcı Kontrolleri
YouTube'da kontrol, sayfadaki `.html5-video-player` class'ına sahip element üzerinden API fonksiyonları çağrılarak yapılır:
- **Play:** `ytPlayer.playVideo()` veya fallback `<video>.play()`
- **Pause:** `ytPlayer.pauseVideo()` veya fallback `<video>.pause()`
- **Seek:** `ytPlayer.seekTo(seconds, true)` veya fallback `<video>.currentTime = seconds`

### B. Genel HTML5 Oynatıcısı
Platforma özel olmayan web sitelerinde doğrudan standart `<video>` HTML5 elementi hedeflenir:
- **Play:** `videoElement.play()`
- **Pause:** `videoElement.pause()`
- **Seek:** `videoElement.currentTime = seconds`

---

## 5. Çözüm Stratejisi ve Değişiklik Planı

### A. `extension/inject.js` Güncellemesi
Mevcut `inject.js` dosyası hem Netflix hem de Disney+ platform mesajlarını dinleyecek ve ilgili API'leri tetikleyecek şekilde birleştirilmelidir:
```javascript
// FilmSync Page Injected Hook Script (Runs in page context)
(function() {
  console.log('[FilmSync Inject] Platform hook scripti yüklendi.');

  // --- Netflix API ---
  function getNetflixPlayer() {
    try {
      const videoPlayer = window.netflix?.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
      const sessionIds = videoPlayer?.getAllPlayerSessionIds() || [];
      const watchSessionId = sessionIds.find(id => id.includes('watch')) || sessionIds[0];
      return videoPlayer?.getVideoPlayerBySessionId(watchSessionId);
    } catch (e) { return null; }
  }

  // --- Disney+ API ---
  function getDisneyPlayer() {
    try {
      return document.querySelector("disney-web-player")?.mediaPlayer;
    } catch (e) { return null; }
  }

  // Mesaj Dinleyici
  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') return;

    const { action, value } = event.data;

    // Netflix Kontrolleri
    if (window.location.host.includes('netflix.com')) {
      const player = getNetflixPlayer();
      if (!player) return;
      if (action === 'play') player.play();
      else if (action === 'pause') player.pause();
      else if (action === 'seek') player.seek(value * 1000);
    }

    // Disney+ Kontrolleri
    if (window.location.host.includes('disneyplus.com')) {
      const player = getDisneyPlayer();
      if (player) {
        if (action === 'play') player.play();
        else if (action === 'pause') player.pause();
        else if (action === 'seek') player.seek(value * 1000);
      } else {
        // Fallback Shadow DOM Click
        // ... (Shadow DOM simülasyonu buraya yerleştirilecek)
      }
    }
  });
})();
```

### B. `extension/content.js` Güncellemesi
`PlayerAdapter` nesnesi ve `inject.js` enjeksiyon mantığı güncellenecektir:
```javascript
// Oynatıcı Adaptörü
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (PlayerAdapter.isYouTube()) {
      const ytPlayer = document.querySelector('.html5-video-player');
      if (ytPlayer && typeof ytPlayer.playVideo === 'function') ytPlayer.playVideo();
      else if (videoElement) videoElement.play();
    } else if (videoElement) {
      videoElement.play();
    }
  },

  pause: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (PlayerAdapter.isYouTube()) {
      const ytPlayer = document.querySelector('.html5-video-player');
      if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') ytPlayer.pauseVideo();
      else if (videoElement) videoElement.pause();
    } else if (videoElement) {
      videoElement.pause();
    }
  },

  seek: (seconds) => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (PlayerAdapter.isYouTube()) {
      const ytPlayer = document.querySelector('.html5-video-player');
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') ytPlayer.seekTo(seconds, true);
      else if (videoElement) videoElement.currentTime = seconds;
    } else if (videoElement) {
      videoElement.currentTime = seconds;
    }
  }
};

// Enjeksiyon Mantığı
if ((PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) && window === window.top) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);
  console.log('[FilmSync] Player API entegrasyon scripti enjekte edildi.');
}
```

### C. `extension/manifest.json` Güncellemesi
`web_accessible_resources` altına Disney+ adresi eklenerek `inject.js`'in bu sayfalarda da erişilebilir olması sağlanır:
```json
  "web_accessible_resources": [
    {
      "resources": ["inject.js"],
      "matches": [
        "*://*.netflix.com/*",
        "*://*.disneyplus.com/*"
      ]
    }
  ]
```
