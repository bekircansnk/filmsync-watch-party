# Project: FilmSync Watch Party

## Mimari
FilmSync, tarayıcıda izlenen videoların durumunu gerçek zamanlı olarak Firebase Realtime Database (RTDB) üzerinden senkronize eden bir Chrome Uzantısıdır.

### Veri Akışı ve Senkronizasyon Şeması
1. **Oynatıcı Adaptörü (Content Script - isolated world):** Sayfadaki `<video>` öğesini tespit eder.
2. **Page Injector (Page Context - main world):** Netflix Cadmium API ve Disney+ Player API gibi ana sayfa bağlamındaki API'lere erişmek için `inject.js` enjekte edilir. Content script ile `postMessage` aracılığıyla haberleşir.
3. **Firebase Eşitleme (RTDB):** Oynatma durumları (isPlaying, currentTime, url, lastUpdated, senderId) Firebase'e yazılır ve dinlenir. Sapma (drift) > 1.5 saniye olduğunda seek edilerek süreler eşitlenir.
4. **Sohbet ve Mini Toolbar:** Sayfa DOM'una doğrudan enjekte edilen 330px genişliğinde sağ dikey panel ve mini toolbar.

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Çoklu Oynatıcı Adaptörleri | Netflix, YT, Disney+ ve Genel HTML5 video oynatıcı adaptörlerinin `inject.js` ve `content.js` üzerinde birleştirilmesi. | Yok | PLANNED |
| 2 | Firebase Eşitleme Motoru | 1.5sn drift düzeltmesi, play/pause/seek debounce mekanizması ve `hostOnly` yetkilendirmesi / revert mantığı. | M1 | PLANNED |
| 3 | Sağ Sohbet Sidebar & Toolbar | 330px dikey sohbet sidebar enjeksiyonu, mini dikey toolbar entegrasyonu, resize tetikleyicisi ve düzen kaydırma CSS kuralları. | M1 | PLANNED |
| 4 | Buffering & Emoji Entegrasyonu |waiting/playing olaylarının Firebase'e yazılması, avatar listesi, emoji reaksiyon barı, yüzen emojiler ve Netflix detay sayfası butonu. | M2, M3 | PLANNED |
| 5 | Popup Arayüz Güncellemesi | Avatar seçici, hostOnly switch ve Türkçe tarih formatı (`DD.MM.YYYY`) entegrasyonu. | M2 | PLANNED |
| 6 | E2E Test & Hardening | E2E test senaryolarının işletilmesi ve adverserial testler ile kararlılık doğrulaması. | M4, M5 | PLANNED |

---

## Arayüz Sözleşmeleri (Interface Contracts)
- **Content Script ↔ Page Inject (inject.js):**
  - Mesaj formatı: `{ source: 'filmsync-content', action: 'play' | 'pause' | 'seek', value?: number }` (Page context'e gönderilen)
  - Netflix/Disney+ Player durumlarını `window.postMessage` ile content script'e iletir.
- **Firebase Database Şeması:**
  - `rooms/<roomId>/lastState`: `{ isPlaying: boolean, currentTime: number, url: string, senderId: string, lastUpdated: number }`
  - `rooms/<roomId>/users/<userId>`: `{ username: string, avatar: string, isBuffering: boolean, lastActive: number }`
  - `rooms/<roomId>/messages`: `{ username: string, message: string, timestamp: number, isSystem: boolean }`
  - `rooms/<roomId>/reactions`: `{ emoji: string, senderId: string, timestamp: number }`

---

## Kod Yerleşimi (Code Layout)
- `/extension/manifest.json` - Eklenti manifestosu
- `/extension/background.js` - Service worker (URL yönlendirme)
- `/extension/content.js` - Content script (DOM manipülasyonu, Firebase eşitleme, sohbet paneli)
- `/extension/inject.js` - Page context injection script (Netflix/Disney+ API kontrolleri)
- `/extension/popup.html` - Popup görünümü
- `/extension/popup.js` - Popup kontrol mantığı
- `/extension/libs/` - Firebase SDK dosyaları
