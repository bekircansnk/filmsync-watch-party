# 🏛️ Film Partisi (FilmSync) — Master Mimari & Sistem Hafızası

---
title: "Film Partisi — Master Sistem ve Senkronizasyon Mimarisi"
document_type: "SYSTEM_ARCHITECTURE"
version: "1.2.0"
date: "2026-10-17"
audience: "AI_AGENT & DEVELOPER"
---

## 📌 1. Sistemin Amacı ve Kuruluş Felsefesi

**Film Partisi (FilmSync)**, kullanıcıların farklı cihaz ve tarayıcılarda uzaktaki arkadaşlarıyla Netflix, YouTube, Disney+, Dizipal, HDFilmCehennemi ve genel HTML5 video oynatıcıları üzerinden **eşzamanlı (0-gecikmeli) film ve dizi izlemesini**, sayfa üzerinde şık bir cam pod (frosted glass) aracılığıyla sohbet etmesini ve anlık emoji reaksiyonları paylaşmasını sağlayan **Manifest V3 tabanlı modern bir Web Extension** ekosistemidir.

Sistem, geleneksel ekran paylaşımı araçlarının (Discord, Zoom vb.) yarattığı yüksek bant genişliği tüketimi, telif/siyah ekran koruması (Widevine DRM) ve kare hızı düşüşü sorunlarını ortadan kaldırmak için **"Sıfır Video Aktarımı — Yalnızca Durum Senkronizasyonu"** paradigmasıyla inşa edilmiştir. Video her kullanıcının kendi tarayıcısında yerel olarak en yüksek kalitede oynatılır; Film Partisi ise oynatma durumu (play, pause, seek, url) ve sohbet/reaksiyon verilerini gerçek zamanlı olarak eşitler.

---

## 🧭 2. Yüksek Seviyeli Sistem Bileşenleri

FilmSync 5 temel katmandan meydana gelir:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           KULLANICI ARAYÜZÜ                             │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐  │
│  │     Popup Menüsü (popup.js)    │   │     Sohbet Podu (content.js)   │  │
│  │   - Oda Kur / Odaya Katıl     │   │   - 2026 Cam Frosted Glass    │  │
│  │   - Açık Odalar Rehberi       │   │   - Uçan Emoji Reaksiyonları  │  │
│  │   - Oda Sahibi (Host) Kilidi  │   │   - Çift-Escape Tam Ekran Kili│  │
│  │   - Avatar & Ses Efektleri    │   │   - Sentetik Web Audio Sesleri│  │
│  └───────────────┬───────────────┘   └───────────────┬───────────────┘  │
└──────────────────┼───────────────────────────────────┼──────────────────┘
                   │                                   │
┌──────────────────▼───────────────────────────────────▼──────────────────┐
│                   İÇERİK VE ENJEKSİYON KATMANI (DOM)                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Content Script (content.js - Isolated World)                     │  │
│  │  - all_frames: true (Nested iframe içi gerçek video tespiti)       │  │
│  │  - Drift Correction & Saat Kayması Düzelticisi (1.5s Tolerans)    │  │
│  │  - Play / Pause / Seek Dinleyici ve Olay Bastırıcı (Ping-Pong Def) │  │
│  └───────────────────────────────┬───────────────────────────────────┘  │
│                                  │ window.postMessage                   │
│  ┌───────────────────────────────▼───────────────────────────────────┐  │
│  │  Page Context Injector (inject.js - Main World)                   │  │
│  │  - Netflix Cadmium API (videoPlayer.play/pause/seek)              │  │
│  │  - React Fiber Fallback (Depth 35 traversal & memoizedProps)      │  │
│  │  - Disney+ MediaPlayer Kontrolleri                                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────────────────────┐
│                  ARKA PLAN SERVİSİ (SERVICE WORKER)                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Background Service Worker (background.js)                        │  │
│  │  - Sekme URL Takibi (chrome.tabs.onUpdated)                       │  │
│  │  - Yalnızca Host Kullanıcıya URL Yazma Yetkisi (Host Authority)   │  │
│  │  - Platform Bazlı Kanonik Film URL Normalizasyonu                 │  │
│  │  - Boş / Süresi Dolmuş Odaların REST API ile Temizliği            │  │
│  └───────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────────┘
                                   │ WebSocket / REST
