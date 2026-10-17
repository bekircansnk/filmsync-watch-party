# 🧠 AKTİF BAĞLAM VE PROJE DURUMU (ACTIVE CONTEXT)

* **Son Güncelleme:** 2026-10-17 21:52
* **Proje:** Film Partisi (FilmSync) — Senkronize Video İzleme & Sohbet Ekosistemi (v1.4.0)
* **Uzak Repozituvar:** `git@github.com:bekircansnk/filmsync-watch-party.git` (Private/Public)
* **Aktif Dal:** Yalnızca tek ve güncel `main` dalı
* **Test Durumu:** 69/69 Senaryo Başarılı (`node scripts/verify_filmsync.js`)

---

## 🎯 1. Proje Özeti ve Amacı
Film Partisi, kullanıcıların tarayıcı üzerinden arkadaşlarıyla birlikte Netflix, YouTube, Disney+, Dizipal, HDFilmCehennemi ve genel HTML5 video sitelerinde sıfır gecikmeyle aynı anda film/dizi izlemesini, sayfa üzerine gömülü cam efektli dikey panelden sohbet etmesini ve uçan emoji reaksiyonları göndermesini sağlayan Manifest V3 tabanlı bir Web Uzantısıdır.

---

## 🏛️ 2. Temel Mimari Bileşenleri
1. **`extension/popup.html` & `popup.js`**:
   - 2026 Frosted Glass arayüzü, oda kurma, odaya katılma, avatar seçimi.
   - Açık Odalar Rehberi (Public Rooms) ve Host Yetki Kilidi (`hostOnly`).
2. **`extension/content.js`**:
   - İstemci koordinatörü, sağ dikey cam sohbet podu (`#filmsync-root`).
   - `all_frames: true` ile nested iframeler içindeki (Dizipal, HDFilmCehennemi) `<video>` elementlerini yakalama.
   - Çift-Escape tam ekran koruması (`navigator.keyboard.lock(['Escape'])`).
   - Web Audio API sentetik ses motoru ve yüzen emoji animasyonları.
3. **`extension/inject.js`**:
   - Main world enjeksiyonu. Netflix Cadmium API (`videoPlayer`) ve Disney+ MediaPlayer kontrolleri.
   - React Fiber Fallback (Depth 35 traversal).
4. **`extension/background.js`**:
   - Service worker. Sekme URL takibi ve yalnızca oda sahibinin (Host) film URL'sini değiştirebilme yetkisi.
   - Platform bazlı kanonik film URL normalizasyonu.
5. **Firebase Realtime Database (RTDB)**:
   - `rooms/<roomId>/lastState`: `{ isPlaying, currentTime, url, lastUpdated, action, senderId }`
   - `rooms/<roomId>/users/<userId>`: `{ username, avatar, lastActive, isBuffering }`
   - `rooms/<roomId>/messages` & `reactions`
   - `database.rules.json`: XSS korumalı şema ve erişim kuralları.

---

## ⚡ 3. Platform Uyumluluk Özeti
- **Netflix**: %100 Uyumlu (Cadmium API, 1500ms keyframe seek deadband, getBusy() çakışma önleyici, FIFO komut kuyruğu).
- **YouTube**: %100 Uyumlu (Player API + DOM fallback, SPA pushState takibi).
- **Disney+**: %100 Uyumlu (`inject.js` ve kanonik URL çözümlemesi).
- **Dizipal & HDFilmCehennemi**: %100 Uyumlu (Nested iframe `<video>` yakalama, 0ms senkronizasyon).
- **Genel HTML5 Siteleri**: %100 Uyumlu (Otomatik video dedektörü).
- **Canlı Yayınlar (Live Stream)**: Kısıtlı (Dinamik zaman penceresi nedeniyle seek senkronize edilemez).
- **Prime Video**: Kısmi (Donanım hızlandırmalı DRM sürümlerinde overlay kısıtları).
- **Altyazı / Ses Dili**: Bilerek odaya eşitlenmez; kullanıcılar kendi yerel dillerinde izler.

---

## 📚 4. Dokümantasyon Haritası
- `README.md`: Hızlı başlangıç, özellikler ve uyumluluk tablosu.
- `docs/ARCHITECTURE.md`: Detaylı 5-katmanlı mimari ve senkronizasyon spesifikasyonu.
- `docs/SETUP_GUIDE.md`: Sıfırdan kurulum, Firebase anahtar yönetimi ve tarayıcıya yükleme rehberi.
- `docs/DEBUG_PROTOCOL.md`: Hata ayıklama protokolü.
- `scripts/verify_filmsync.js`: 63 senaryolu doğrulama paketi.
- `scripts/build_safari_app.sh`: Safari Web Extension derleme betiği.
