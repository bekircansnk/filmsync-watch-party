# 🍿 Film Partisi (FilmSync) — Senkronize Video İzleme & Sohbet Ekosistemi

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-1.2.0-red?style=for-the-badge)](./extension/manifest.json)
[![Tests Passing](https://img.shields.io/badge/Tests-63%2F63%20Passing-brightgreen?style=for-the-badge)](./scripts/verify_filmsync.js)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

**Film Partisi (FilmSync)**, arkadaşlarınızla farklı cihaz ve tarayıcılarda uzaktan aynı anda **Netflix, YouTube, Disney+, Dizipal, HDFilmCehennemi** ve tüm HTML5 video sitelerinde eşzamanlı (0-gecikmeli) film ve dizi izlemenizi, sayfa üzerinde yüzen şık cam efektli (2026 Frosted Glass) dikey sohbet paneli üzerinden mesajlaşmanızı ve anlık emoji reaksiyonları fırlatmanızı sağlayan açık kaynaklı bir Web Uzantısıdır (Chrome, Brave, Edge & Safari).

---

## 📑 Hızlı Belge ve Dokümantasyon Fihristi

- 🏛️ **[Detaylı Mimari & Sistem Hafızası Dokümanı](./docs/ARCHITECTURE.md)**: 5-katmanlı mimari, saat kayması (clock skew) formülleri, keyframe seek deadband ve güvenlik korumaları.
- 🚀 **[Geliştirici & Sıfırdan Kurulum Kılavuzu](./docs/SETUP_GUIDE.md)**: Projeyi klonlama, Firebase entegrasyonu ve geliştirici modunda çalıştırma.
- 🩺 **[Hata Teşhis ve Test Protokolü](./docs/DEBUG_PROTOCOL.md)**: Bilinen sorunlar, yarış durumu (race condition) tespiti ve oynatıcı zırhları.
- 📚 **[Dokümantasyon Ana İndeksi](./docs/README.md)**: Tüm teknik rehberler ve AI hafıza fihristi.

---

## ✨ Temel Özellikler

- **0-Gecikmeli Eşitleme (Firebase RTDB):** Video akışı aktarılmaz; yalnızca oynatma durumu (play, pause, seek, URL) WebSocket üzerinden milisaniyeler içinde senkronize edilir.
- **2026 Frosted Glass Tasarım:** Apple tarzı yarı saydam cam efekti, sağ dikey yüzen sohbet podu, canlı üye avatarları ve neon rozetler.
- **Dizipal & HDFilmCehennemi (Nested Iframe) Desteği:** `all_frames: true` mimarisi sayesinde harici oynatıcı iframeleri (Vidmoly, Rapidrame vb.) içindeki `<video>` etiketleri otomatik tespit edilir ve sıfır gecikmeyle eşitlenir.
- **Netflix & Disney+ Özel Oynatıcı Adaptörü:** Netflix Cadmium API ve Disney+ MediaPlayer kontrolleri `inject.js` ile sayfa bağlamında yönetilir.
- **Çift-Escape Tam Ekran Koruması:** `navigator.keyboard.lock(['Escape'])` ile tam ekranda Escape tuşuna ilk basıldığında filmden çıkılmaz, sadece sohbet paneli gizlenir. 1 saniye içinde ikinci kez basıldığında tam ekrandan çıkılır.
- **Oda Sahibi (Host-Only) Otoritesi:** Oda kurucusu yetki kilidini açtığında misafirler filmi duraklatamaz, ileri saramaz veya linki değiştiremez.
- **Sentetik Web Audio Ses Efektleri:** Harici ses dosyası indirilmeden Web Audio API osilatörleri ile üretilen kibar mesaj ve bildirim sesleri.
- **Uçan Emoji Reaksiyonları:** Ekranın altından yukarı doğru süzülen eğlenceli reaksiyonlar.
- **Açık Odalar Rehberi (Public Rooms):** Şifresiz herkese açık partileri listeleyen ve tek tıkla katılmayı sağlayan canlı lobi.

---

## 🎯 Platform Uyumluluk Tablosu

| Platform | Uyumluluk | Entegrasyon Şekli | Özel Koruma & Notlar |
| :--- | :---: | :--- | :--- |
| **Netflix** | ✅ **%100** | `inject.js` (Cadmium API) | 1500ms Keyframe Seek Deadband, `getBusy()` çakışma önleyici, React Fiber Depth-35 fallback. |
| **YouTube** | ✅ **%100** | DOM + Player API | SPA `pushState` ve `yt-navigate-finish` olay yakalayıcıları devrededir. |
| **Disney+** | ✅ **%100** | `inject.js` + MediaPlayer | Kanonik film ID çözümlemesi ve fallback simülasyonu. |
| **Dizipal & HDFilmCehennemi** | ✅ **%100** | Nested Iframe Injection | Vidmoly, Rapidrame ve iframe içindeki gerçek `<video>` elementine 0ms doğrudan bağ. |
| **Genel HTML5 Siteleri** | ✅ **%100** | Standart `<video>` Olayları | Otomatik video dedektörü ve timeupdate dinleyicisi. |
| **Canlı Yayınlar (Live Stream)** | ⚠️ **Kısıtlı** | Dinamik HLS/DASH Zamanı | Sabit süre bulunmadığı için seek eşitlemesi devre dışı kalır. |
| **Prime Video (Bölgesel)** | ⚠️ **Kısmi** | Donanım DRM Katmanı | Donanım hızlandırmalı bazı Linux/Windows sürümlerinde tam ekran podu video konteynerine sabitlenmelidir. |

---

## 🚀 Hızlı Başlangıç & Kurulum

### 1. Repoyu Klonlayın
```bash
git clone git@github.com:bekircansnk/filmsync-watch-party.git
cd filmsync-watch-party
```

### 2. Tarayıcıya Yükleyin (Chrome / Brave / Edge)
1. `chrome://extensions` adresine gidin.
2. Sağ üstten **Geliştirici modu**'nu aktif edin.
3. Sol üstteki **Paketlenmemiş öğe yükle** butonuna tıklayın.
4. Bu depodaki **`extension/`** klasörünü seçin.

### 3. Safari için Derleyin (macOS)
```bash
bash scripts/build_safari_app.sh
```

---

## 🧪 Doğrulama ve Test Paketi

Kod tabanının bütünlüğünü ve 63 mimari kuralı doğrulamak için:

```bash
node scripts/verify_filmsync.js
```

Tüm testler (URL trailing slash, Netflix Cadmium API kuyruğu, XSS zırhı, clock skew senkronizasyonu vb.) 63/63 başarıyla geçer.

---

## 🗺️ Dizin Haritası

```
12-FilmSync/
├── .brain/                   # Kurumsal proje hafızası (Decisions, Lessons, Patterns, Context)
├── docs/                     # Sistem ve geliştirici dokümantasyonu
│   ├── ARCHITECTURE.md       # Master mimari ve senkronizasyon spesifikasyonu
│   ├── SETUP_GUIDE.md        # Sıfırdan kurulum ve anahtar yönetimi kılavuzu
│   ├── DEBUG_PROTOCOL.md     # Kök neden analizleri ve hata ayıklama protokolü
│   ├── index.html            # Web landing ve tanıtım sayfası
│   └── README.md             # Dokümantasyon fihristi
├── extension/                # Dağıtıma hazır Web Extension kaynak kodları (MV3)
│   ├── background.js         # Service worker (sekme takip, URL yetkisi, REST temizliği)
│   ├── content.js            # İstemci koordinatörü, sohbet podu ve senkronizasyon motoru
│   ├── inject.js             # Sayfa bağlamı (Netflix/Disney+) enjeksiyon betiği
│   ├── manifest.json         # Chrome MV3 manifestosu
│   ├── popup.html            # Neon cam efektli popup arayüzü
│   ├── popup.js              # Popup mantığı ve oda yöneticisi
│   └── libs/                 # Bağımsız Firebase istemci kütüphaneleri
├── database.rules.json       # Firebase Realtime DB güvenlik kuralları ve veri şeması
├── firebase.json             # Firebase CLI ayar dosyası
└── scripts/
    ├── build_safari_app.sh   # Safari Web Extension native paketleme betiği
    └── verify_filmsync.js    # 63 senaryolu regresyon ve doğrulama test paketi
```

---

## 📜 Lisans & Telif

Bu proje MIT lisansı ile korunmaktadır.