┌──────────────────────────────────▼──────────────────────────────────────┐
│                    BULUT VE VERİTABANI KATMANI                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Firebase Realtime Database (RTDB)                                │  │
│  │  - rooms/<roomId>/lastState: { isPlaying, currentTime, url, ... } │  │
│  │  - rooms/<roomId>/users/<userId>: { username, avatar, lastActive }│  │
│  │  - rooms/<roomId>/messages: { username, message, timestamp }      │  │
│  │  - rooms/<roomId>/reactions: { emoji, senderId, timestamp }       │  │
│  │  - database.rules.json: XSS Korumalı Şema ve Doğrulama Kuralları  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 3. Platform Uyumluluk Matrisi (Detaylı Analiz)

Sistem hem yasal abonelik platformlarında hem de açık web video platformlarında çalışmak üzere tasarlanmıştır.

| Platform | Uyumluluk Durumu | Entegrasyon Yöntemi | Teknik Detaylar & Uygulanan Zırhlar |
| :--- | :--- | :--- | :--- |
| **Netflix** | **%100 Tam Uyumlu** | `inject.js` (Main World) + Cadmium API | - **1500ms Keyframe Seek Deadband:** Netflix keyframe atlamaları yüzünden 1.5 saniyenin altındaki mikro seek talepleri yutulur; döngüsel sekme önlenir.<br>- **FIFO Komut Kuyruğu:** Eşzamanlı seek ve pause komutları sıraya dizilir; siyah ekran ve çökme önlenir.<br>- **React Fiber Fallback (Depth 35):** API gecikirse DOM üzerindeki React Fiber ağacından oynatıcı bulunur.<br>- **Tek Seferlik Intro Atlama:** Tekrarlı `checkSkipSupplemental` döngüsü kırılmıştır. |
| **YouTube** | **%100 Tam Uyumlu** | DOM `<video>` + API | - `.html5-video-player` API'si ve standart HTML5 video dinleyicileri kullanılır.<br>- SPA geçişlerinde (`yt-navigate-finish`, `pushState`) oda durumu korunur ve yeni video algılanır. |
| **Disney+** | **%100 Tam Uyumlu** | `inject.js` + MediaPlayer | - `disneyplus.com/video/[ID]` kanonik URL'si oluşturulur.<br>- MediaPlayer ve fallback click simülasyonuyla senkronize edilir. |
| **Dizipal & HDFilmCehennemi** | **%100 Tam Uyumlu** | `all_frames: true` (Iframe) | - Bu sitelerde asıl oynatıcı (Vidmoly, Rapidrame, vb.) harici `<iframe>` içinde barınır.<br>- `manifest.json` içindeki `all_frames: true` sayesinde `content.js` iframe içine de enjekte olur, doğrudan iframe içindeki `<video>` elementini yakalar ve Firebase'e bağlar. |
| **Genel HTML5 Video Siteleri** | **%100 Tam Uyumlu** | Standart HTML5 Video | Sayfadaki `<video>` elementini otomatik tespit eder; play, pause, seek ve timeupdate olaylarını yakalar. |

### ⚠️ Uyumsuz veya Kısıtlı Olan Platformlar & Teknik Nedenleri:
1. **Canlı Yayınlar (Live Streams / HLS-DASH Dinamik Pencereli):**
   - *Durum:* Kısmen Uyumsuz.
   - *Neden:* Canlı yayınlarda sabit bir `duration` veya mutlak `currentTime` bulunmaz; zaman penceresi her saniye kayar. Bu nedenle geçmişe sarma veya ileri sarma senkronizasyonu mutlak zamanla yapılamaz.
