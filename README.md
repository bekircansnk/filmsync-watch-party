# 🍿 Film Partisi (FilmSync) — Senkronize Video İzleme & Sohbet Ekosistemi

[![Web Portal & İndir](https://img.shields.io/badge/%F0%9F%8C%90%20Canl%C4%B1%20Web%20Portal%C4%B1-Eklentiyi%20%C4%B0ndir-ff3d47?style=for-the-badge)](https://bekircansnk.github.io/filmsync-watch-party/)
[![Doğrudan ZIP İndir](https://img.shields.io/badge/%F0%9F%93%A5%20Haz%C4%B1r%20Paket-film--partisi--extension.zip-2ed573?style=for-the-badge)](https://bekircansnk.github.io/filmsync-watch-party/film-partisi-extension.zip)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?style=for-the-badge&logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-1.3.0-red?style=for-the-badge)](./extension/manifest.json)
[![Tests Passing](https://img.shields.io/badge/Tests-67%2F67%20Passing-brightgreen?style=for-the-badge)](./scripts/verify_filmsync.js)

**Film Partisi (FilmSync)**, arkadaşlarınızla farklı cihaz ve tarayıcılarda uzaktan aynı anda **Netflix, YouTube, Amazon Prime Video, Disney+, HDFilmCehennemi, FullHDFilmizlesene, Dizipal** ve tüm HTML5 video sitelerinde eşzamanlı (0-gecikmeli) film ve dizi izlemenizi, sayfa üzerinde yüzen şık cam efektli (2026 Frosted Glass) dikey sohbet paneli üzerinden mesajlaşmanızı ve anlık emoji reaksiyonları fırlatmanızı sağlayan açık kaynaklı bir Web Uzantısıdır (Chrome, Brave, Edge & Safari).

---

## 📥 30 Saniyede Hızlı İndirme & Chrome Kurulumu (Kod Bilmeden)

Arkadaşlarınızla hemen film partisi başlatmak için Git veya kod indirmeye gerek yoktur:

1. **Paketi İndirin:**
   - 🌐 **[Canlı İndirme & Davet Portalını Açın](https://bekircansnk.github.io/filmsync-watch-party/)** veya doğrudan **[📥 `film-partisi-extension.zip` Paketini İndirin](./docs/film-partisi-extension.zip)**
2. **Klasöre Çıkartın:** İnen `film-partisi-extension.zip` dosyasını masaüstüne çıkartın.
3. **Tarayıcıya Ekleyin:**
   - Chrome / Edge / Brave adres çubuğuna `chrome://extensions` yazıp girin.
   - Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını açın.
   - Sol üstteki **Paketlenmemiş öğe yükle (Load unpacked)** butonuna tıklayıp çıkarttığınız klasörün içindeki **`extension`** klasörünü seçin.

---

## 🌐 GitHub Pages İndirme Sitesini Aktifleştirme (Repo Sahibi İçin)

Bu depoda otomatik GitHub Pages dağıtım iş akışı (`.github/workflows/deploy-pages.yml`) ve hazır `docs/film-partisi-extension.zip` paketi yer almaktadır. GitHub üzerinde web sitesini ve sağ üstteki tıklanabilir bağlantıyı açmak için:

1. GitHub deponuzda (`bekircansnk/filmsync-watch-party`) üst menüden **Settings (Ayarlar)** sekmesine girin.
2. Depo *Private (Özel)* ise en alttaki **Danger Zone → Change repository visibility → Make public** ile herkese açık yapın.
3. Sol menüden **Pages** sekmesine tıklayın; **Build and deployment → Source** kısmını **GitHub Actions** (veya **Deploy from a branch → `main` → `/docs`**) olarak seçin.
4. Deponun ana sayfasında sağ üstteki **About (Hakkında) ⚙️** çark simgesine tıklayıp **"Use your GitHub Pages website"** kutucuğunu işaretleyin ve kaydedin. Artık herkes doğrudan `https://bekircansnk.github.io/filmsync-watch-party/` adresinden eklentiyi indirebilir!

---

## 📑 Hızlı Belge ve Dokümantasyon Fihristi

- 🏛️ **[Detaylı Mimari & Sistem Hafızası Dokümanı](./docs/ARCHITECTURE.md)**: 5-katmanlı mimari, saat kayması (clock skew) formülleri, keyframe seek deadband ve güvenlik korumaları.
- 🚀 **[Geliştirici & Sıfırdan Kurulum Kılavuzu](./docs/SETUP_GUIDE.md)**: Projeyi klonlama, Firebase entegrasyonu ve geliştirici modunda çalıştırma.
- 🩺 **[Hata Teşhis ve Test Protokolü](./docs/DEBUG_PROTOCOL.md)**: Bilinen sorunlar, yarış durumu (race condition) tespiti ve oynatıcı zırhları.
- 📚 **[Dokümantasyon Ana İndeksi](./docs/README.md)**: Tüm teknik rehberler ve AI hafıza fihristi.

---

## ✨ Temel Özellikler (v1.3.0 Evrensel Mimari)

- **3-Katmanlı Klavye Kalkanı (Chat-First Anti-Mute):** Sayfa bağlamında (`EventTarget.prototype.addEventListener` sarmalayıcısı + `window` capture + cross-frame bridge) `Space` ve `Escape` hariç tüm tuşları (`M`, `F`, `K`, `J`, `L`, `C`, `0-9`) oynatıcıdan izole eder; film izlerken hiçbir tuş videoyu sessize almaz veya tam ekrandan çıkarmaz, doğrudan sohbete yazar.
- **Evrensel Iframe & Tam Ekran Koordinatörü:** `HTMLVideoElement.prototype.requestFullscreen` sarmalayıcısı ve `filmsync-iframe-fullscreen-request` köprüsü sayesinde HDFilmCehennemi, FullHDFilmizlesene, Dizipal gibi iç içe iframe oynatıcılarında ve TR Dublaj / TR Altyazı kaynak geçişlerinde sohbet podu tam ekranın içinde daima görünür kalır.
- **Herkese Açık Odalarda Co-Controller Bölüm Geçişi:** Herkese açık odalarda (`hostOnly: false`) odaya bağlı herkes yeni bölüme geçebilir; geçildiği anda odadaki herkese bildirim gider ve yeni bölüm senkronize başlatılır.
- **Canlı Açık Oda & Katılımcı Rehberi:** Popup içerisinde açık odalarda kaç kişi olduğu, katılımcıların isimleri, hangi platformun ve hangi film/bölüm başlığının açık olduğu anlık gösterilir.
- **0-Gecikmeli Eşitleme (Firebase RTDB):** Video akışı aktarılmaz; yalnızca oynatma durumu (play, pause, seek, URL) WebSocket üzerinden milisaniyeler içinde senkronize edilir.
- **Sentetik Web Audio Ses Efektleri:** Harici ses dosyası indirilmeden Web Audio API osilatörleri ile üretilen kibar mesaj ve bildirim sesleri.

---

## 🎯 Platform Uyumluluk Tablosu

| Platform | Uyumluluk | Entegrasyon Şekli | Özel Koruma & Notlar |
| :--- | :---: | :--- | :--- |
| **Netflix** | ✅ **%100** | `inject.js` (Cadmium API) | 1500ms Keyframe Seek Deadband, `getBusy()` çakışma önleyici, React Fiber Depth-35 fallback. |
| **YouTube** | ✅ **%100** | DOM + `.html5-video-player` | SPA `pushState` ve `yt-navigate-finish` olay yakalayıcıları, reklam/önizleme filtrelemesi. |
| **Amazon Prime Video** | ✅ **%100** | Shadow DOM + `inject.js` | Derin Shadow DOM video tarayıcısı ve tam ekran kapsayıcı yönlendirmesi. |
| **Disney+** | ✅ **%100** | `inject.js` + MediaPlayer | Kanonik film ID çözümlemesi ve fallback simülasyonu. |
| **HDFilmCehennemi & FullHDİzlesene** | ✅ **%100** | Nested Iframe + Fullscreen Bridge | TR Dublaj / Altyazı iframe değişimlerinde kesintisiz bağlantı ve tam ekran sohbet podu. |
| **Dizipal & Genel HTML5 Siteleri** | ✅ **%100** | Nested Iframe + Smart Video Scorer | Vidmoly, Rapidrame ve tüm HTML5 `<video>` etiketlerine 0ms doğrudan bağ. |

---

## 🧪 Doğrulama ve Paketleme

Eklenti ZIP paketini (`docs/film-partisi-extension.zip`) yeniden üretmek ve 67 senaryolu regresyon test paketini çalıştırmak için:

```bash
npm run build
```

---

## 📜 Lisans & Telif

Bu proje MIT lisansı ile korunmaktadır.
