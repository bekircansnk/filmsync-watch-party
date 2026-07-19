# Oynatıcı Adaptörleri Entegrasyon Analizi (Netflix, YouTube, Disney+ ve HTML5)

Bu rapor, Milestone 1 kapsamında FilmSync uygulamasında Netflix, Disney+, YouTube ve genel HTML5 video oynatıcılarının tekilleştirilmiş bir adaptör yapısı (`PlayerAdapter`) üzerinden senkronize bir şekilde kontrol edilmesi için gereken mimariyi, Teleparty kaynak kodlarından elde edilen analizlerle ortaya koymaktadır.

---

## 1. Platform Bazlı Player API ve Erişim Detayları

### A. Netflix (Cadmium API)
Netflix, standart HTML5 `<video>` elementi yerine kendi özel şifreli oynatıcısını (`Cadmium Player API`) kullanmaktadır. Bu oynatıcıya yalnızca sayfa bağlamından (page context - main world) erişilebilir.

*   **API Erişim Yolu:**
    ```javascript
    const videoPlayer = window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
    ```
*   **Oturum (Session) Belirleme:**
    Netflix üzerinde birden fazla oynatıcı oturumu aktif olabilir. Gerçek izleme oturumunu bulmak için `"watch-"` öneki aranır:
    ```javascript
    const sessionIds = videoPlayer.getAllPlayerSessionIds();
    const watchSessionId = sessionIds.find(id => id.indexOf('watch-') === 0) || sessionIds[0];
    const player = videoPlayer.getVideoPlayerBySessionId(watchSessionId);
    ```
*   **Oynatıcı Metotları:**
    *   **Play:** `player.play()`
    *   **Pause:** `player.pause()`
    *   **Seek:** `player.seek(milliseconds)` -> *Not: Parametre milisaniye cinsinden verilmelidir.*

---

### B. Disney+ (Media Player API & DOM Fallback)
Disney+, `disney-web-player` adında özel bir Web Component kullanmaktadır. Oynatma durumunu kontrol etmek için iki farklı seviyede entegrasyon gerçekleştirilebilir: API tabanlı kontrol (birincil tercih) ve DOM etkileşim simülasyonu (ikincil tercih - fallback).

#### 1. API Tabanlı Kontrol (Birincil Tercih)
`disney-web-player` elementine bağlanarak onun `mediaPlayer` nesnesine erişim sağlanır.

*   **API Erişim Yolu:**
    ```javascript
    const getDisneyPlayer = () => {
      const host = document.querySelector("disney-web-player");
      return host ? host.mediaPlayer : null;
    };
    ```
*   **Oynatıcı Metotları:**
    *   **Play:** `player.play()`
    *   **Pause:** `player.pause()`
    *   **Seek:** `player.seek(timeMs)` -> *Not: Parametre milisaniye cinsinden verilmelidir.*
    *   **Durum Tespiti:**
        *   Pozisyon: `player.timeline.info.playheadPositionMs`
        *   Durum: `player.playbackStatus` nesnesi üzerinden `playing`, `paused`, `buffering`, `notready` alanları sorgulanır.

#### 2. DOM Etkileşim Simülasyonu (Fallback)
API'nin yüklenemediği veya erişilemediği durumlarda, Teleparty'nin kullandığı Shadow DOM buton tetikleme mekanizması işletilir.

*   **Play İşlemi:**
    `toggle-play-pause` Shadow DOM yapısındaki oynat butonuna tıklanır:
    ```javascript
    const player = document.querySelector(".btm-media-player") || document.querySelector("disney-web-player");
    if (player) player.click(); // Kontrolleri uyandır
    
    const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
    const playBtn = toggleBtn?.shadowRoot?.querySelector(".play-button");
    if (playBtn) playBtn.click();
    ```
*   **Pause İşlemi:**
    Oynat butonuna benzer şekilde duraklatma butonuna tıklanır:
    ```javascript
    const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
    const pauseBtn = toggleBtn?.shadowRoot?.querySelector(".pause-button");
    if (pauseBtn) pauseBtn.click();
    ```
*   **Seek İşlemi:**
    Mesafe/Zaman oranı hesaplanarak, seek bar üzerinde Pointer Event'ler (`pointerdown` ve `pointerup`) simüle edilir:
    ```javascript
    const progressBar = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("progress-bar");
    const seekbar = progressBar?.shadowRoot?.querySelector(".progress-bar__seekable-range");
    if (seekbar) {
      const maxTime = Number(seekbar.getAttribute("aria-valuemax")) || 1;
      const minTime = Number(seekbar.getAttribute("aria-valuemin")) || 0;
      const progress = targetSeconds / (maxTime - minTime);
      
      const seekBounds = seekbar.getBoundingClientRect();
      const clickX = (progress * seekbar.offsetWidth) + seekBounds.left;
      const clickY = seekBounds.top + (seekBounds.height / 2);
      
      const baseOptions = { pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX: clickX, clientY: clickY, view: window };
      seekbar.dispatchEvent(new PointerEvent("pointerdown", baseOptions));
      seekbar.dispatchEvent(new PointerEvent("pointerup", baseOptions));
    }
    ```

