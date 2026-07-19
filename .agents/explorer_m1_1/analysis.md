# Oynatıcı Adaptörleri Analiz Raporu (Milestone 1)

Bu rapor, FilmSync eklentisinin Netflix, Disney+, YouTube ve Genel HTML5 video platformlarında sorunsuz bir şekilde senkronizasyon yapabilmesi için gereken mimariyi, Teleparty kaynak kodlarından elde edilen analizleri ve yapılması gereken kod değişikliklerini açıklamaktadır.

---

## 1. Platform Oynatıcı API Erişim Analizleri

### A. Netflix (Cadmium API)
* **Kaynak Dosya:** `teleparty/content_scripts/netflix/netflix_injected_bundled.js` (Satır 108-115, 384-409)
* **Erişim Mekanizması:** Netflix oynatıcı nesnesine yalnızca ana sayfa bağlamından (`page context / main world`) erişilebilir. Teleparty, aşağıdaki yöntemi kullanarak aktif izleme oturumu oynatıcısını elde etmektedir:
  ```javascript
  const getVideoPlayer = () => {
      var e = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
      var playerSessionIds = e.getAllPlayerSessionIds();
      var t = playerSessionIds.find((val) => {
          return val.includes("watch");
      });
      return e.getVideoPlayerBySessionId(t);
  };
  ```
* **Oynatıcı Metotları:**
  * Oynat: `getVideoPlayer().play()`
  * Duraklat: `getVideoPlayer().pause()`
  * Zaman Kaydır: `getVideoPlayer().seek(milliseconds)` (Netflix API milisaniye cinsinden zaman alır.)

### B. Disney+ (Player API & Shadow DOM)
* **Kaynak Dosya:** `teleparty/content_scripts/disney/disney_injected_bundled.js` (Satır 114-117, 169-235)
* **Erişim Mekanizması:** Disney+ videoları, özel bir Custom Element olan `<disney-web-player>` ile yönetilir. Bu nesnenin `mediaPlayer` özelliği üzerinden oynatıcıya erişilir:
  ```javascript
  const getMediaPlayer = () => {
      const host = document.querySelector("disney-web-player");
      return host ? host.mediaPlayer : undefined;
  };
  ```
* **Oynatıcı Metotları:**
  * Oynat: `mediaPlayer.play()`
  * Duraklat: `mediaPlayer.pause()`
  * Zaman Kaydır: `mediaPlayer.seek(timeMs)` (Milisaniye alır. Canlı yayınlar için `mediaPlayer.seekToDate(new Date(timeMs))` kullanılabilir.)
* **Shadow DOM Bariyeri (Kritik Bulgular):**
  Disney+ üzerindeki `<video>` elementi, `<disney-web-player>` bileşeninin **Shadow DOM** ağacının içinde bulunur. Standart `document.querySelector('video')` çağrısı shadow root sınırlarını aşamadığı için null döner. Bu nedenle, content script'in video elementini bulabilmesi için shadow root'a nüfuz etmesi gerekir:
  ```javascript
  const video = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("video");
  ```

### C. YouTube
* **Kaynak Dosya:** `teleparty/content_scripts/youtube/youtube_injected_bundled.js` (Satır 152-164, 30-86)
* **Erişim Mekanizması:** YouTube, oynatıcısını kontrol etmek için `#movie_player` veya `#shorts-player` öğelerine bağlanan Player API'yi sunar.
  * Oynat: `player.playVideo()`
  * Duraklat: `player.pauseVideo()`
  * Zaman Kaydır: `player.seekTo(seconds, true)`
* **FilmSync Entegrasyon Stratejisi:**
  YouTube ve genel HTML5 video sitelerinde, oynatıcıyı kontrol etmek için ana sayfa bağlamında çalışmaya veya Player API'ye ihtiyaç yoktur. Doğrudan izole dünyadaki (`isolated world`) standart HTML5 `<video>` elementinin `play()`, `pause()` metotları ve `currentTime` özelliği kullanılarak kontrol sağlanabilir. Bu durum, YouTube entegrasyonunu karmaşık hook'lar yerine doğrudan HTML5 video adaptörüne yönlendirerek sadeleştirir.

---

## 2. Eklenti Kod Değişikliği Taslakları

### A. `extension/inject.js` (Sayfa Bağlamı Enjeksiyonu)
Mevcut `inject.js` dosyası sadece Netflix'i desteklemektedir. Hem Netflix'i hem de Disney+'ı destekleyecek şekilde şu şekilde birleştirilmelidir:

```javascript
// FilmSync Netflix & Disney+ Hook Script (Runs in page context)
(function() {
  const isNetflix = window.location.host.includes('netflix.com');
  const isDisney = window.location.host.includes('disneyplus.com');

  if (isNetflix) {
    console.log('[FilmSync Inject] Netflix player API entegrasyonu başlatıldı.');

    function getNetflixPlayer() {
      try {
        const netflixObj = window.netflix;
        if (!netflixObj) return null;
        const videoPlayer = netflixObj.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
        if (!videoPlayer) return null;
        const sessionIds = videoPlayer.getAllPlayerSessionIds();
        if (!sessionIds || sessionIds.length === 0) return null;
        const watchSessionId = sessionIds.find(id => id.indexOf('watch-') === 0) || sessionIds[0];
        return videoPlayer.getVideoPlayerBySessionId(watchSessionId);
      } catch (e) {
        console.error('[FilmSync Inject] Netflix player eldesi başarısız:', e);
        return null;
      }
    }

    window.addEventListener('message', function(event) {
      if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') return;
      const { action, value } = event.data;
      const player = getNetflixPlayer();
      if (!player) return;

      try {
        if (action === 'play') {
          player.play();
        } else if (action === 'pause') {
          player.pause();
        } else if (action === 'seek') {
          player.seek(value * 1000); // Milisaniye dönüşümü
        }
      } catch (err) {
        console.error('[FilmSync Inject] Netflix komut hatası:', err);
      }
    });
  }

  if (isDisney) {
    console.log('[FilmSync Inject] Disney+ player API entegrasyonu başlatıldı.');

    function getDisneyPlayer() {
      try {
        const host = document.querySelector('disney-web-player');
        return host ? host.mediaPlayer : null;
      } catch (e) {
        console.error('[FilmSync Inject] Disney+ player eldesi başarısız:', e);
        return null;
      }
    }

    window.addEventListener('message', function(event) {
      if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') return;
      const { action, value } = event.data;
      const player = getDisneyPlayer();
      if (!player) return;

      try {
        if (action === 'play') {
          player.play();
        } else if (action === 'pause') {
          player.pause();
        } else if (action === 'seek') {
          player.seek(value * 1000); // Milisaniye dönüşümü
        }
      } catch (err) {
        console.error('[FilmSync Inject] Disney+ komut hatası:', err);
      }
    });
  }
})();
```

### B. `extension/content.js`
`content.js` dosyasında `PlayerAdapter` nesnesi ile video tespiti yapan `startVideoTracking` fonksiyonunda değişiklik yapılmalıdır.

#### 1. Enjeksiyon Kararı
Dosyanın başında `inject.js`'i enjekte eden kontrol alanı Disney+ için de aktif edilmelidir (Satır 32-38):
```javascript
// Netflix ve Disney+ için inject.js scriptini enjekte et
const isNetflixPage = window.location.host.includes('netflix.com');
const isDisneyPage = window.location.host.includes('disneyplus.com');
if ((isNetflixPage || isDisneyPage) && window === window.top) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);
  console.log(`[FilmSync] ${isNetflixPage ? 'Netflix' : 'Disney+'} player entegrasyon scripti enjekte edildi.`);
}
```

#### 2. `PlayerAdapter` Güncellemesi (Satır 41-89)
```javascript
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (videoElement) {
      videoElement.play(); // YouTube ve Genel HTML5 için doğrudan video kontrolü
    }
  },

  pause: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (videoElement) {
      videoElement.pause();
    }
  },

  seek: (seconds) => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (videoElement) {
      videoElement.currentTime = seconds;
    }
  }
};
```

#### 3. Shadow DOM Destekli Video Tespiti (`startVideoTracking` Güncellemesi)
`content.js` satır 410-413 arasındaki video tespiti, Disney+ Shadow DOM yapısını destekleyecek şekilde güncellenmelidir:
```javascript
function findActiveVideoElement() {
  // Standart Light DOM taraması
  let video = document.querySelector('video');
  if (video) return video;

  // Disney+ Shadow DOM taraması
  const disneyPlayer = document.querySelector('disney-web-player');
  if (disneyPlayer && disneyPlayer.shadowRoot) {
    video = disneyPlayer.shadowRoot.querySelector('video');
    if (video) return video;
  }

  return null;
}

// Orijinal startVideoTracking fonksiyonundaki güncelleme:
function startVideoTracking() {
  setInterval(() => {
    const activeVideo = findActiveVideoElement();
    if (activeVideo && activeVideo !== videoElement) {
      removeVideoListeners();
      videoElement = activeVideo;
      setupVideoListeners();
      
      console.log('[FilmSync] Video tespit edildi. Eşitleme yapılıyor.');
      forceSync();

      if (!document.getElementById('filmsync-root')) {
        createChatUI();
        startUIKeeper();
        
        if (window !== window.top) {
          initializeFirebase(firebaseConfig);
        }
      }
    }
  }, 1000);
}
```

---

## 3. `extension/manifest.json` İzin ve Kaynak Değişiklikleri

### A. Web Erişilebilir Kaynaklar (`web_accessible_resources`)
Page Context içine enjekte edilen `inject.js` dosyasının Disney+ sayfalarında da güvenlik politikalarına takılmadan yüklenmesi için izin eklenmesi gerekir.
* **Mevcut Yapı:**
  ```json
  "web_accessible_resources": [
    {
      "resources": ["inject.js"],
      "matches": ["*://*.netflix.com/*"]
    }
  ]
  ```
* **Önerilen Yapı:**
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

### B. İzinler ve Host İzinleri
* Mevcut eklenti manifestosu zaten `host_permissions` altında `"<all_urls>"` yetkisine sahiptir. Bu yetki sayesinde Disney+ (`*://*.disneyplus.com/*`) ve genel video siteleri için ek bir `host_permissions` iznine teknik olarak gerek yoktur.
* Ancak, uzantının yetkilerini sınırlamak ve Chrome Web Store politikalarına uymak adına gelecekte `host_permissions` daraltılacak olursa aşağıdaki listenin eklenmesi önerilir:
  ```json
  "host_permissions": [
    "*://*.netflix.com/*",
    "*://*.youtube.com/*",
    "*://*.disneyplus.com/*"
  ]
  ```