2. **Korumalı Donanım DRM Pencereleri (Örn: Apple TV+, Prime Video Bazı Bölgeler):**
   - *Durum:* Dikkat Gerektirir.
   - *Neden:* Prime Video bazı tarayıcılarda donanım hızlandırmalı Widevine L1 kullanır; video üzerine enjekte edilen DOM katmanının arka plan filtresi (`backdrop-filter`) tarayıcı tarafından kısıtlanabilir. FilmSync, video container üzerine yerleşerek bu sorunu bypass eder.
3. **Çoklu Dil / Altyazı Seçimi:**
   - *Durum:* Bilerek Yalıtıldı (İzole).
   - *Neden:* Her kullanıcının ana dili farklı olabileceği için altyazı ve ses dili bilerek odaya senkronize edilmez; herkes kendi dilinde izler.

---

## ⚡ 4. Eşitleme ve Saat Algoritması (Zero-Drift Sync Engine)

1. **Saat Farkı (Clock Skew) Telafisi:**
   - İstemci ile sunucu arasındaki saat farkı Firebase `.info/serverTimeOffset` düğümünden milisaniye hassasiyetinde hesaplanır.
   - Durum hesaplanırken `now = Date.now() + serverTimeOffset` formülü kullanılır.
2. **Akıllı Drift Toleransı (Soft Drift vs Hard Seek):**
   - Sapma `< 1.5 saniye`: Doğal ağ gecikmesi kabul edilir, video zorla seek edilmez; ses kesintisi ve takılma engellenir.
   - Sapma `> 1.5 saniye`: Programatik seek çağrılır ve video tam saniyesine oturtulur.
3. **Ping-Pong ve Yankı Döngüsü Engelleme (Feedback Loop Breaker):**
   - Bir kullanıcı uzaktan gelen emirle `video.currentTime = remoteTime` yaptığında, bu işlem yerel bir `seeked` olayı tetikler.
   - `isRemoteAction = true` bayrağı ve 800ms'lik soğuma zamanlayıcısı devrededir; uzaktan gelen komut tekrar sunucuya fırlatılmaz.
4. **Host Otoritesi (Host Authority & Host Only Mode):**
   - Oda sahibi odadaki tek yetkili kılınabilir (`hostOnly: true`).
   - Yalnızca Host filmi duraklatabilir, sarabilir veya yeni filme geçebilir. Misafirler film URL'sini veya oynatma durumunu bozamaz.
5. **Hayalet Üye Temizliği (Ghost User Reaper):**
   - Her istemci 15 saniyede bir canlı kalma sinyali (`lastActive: Date.now()`) gönderir.
   - 45 saniyedir sinyal vermeyen, sekmesi kapanan veya uyuyan üyeler sistem tarafından otomatik düşürülür.

---

## 🎨 5. Arayüz & UX Mimarisi (2026 Frosted Glass)

1. **Çift-Escape Tam Ekran Koruması (`Double-Escape Fullscreen Guard`):**
   - Tam ekranda film izlerken `Escape` tuşuna basıldığında Chrome varsayılan olarak tam ekrandan çıkar.
   - FilmSync, `navigator.keyboard.lock(['Escape'])` API'sini devreye sokar.
   - İlk Escape basışında: Sadece sohbet paneli gizlenir, tam ekran BOZULMAZ.
   - 1000ms içinde ikinci kez Escape basılırsa: Kilit açılır ve tam ekrandan çıkılır.
2. **Chat-First Klavye Yakalayıcısı:**
   - Sohbet paneline yazarken `Space` tuşuna basıldığında videonun durması, `F`'ye basıldığında tam ekran olması engellenir (`stopPropagation`).
3. **Sentetik Ses Motoru (Web Audio API):**
   - Harici `.mp3` veya `.wav` dosyaları indirilmez; Web Audio API osilatörleri (`sine` & `triangle` dalgaları) ile yerel, hafif ve estetik tıklama/mesaj sesleri sentetik üretilir.