---

### C. YouTube (Player API)
YouTube, sayfada `#movie_player` veya `#shorts-player` id'li özel bir player katmanı barındırır. Bu katmanın standart HTML5 video etiketini sarmalayan API metotları bulunmaktadır.

*   **API Erişim Yolu:**
    ```javascript
    const getYouTubePlayer = () => {
      const url = window.location.href;
      if (url.includes("/shorts/")) {
        return document.querySelector("#shorts-player");
      }
      if (url.includes("/watch")) {
        return document.querySelector("#movie_player");
      }
      return null;
    };
    ```
*   **Oynatıcı Metotları:**
    *   **Play:** `player.playVideo()`
    *   **Pause:** `player.pauseVideo()`
    *   **Seek:** `player.seekTo(seconds, true)` -> *Not: Saniye cinsinden değer alır.*
    *   **Durum Tespiti:** `player.getCurrentTime()` ve `player.getVideoData()` üzerinden bilgi alınır.

---

### D. Genel HTML5 Video
Diğer tüm web siteleri için sayfada yer alan standart `<video>` DOM nesnesi doğrudan kontrol edilir.

*   **Oynatıcı Metotları:**
    *   **Play:** `videoElement.play()`
    *   **Pause:** `videoElement.pause()`
    *   **Seek:** `videoElement.currentTime = seconds` -> *Not: Saniye cinsinden değer alır.*

---

## 2. Enjeksiyon ve Haberleşme Stratejisi (`inject.js`)

Page context (ana sayfa bağlamı) üzerinde çalışan `inject.js` dosyası, content script'ten postMessage aracılığıyla gelen komutları alarak ilgili platformun oynatıcı API'sini tetikleyecek şekilde tasarlanmalıdır.

### Önerilen `inject.js` Yapısı:
```javascript
(function() {
  console.log('[FilmSync Inject] Player API entegrasyonu başlatıldı.');

  const isNetflix = window.location.host.includes('netflix.com');
  const isDisney = window.location.host.includes('disneyplus.com');
  const isYouTube = window.location.host.includes('youtube.com');

  // Netflix Player API
  function getNetflixPlayer() {
    try {
      const videoPlayer = window.netflix?.appContext?.state?.playerApp?.getAPI()?.videoPlayer;
      if (!videoPlayer) return null;
      const sessionIds = videoPlayer.getAllPlayerSessionIds();
      if (!sessionIds || sessionIds.length === 0) return null;
      const watchSessionId = sessionIds.find(id => id.indexOf('watch-') === 0) || sessionIds[0];
      return videoPlayer.getVideoPlayerBySessionId(watchSessionId);
    } catch (e) {
      return null;
    }
  }

  // Disney+ Player API
  function getDisneyPlayer() {
    try {
      const host = document.querySelector("disney-web-player");
      return host ? host.mediaPlayer : null;
    } catch (e) {
      return null;
    }
  }

  // Disney+ DOM Fallback
  function handleDisneyDOMFallback(action, value) {
    try {
      const player = document.querySelector(".btm-media-player") || document.querySelector("disney-web-player");
      if (player) player.click();

      if (action === 'play') {
        const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
        const playBtn = toggleBtn?.shadowRoot?.querySelector(".play-button");
        if (playBtn) playBtn.click();
      } else if (action === 'pause') {
        const toggleBtn = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("toggle-play-pause");
        const pauseBtn = toggleBtn?.shadowRoot?.querySelector(".pause-button");
        if (pauseBtn) pauseBtn.click();
      } else if (action === 'seek') {
        const progressBar = document.querySelector("disney-web-player")?.shadowRoot?.querySelector("progress-bar");
        const seekbar = progressBar?.shadowRoot?.querySelector(".progress-bar__seekable-range");
        if (seekbar) {
          const maxTime = Number(seekbar.getAttribute("aria-valuemax")) || 1;
          const minTime = Number(seekbar.getAttribute("aria-valuemin")) || 0;
          const progress = value / (maxTime - minTime);
          const seekBounds = seekbar.getBoundingClientRect();
          const clickX = (progress * seekbar.offsetWidth) + seekBounds.left;
          const clickY = seekBounds.top + (seekBounds.height / 2);
          
          const baseOptions = { pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX: clickX, clientY: clickY, view: window };
          seekbar.dispatchEvent(new PointerEvent("pointerdown", baseOptions));
          seekbar.dispatchEvent(new PointerEvent("pointerup", baseOptions));
        }
      }
    } catch (err) {
      console.error('[FilmSync Inject] Disney+ DOM Fallback hatası:', err);
    }
  }

  // YouTube Player API
  function getYouTubePlayer() {
    try {
      const url = window.location.href;
      if (url.includes("/shorts/")) return document.querySelector("#shorts-player");
      if (url.includes("/watch")) return document.querySelector("#movie_player");
      return null;
    } catch (e) {
      return null;
    }
  }

  // Mesajlaşma Dinleyicisi
  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data || event.data.source !== 'filmsync-content') {
      return;
    }

    const { action, value } = event.data;

    if (isNetflix) {
      const player = getNetflixPlayer();
      if (player) {
        if (action === 'play') player.play();
        else if (action === 'pause') player.pause();
        else if (action === 'seek') player.seek(value * 1000);
      }
    } else if (isDisney) {
      const player = getDisneyPlayer();
      if (player) {
        if (action === 'play') player.play();
        else if (action === 'pause') player.pause();
        else if (action === 'seek') player.seek(value * 1000);
      } else {
        handleDisneyDOMFallback(action, value);
      }
    } else if (isYouTube) {
      const player = getYouTubePlayer();
      if (player) {
        if (action === 'play' && typeof player.playVideo === 'function') player.playVideo();
        else if (action === 'pause' && typeof player.pauseVideo === 'function') player.pauseVideo();
        else if (action === 'seek' && typeof player.seekTo === 'function') player.seekTo(value, true);
      }
    }
  });
})();
```

---

## 3. `content.js` Oynatıcı Adaptörü Güncellemesi

`content.js` içerisinde bulunan `PlayerAdapter` nesnesi, hedeflenen platformlara uygun `postMessage` tetiklemelerini yapacak şekilde güncellenmelidir. Ayrıca, enjeksiyon kontrolünün tüm desteklenen platformları kapsaması sağlanmalıdır.

### A. Enjeksiyon Tetikleyicisinin Güncellenmesi
`content.js` dosyasının üst kısmındaki Netflix enjeksiyon koşulu genişletilmelidir:

```javascript
// Sayfa bağlamına inject.js enjeksiyonu (Netflix, Disney+, YouTube için)
const shouldInject = window.location.host.includes('netflix.com') || 
                     window.location.host.includes('disneyplus.com') || 
                     window.location.host.includes('youtube.com');

if (shouldInject && window === window.top) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  (document.head || document.documentElement).appendChild(script);
  console.log('[FilmSync] Player entegrasyon scripti enjekte edildi.');
}
```

### B. `PlayerAdapter` Güncellenmiş Yapısı
```javascript
const PlayerAdapter = {
  isNetflix: () => window.location.host.includes('netflix.com'),
  isYouTube: () => window.location.host.includes('youtube.com'),
  isDisney: () => window.location.host.includes('disneyplus.com'),

  play: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'play' }, '*');
    } else if (videoElement) {
      videoElement.play();
    }
  },

  pause: () => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*');
    } else if (videoElement) {
      videoElement.pause();
    }
  },

  seek: (seconds) => {
    if (PlayerAdapter.isNetflix() || PlayerAdapter.isDisney() || PlayerAdapter.isYouTube()) {
      window.postMessage({ source: 'filmsync-content', action: 'seek', value: seconds }, '*');
    } else if (videoElement) {
      videoElement.currentTime = seconds;
    }
  }
};
```

*Not: YouTube için de enjeksiyon yapısının kullanılması, isolated world kısıtlamalarından dolayı API metotlarına erişememe riskini tamamen ortadan kaldırır. Bu nedenle postMessage aracılığıyla `inject.js` üzerinden yönetilmesi tercih edilmiştir.*

---

## 4. `manifest.json` İzinleri ve Kaynak Yapılandırması

Çözümün sorunsuz çalışması için, web sitelerinin `inject.js` dosyasına erişebilmesi amacıyla manifest dosyasına web erişilebilir kaynak tanımları eklenmeli ve Disney+ platformu izin eşleşmelerine dâhil edilmelidir.

### `manifest.json` Güncelleme Önerisi:
```json
  "web_accessible_resources": [
    {
      "resources": ["inject.js"],
      "matches": [
        "*://*.netflix.com/*",
        "*://*.disneyplus.com/*",
        "*://*.youtube.com/*"
      ]
    }
  ]
```

Bu yapılandırma sayesinde:
1.  Netflix, Disney+ ve YouTube üzerinde `inject.js` kodunun "main world" bağlamına enjekte edilmesi Chrome güvenliği tarafından engellenmeyecektir.
2.  Genel video sitelerinde `inject.js` enjekte edilmez; bu sitelerde doğrudan standard HTML5 `<video>` elementi manipülasyonu çalışacaktır. Bu sayede gereksiz sitelerde ek yük oluşturulmaz ve güvenlik kısıtlamalarına takılınmaz.

---

## 5. Doğrulama ve Test Senaryoları

Yapılan analizlerin doğrulanması için aşağıdaki adımların izlenmesi planlanmıştır:
1.  **Netflix Doğrulaması:** Video oynatılırken `window.postMessage({ source: 'filmsync-content', action: 'pause' }, '*')` komutunun konsoldan tetiklenmesi ve oynatıcının durması.
2.  **Disney+ Doğrulaması:** `disney-web-player` elementinin Shadow DOM hiyerarşisinde `.play-button` ve `.pause-button` elementlerinin varlığının tespiti. Oynatıcı API'sinin tetiklenmesi.
3.  **YouTube Doğrulaması:** `#movie_player` nesnesinin `playVideo` ve `pauseVideo` metotlarının doğru şekilde çağrılabilmesi.
